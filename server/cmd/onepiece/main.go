package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/kylegrahammatzen/winter"
	"github.com/lmittmann/tint"

	"github.com/kgrahammatzen/onepiece-server/api"
	"github.com/kgrahammatzen/onepiece-server/config"
	"github.com/kgrahammatzen/onepiece-server/internal/auth"
	"github.com/kgrahammatzen/onepiece-server/internal/games"
	"github.com/kgrahammatzen/onepiece-server/internal/ingest"
	"github.com/kgrahammatzen/onepiece-server/store"
)

func main() {
	startup := time.Now()

	// .env is optional, real environments set the variables directly.
	_ = godotenv.Load(".env")

	cfg, err := config.Load()
	if err != nil {
		slog.Error("failed to load config", "error", err)
		os.Exit(1)
	}

	logger := newLogger(cfg.LogLevel, cfg.LogFormat)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	pool, err := store.NewPool(ctx, cfg.DatabaseURL, cfg.DBMaxConns)
	if err != nil {
		logger.Error("failed to connect to database", "error", err)
		os.Exit(1)
	}
	defer pool.Close()

	if err := store.RunMigrations(cfg.DatabaseURL, logger); err != nil {
		logger.Error("failed to run migrations", "error", err)
		os.Exit(1)
	}

	jwks := auth.NewJWKSStore(pool, logger)
	if err := jwks.Load(ctx); err != nil {
		logger.Warn("jwks initial load failed, will retry on schedule", "error", err)
	}
	go jwks.StartRefresh(ctx, 5*time.Minute)

	clueEngine := games.NewClueEngine(pool)
	wordleEngine := games.NewWordleEngine(pool)
	engines := map[string]games.GameEngine{
		clueEngine.GameID():   clueEngine,
		wordleEngine.GameID(): wordleEngine,
	}

	startWinter(ctx, cfg, pool, logger, []games.GameEngine{clueEngine, wordleEngine})

	router := api.NewRouter(api.RouterConfig{
		Pool:    pool,
		JWKS:    jwks,
		Logger:  logger,
		WebURL:  cfg.WebURL,
		Engines: engines,
	})

	srv := &http.Server{
		Addr:              fmt.Sprintf(":%d", cfg.Port),
		Handler:           router,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      60 * time.Second,
		IdleTimeout:       120 * time.Second,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		sigCh := make(chan os.Signal, 1)
		signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
		<-sigCh

		logger.Info("shutting down")
		cancel()

		shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer shutdownCancel()

		if err := srv.Shutdown(shutdownCtx); err != nil {
			logger.Error("server shutdown error", "error", err)
		}
	}()

	logger.Info("server starting", "port", cfg.Port, "elapsed", time.Since(startup).Round(time.Millisecond).String())
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		logger.Error("server error", "error", err)
		os.Exit(1)
	}
}

// startWinter brings up one Redis backed Winter server that owns puzzle generation and, when enabled, ingestion.
// Redis being unavailable disables background jobs but never takes the API down.
func startWinter(ctx context.Context, cfg *config.Config, pool *pgxpool.Pool, logger *slog.Logger, engines []games.GameEngine) {
	redisCfg := winter.RedisConfig{Addr: cfg.RedisAddr}

	client, err := winter.NewClient(redisCfg)
	if err != nil {
		logger.Error("redis unavailable, background jobs disabled", "error", err)
		return
	}

	puzzleOpts := games.PuzzleWinterOptions{
		Cron:         cfg.PuzzleCron,
		BackfillDays: cfg.PuzzleBackfillDays,
		Engines:      engines,
	}
	ingestOpts := ingest.WinterOptions{
		CrawlEnabled:       cfg.AniListCrawlEnabled,
		JikanEnabled:       cfg.JikanEnabled,
		AniListCron:        cfg.AniListCron,
		AniListPages:       cfg.AniListPages,
		AniListRPM:         cfg.AniListRPM,
		AniListRelationIDs: cfg.AniListRelationIDs,
		JikanCron:          cfg.JikanCron,
		JikanBatch:         cfg.JikanBatch,
		JikanRPM:           cfg.JikanRPM,
		JikanPerSecond:     cfg.JikanPerSecond,
	}

	cron := games.WinterCron(puzzleOpts)
	queues := []any{"puzzle", 2}
	if cfg.IngestEmbedded {
		cron = append(cron, ingest.WinterCron(ingestOpts)...)
		queues = append(queues, "anilist", 3, "jikan", 1)
	}

	server, err := winter.NewServer(redisCfg, winter.ServerConfig{
		Concurrency: cfg.IngestConcurrency,
		Logger:      newLogger("warn", cfg.LogFormat),
		Queues:      winter.Queues(queues...),
		Cron:        cron,
	})
	if err != nil {
		logger.Error("failed to start winter server", "error", err)
		_ = client.Close()
		return
	}

	games.RegisterWinter(ctx, server, client, pool, logger, puzzleOpts)
	if cfg.IngestEmbedded {
		ingest.RegisterWinter(ctx, server, client, pool, logger, ingestOpts)
	}
	server.Use(winter.Recover())
	server.OnDead(func(_ context.Context, ev winter.JobEvent) {
		logger.Error("background job dead", "kind", ev.Kind, "job_id", ev.ID, "error", ev.Err)
	})

	go func() {
		if err := server.Start(); err != nil {
			logger.Error("winter server stopped", "error", err)
		}
	}()
	go func() {
		<-ctx.Done()
		server.Stop()
		_ = client.Close()
	}()

	logger.Info("winter started", "redis", cfg.RedisAddr, "puzzle_cron", cfg.PuzzleCron, "ingest_embedded", cfg.IngestEmbedded)
}

func newLogger(level, format string) *slog.Logger {
	lvl := slog.LevelInfo
	switch level {
	case "debug":
		lvl = slog.LevelDebug
	case "warn":
		lvl = slog.LevelWarn
	case "error":
		lvl = slog.LevelError
	}

	var h slog.Handler
	if format == "text" {
		h = tint.NewHandler(os.Stdout, &tint.Options{
			Level:      lvl,
			TimeFormat: time.Kitchen,
		})
	} else {
		h = slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: lvl})
	}
	return slog.New(h)
}

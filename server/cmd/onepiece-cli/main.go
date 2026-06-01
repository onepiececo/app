package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"log/slog"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	_ "github.com/joho/godotenv/autoload"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lmittmann/tint"

	"github.com/kgrahammatzen/onepiece-server/config"
	"github.com/kgrahammatzen/onepiece-server/internal/ingest"
	"github.com/kgrahammatzen/onepiece-server/store"
)

func main() {
	if len(os.Args) < 2 {
		usage()
		os.Exit(2)
	}

	logger := slog.New(tint.NewHandler(os.Stdout, &tint.Options{
		Level:      slog.LevelInfo,
		TimeFormat: time.Kitchen,
	}))

	cfg, err := config.Load()
	if err != nil {
		logger.Error("failed to load config", "error", err)
		os.Exit(1)
	}

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	switch os.Args[1] {
	case "ingest":
		runIngest(ctx, cfg, logger, os.Args[2:])
	default:
		usage()
		os.Exit(2)
	}
}

func runIngest(ctx context.Context, cfg *config.Config, logger *slog.Logger, args []string) {
	fs := flag.NewFlagSet("ingest", flag.ExitOnError)
	once := fs.Bool("once", false, "run one pass of every source then exit")

	anilistPages := fs.Int("anilist-pages", 5, "AniList max pages per pass, 1 page = up to 50 anime")
	anilistRPM := fs.Int("anilist-rpm", 25, "AniList requests per minute, keep under 30")
	anilistInterval := fs.Duration("anilist-interval", time.Hour, "AniList sleep between passes")

	jikanBatch := fs.Int("jikan-batch", 50, "Jikan candidates per pass")
	jikanRPM := fs.Int("jikan-rpm", 60, "Jikan requests per minute, caps at 60")
	jikanPerSec := fs.Int("jikan-per-sec", 3, "Jikan requests per second hard cap, caps at 3")
	jikanInterval := fs.Duration("jikan-interval", 30*time.Minute, "Jikan sleep between passes")

	if err := fs.Parse(args); err != nil {
		os.Exit(2)
	}

	pool := connectPool(ctx, cfg, logger)
	defer pool.Close()

	anilistRun := func() error {
		return ingest.RunAniListOnce(ctx, pool, logger, ingest.AniListRunOptions{
			PerPage:  50,
			MaxPages: *anilistPages,
			RPMLimit: *anilistRPM,
		})
	}

	jikanRun := func() error {
		return ingest.RunJikanOnce(ctx, pool, logger, ingest.JikanRunOptions{
			Batch:     *jikanBatch,
			RPMLimit:  *jikanRPM,
			PerSecond: *jikanPerSec,
		})
	}

	if *once {
		if err := anilistRun(); err != nil {
			logger.Error("anilist run failed", "error", err)
		}
		if err := jikanRun(); err != nil {
			logger.Error("jikan run failed", "error", err)
		}
		return
	}

	var wg sync.WaitGroup
	wg.Add(2)
	go func() {
		defer wg.Done()
		loopForever(ctx, logger, "anilist", *anilistInterval, anilistRun)
	}()
	go func() {
		defer wg.Done()
		loopForever(ctx, logger, "jikan", *jikanInterval, jikanRun)
	}()
	wg.Wait()
}

// loopForever runs fn once, exits if interval is zero, otherwise sleeps and repeats until ctx cancels.
func loopForever(ctx context.Context, logger *slog.Logger, source string, interval time.Duration, fn func() error) {
	for {
		err := fn()
		if err != nil && !errors.Is(err, context.Canceled) {
			logger.Error(source+" run failed", "error", err)
		}

		if interval <= 0 {
			return
		}

		logger.Info(source+" sleeping until next run", "interval", interval.String())
		select {
		case <-ctx.Done():
			logger.Info(source + " loop exiting on signal")
			return
		case <-time.After(interval):
		}
	}
}

func connectPool(ctx context.Context, cfg *config.Config, logger *slog.Logger) *pgxpool.Pool {
	pool, err := store.NewPool(ctx, cfg.DatabaseURL, cfg.DBMaxConns)
	if err != nil {
		logger.Error("db connect failed", "error", err)
		os.Exit(1)
	}
	cc := pool.Config().ConnConfig
	logger.Info("postgres connected", "host", fmt.Sprintf("%s:%d", cc.Host, cc.Port), "db", cc.Database)
	return pool
}

func usage() {
	fmt.Fprintln(os.Stderr, "usage: onepiece-cli <command> [args]")
	fmt.Fprintln(os.Stderr, "commands:")
	fmt.Fprintln(os.Stderr, "  ingest [--once] [--anilist-* ...] [--jikan-* ...]")
	fmt.Fprintln(os.Stderr, "")
	fmt.Fprintln(os.Stderr, "default loops forever, AniList every hour, Jikan every 30 minutes")
	fmt.Fprintln(os.Stderr, "pass --once for a single pass of each source, Ctrl+C exits cleanly")
}

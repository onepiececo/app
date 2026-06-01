package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"log/slog"
	"os"
	"os/signal"
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
		if len(os.Args) < 3 {
			usage()
			os.Exit(2)
		}
		switch os.Args[2] {
		case "anilist":
			runIngestAniList(ctx, cfg, logger, os.Args[3:])
		case "jikan":
			runIngestJikan(ctx, cfg, logger, os.Args[3:])
		default:
			fmt.Fprintf(os.Stderr, "unknown ingest source: %s\n", os.Args[2])
			usage()
			os.Exit(2)
		}
	default:
		usage()
		os.Exit(2)
	}
}

func runIngestAniList(ctx context.Context, cfg *config.Config, logger *slog.Logger, args []string) {
	fs := flag.NewFlagSet("ingest anilist", flag.ExitOnError)
	pages := fs.Int("pages", 5, "max pages to crawl per iteration (1 page = up to 50 anime)")
	rpm := fs.Int("rpm", 25, "requests per minute, keep under 30")
	perPage := fs.Int("per-page", 50, "items per page, max 50")
	interval := fs.Duration("interval", 0, "if set, loop forever sleeping this duration between iterations, e.g. 1h or 30m")
	if err := fs.Parse(args); err != nil {
		os.Exit(2)
	}

	pool := connectPool(ctx, cfg, logger)
	defer pool.Close()

	run := func() error {
		return ingest.RunAniListOnce(ctx, pool, logger, ingest.AniListRunOptions{
			PerPage:  *perPage,
			MaxPages: *pages,
			RPMLimit: *rpm,
		})
	}

	loopForever(ctx, logger, "anilist", *interval, run)
}

func runIngestJikan(ctx context.Context, cfg *config.Config, logger *slog.Logger, args []string) {
	fs := flag.NewFlagSet("ingest jikan", flag.ExitOnError)
	batch := fs.Int("batch", 50, "candidates to enrich per iteration")
	rpm := fs.Int("rpm", 60, "requests per minute, Jikan caps at 60")
	perSec := fs.Int("per-sec", 3, "requests per second, Jikan caps at 3")
	interval := fs.Duration("interval", 0, "if set, loop forever sleeping this duration between iterations")
	if err := fs.Parse(args); err != nil {
		os.Exit(2)
	}

	pool := connectPool(ctx, cfg, logger)
	defer pool.Close()

	run := func() error {
		return ingest.RunJikanOnce(ctx, pool, logger, ingest.JikanRunOptions{
			Batch:     *batch,
			RPMLimit:  *rpm,
			PerSecond: *perSec,
		})
	}

	loopForever(ctx, logger, "jikan", *interval, run)
}

// loopForever runs fn once, exits if interval is zero, otherwise sleeps and repeats until ctx cancels.
func loopForever(ctx context.Context, logger *slog.Logger, source string, interval time.Duration, fn func() error) {
	for {
		err := fn()
		if err != nil && !errors.Is(err, context.Canceled) {
			logger.Error(source+" run failed", "error", err)
			if interval <= 0 {
				os.Exit(1)
			}
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
	fmt.Fprintln(os.Stderr, "  ingest anilist [--pages N] [--rpm N] [--per-page N] [--interval D]")
	fmt.Fprintln(os.Stderr, "  ingest jikan   [--batch N] [--rpm N] [--per-sec N] [--interval D]")
	fmt.Fprintln(os.Stderr, "")
	fmt.Fprintln(os.Stderr, "with --interval set (e.g. 1h, 30m, 24h) the command loops forever, Ctrl+C exits cleanly")
}

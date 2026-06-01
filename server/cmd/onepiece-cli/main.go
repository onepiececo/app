package main

import (
	"context"
	"flag"
	"fmt"
	"log/slog"
	"os"
	"time"

	_ "github.com/joho/godotenv/autoload"
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

	ctx := context.Background()

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
	pages := fs.Int("pages", 5, "max pages to crawl (1 page = up to 50 anime)")
	rpm := fs.Int("rpm", 25, "requests per minute, keep under 30")
	perPage := fs.Int("per-page", 50, "items per page, max 50")
	if err := fs.Parse(args); err != nil {
		os.Exit(2)
	}

	pool, err := store.NewPool(ctx, cfg.DatabaseURL, cfg.DBMaxConns)
	if err != nil {
		logger.Error("db connect failed", "error", err)
		os.Exit(1)
	}
	defer pool.Close()

	if err := ingest.RunAniListOnce(ctx, pool, logger, ingest.AniListRunOptions{
		PerPage:  *perPage,
		MaxPages: *pages,
		RPMLimit: *rpm,
	}); err != nil {
		logger.Error("anilist run failed", "error", err)
		os.Exit(1)
	}
}

func runIngestJikan(ctx context.Context, cfg *config.Config, logger *slog.Logger, args []string) {
	fs := flag.NewFlagSet("ingest jikan", flag.ExitOnError)
	batch := fs.Int("batch", 50, "candidates to enrich in this run")
	rpm := fs.Int("rpm", 60, "requests per minute, Jikan caps at 60")
	perSec := fs.Int("per-sec", 3, "requests per second, Jikan caps at 3")
	if err := fs.Parse(args); err != nil {
		os.Exit(2)
	}

	pool, err := store.NewPool(ctx, cfg.DatabaseURL, cfg.DBMaxConns)
	if err != nil {
		logger.Error("db connect failed", "error", err)
		os.Exit(1)
	}
	defer pool.Close()

	if err := ingest.RunJikanOnce(ctx, pool, logger, ingest.JikanRunOptions{
		Batch:     *batch,
		RPMLimit:  *rpm,
		PerSecond: *perSec,
	}); err != nil {
		logger.Error("jikan run failed", "error", err)
		os.Exit(1)
	}
}

func usage() {
	fmt.Fprintln(os.Stderr, "usage: onepiece-cli <command> [args]")
	fmt.Fprintln(os.Stderr, "commands:")
	fmt.Fprintln(os.Stderr, "  ingest anilist [--pages N] [--rpm N] [--per-page N]")
	fmt.Fprintln(os.Stderr, "  ingest jikan   [--batch N] [--rpm N] [--per-sec N]")
}

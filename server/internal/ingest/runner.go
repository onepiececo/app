package ingest

import (
	"context"
	"errors"
	"log/slog"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kgrahammatzen/onepiece-server/internal/anime"
)

// AniListRunOptions controls how much to ingest in a single pass.
type AniListRunOptions struct {
	PerPage  int           // AniList items per page, max 50
	MaxPages int           // hard cap so we don't crawl forever
	RPMLimit int           // requests per minute, stay safely under 30 (degraded cap)
}

// RunAniListOnce pulls AniList by popularity until HasNextPage is false or MaxPages is hit.
// Throttles to RPMLimit, retries on RateLimitError.
func RunAniListOnce(ctx context.Context, pool *pgxpool.Pool, logger *slog.Logger, opts AniListRunOptions) error {
	if opts.PerPage <= 0 || opts.PerPage > 50 {
		opts.PerPage = 50
	}
	if opts.MaxPages <= 0 {
		opts.MaxPages = 20
	}
	if opts.RPMLimit <= 0 {
		opts.RPMLimit = 25
	}

	client := NewAniListClient()
	store := anime.NewStore(pool)

	gap := time.Minute / time.Duration(opts.RPMLimit)
	ticker := time.NewTicker(gap)
	defer ticker.Stop()

	logger.Info("anilist ingest started", "per_page", opts.PerPage, "max_pages", opts.MaxPages, "rpm", opts.RPMLimit)

	page := 1
	upserted := 0
	for page <= opts.MaxPages {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
		}

		res, err := client.FetchPage(ctx, page, opts.PerPage)
		if err != nil {
			var rl RateLimitError
			if errors.As(err, &rl) {
				logger.Warn("anilist rate limited", "retry_after", rl.RetryAfter, "page", page)
				select {
				case <-ctx.Done():
					return ctx.Err()
				case <-time.After(rl.RetryAfter):
				}
				continue
			}
			logger.Error("anilist fetch failed", "page", page, "error", err)
			return err
		}

		for _, m := range res.Items {
			u := toUpsert(m)
			if _, err := store.Upsert(ctx, u); err != nil {
				logger.Warn("anime upsert failed", "anilist_id", m.ID, "title", u.TitlePrimary, "error", err)
				continue
			}
			upserted++
		}

		logger.Info("anilist page done", "page", page, "rows", len(res.Items), "total_upserted", upserted)

		if !res.HasNextPage {
			break
		}
		page++
	}

	if err := store.ApplyAliasOverrides(ctx); err != nil {
		logger.Warn("alias overrides failed", "error", err)
	}

	logger.Info("anilist ingest finished", "pages", page, "upserted", upserted)
	return nil
}

// StartAniListSchedule kicks off the first run 30s after boot, then every interval.
func StartAniListSchedule(ctx context.Context, pool *pgxpool.Pool, logger *slog.Logger, interval time.Duration, opts AniListRunOptions) {
	go func() {
		select {
		case <-ctx.Done():
			return
		case <-time.After(30 * time.Second):
		}

		for {
			if err := RunAniListOnce(ctx, pool, logger, opts); err != nil && !errors.Is(err, context.Canceled) {
				logger.Error("anilist scheduled run failed", "error", err)
			}

			select {
			case <-ctx.Done():
				return
			case <-time.After(interval):
			}
		}
	}()
}

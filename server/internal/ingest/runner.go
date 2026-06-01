package ingest

import (
	"context"
	"errors"
	"log/slog"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kgrahammatzen/onepiece-server/internal/anime"
)

func itoa(n int) string { return strconv.Itoa(n) }

// AniListRunOptions controls how much to ingest in a single pass.
type AniListRunOptions struct {
	// PerPage is AniList items per page. Max 50.
	PerPage int
	// MaxPages is a hard cap so we don't crawl forever.
	MaxPages int
	// RPMLimit is requests per minute. Stay safely under 30, the degraded cap.
	RPMLimit int
}

// RunAniListOnce pulls AniList by popularity until HasNextPage is false or MaxPages is hit.
// Throttles to RPMLimit, retries on RateLimitError.
// Every page's raw payload lands in source_payloads, every anime is linked via source_id_map.
func RunAniListOnce(ctx context.Context, pool *pgxpool.Pool, logger *slog.Logger, opts AniListRunOptions) (runErr error) {
	if opts.PerPage <= 0 || opts.PerPage > 50 {
		opts.PerPage = 50
	}
	if opts.MaxPages <= 0 {
		opts.MaxPages = 20
	}
	if opts.RPMLimit <= 0 {
		opts.RPMLimit = 25
	}

	run, err := StartRun(ctx, pool, "anilist", "catalog")
	if err != nil {
		return err
	}
	defer func() { _ = run.Finish(ctx, pool, runErr) }()

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

		logger.Info("anilist fetch", "page", page, "per_page", opts.PerPage, "url", anilistEndpoint)
		fetchStart := time.Now()
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
		logger.Info("anilist fetched", "page", page, "rows", len(res.Items), "elapsed", time.Since(fetchStart).Round(time.Millisecond).String())

		for _, m := range res.Items {
			sourceID := itoa(m.ID)
			if _, err := SavePayload(ctx, pool, "anilist", sourceID, m); err != nil {
				logger.Warn("save payload failed", "anilist_id", m.ID, "error", err)
				continue
			}
			u := toUpsert(m)
			animeID, err := store.Upsert(ctx, u)
			if err != nil {
				logger.Warn("anime upsert failed", "anilist_id", m.ID, "title", u.TitlePrimary, "error", err)
				continue
			}
			if err := MapExternalID(ctx, pool, "anilist", sourceID, animeID); err != nil {
				logger.Warn("map external id failed", "anilist_id", m.ID, "error", err)
				continue
			}
			upserted++
		}

		_ = run.Bump(ctx, pool, len(res.Items), upserted, map[string]int{"page": page})
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

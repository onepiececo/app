package ingest

import (
	"context"
	"errors"
	"log/slog"
	"strconv"
	"sync"
	"sync/atomic"
	"time"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kgrahammatzen/onepiece-server/internal/anime"
)

// ingestWorkers caps concurrent record upserts per page so a page pipelines through several connections at once.
const ingestWorkers = 5

// upsertMaxAttempts retries an upsert that loses a deadlock against a record sharing a studio, genre, or tag row.
const upsertMaxAttempts = 4

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
	pagesDone := 0
	upserted := 0
	for page <= opts.MaxPages {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
		}

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
		fetchElapsed := time.Since(fetchStart).Round(time.Millisecond)

		var pageUp atomic.Int64
		var wg sync.WaitGroup
		sem := make(chan struct{}, ingestWorkers)
	dispatch:
		for _, m := range res.Items {
			select {
			case <-ctx.Done():
				break dispatch
			case sem <- struct{}{}:
			}
			wg.Add(1)
			go func(m anilistMedia) {
				defer wg.Done()
				defer func() { <-sem }()
				if processItem(ctx, pool, store, logger, m) {
					pageUp.Add(1)
				}
			}(m)
		}
		wg.Wait()
		upserted += int(pageUp.Load())

		pagesDone++
		_ = run.Bump(ctx, pool, len(res.Items), upserted, map[string]int{"page": page})
		logger.Info("anilist page", "page", page, "rows", len(res.Items), "fetch_ms", fetchElapsed.Milliseconds(), "total_upserted", upserted)

		if !res.HasNextPage {
			break
		}
		page++
	}

	if err := store.ApplyAliasOverrides(ctx); err != nil {
		logger.Warn("alias overrides failed", "error", err)
	}

	logger.Info("anilist ingest finished", "pages", pagesDone, "upserted", upserted)
	return nil
}

// processItem saves the raw payload, upserts the anime, and links its external id. Returns whether the anime was written.
func processItem(ctx context.Context, pool *pgxpool.Pool, store *anime.Store, logger *slog.Logger, m anilistMedia) bool {
	sourceID := itoa(m.ID)
	if _, err := SavePayload(ctx, pool, "anilist", sourceID, m); err != nil {
		logger.Warn("save payload failed", "anilist_id", m.ID, "error", err)
		return false
	}
	u := toUpsert(m)
	animeID, err := upsertWithRetry(ctx, store, u)
	if err != nil {
		logger.Warn("anime upsert failed", "anilist_id", m.ID, "title", u.TitlePrimary, "error", err)
		return false
	}
	if err := MapExternalID(ctx, pool, "anilist", sourceID, animeID); err != nil {
		logger.Warn("map external id failed", "anilist_id", m.ID, "error", err)
		return false
	}
	return true
}

func upsertWithRetry(ctx context.Context, store *anime.Store, u *anime.AnimeUpsert) (int64, error) {
	var lastErr error
	for attempt := range upsertMaxAttempts {
		id, err := store.Upsert(ctx, u)
		if err == nil {
			return id, nil
		}
		if !isSerializationConflict(err) {
			return 0, err
		}
		lastErr = err
		select {
		case <-ctx.Done():
			return 0, ctx.Err()
		case <-time.After(time.Duration(attempt+1) * 10 * time.Millisecond):
		}
	}
	return 0, lastErr
}

// isSerializationConflict reports a Postgres deadlock or serialization failure, both safe to retry on a fresh transaction.
func isSerializationConflict(err error) bool {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		return pgErr.Code == "40P01" || pgErr.Code == "40001"
	}
	return false
}


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

// anilistMu serializes AniList access so a duplicate or overlapping pass never doubles the request rate.
var anilistMu sync.Mutex

// AniListRunOptions controls how much to ingest in a single pass.
type AniListRunOptions struct {
	// PerPage is AniList items per page. Max 50.
	PerPage int
	// MaxPages is a hard cap so we don't crawl forever.
	MaxPages int
	// RPMLimit is requests per minute. Stay safely under 30, the degraded cap.
	RPMLimit int
}

// RunAniListOnce crawls AniList by popularity into source_payloads and the catalog, throttled to RPMLimit and retrying rate limits.
func RunAniListOnce(ctx context.Context, pool *pgxpool.Pool, logger *slog.Logger, opts AniListRunOptions) (runErr error) {
	anilistMu.Lock()
	defer anilistMu.Unlock()

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

		upserted += upsertMedia(ctx, pool, store, logger, res.Items)

		pagesDone++
		_ = run.Bump(ctx, pool, len(res.Items), upserted, map[string]int{"page": page})
		logger.Debug("anilist page", "page", page, "rows", len(res.Items), "fetch_ms", fetchElapsed.Milliseconds(), "total_upserted", upserted)

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

// upsertMedia writes a batch of records through a bounded worker pool.
func upsertMedia(ctx context.Context, pool *pgxpool.Pool, store *anime.Store, logger *slog.Logger, items []anilistMedia) int {
	var done atomic.Int64
	var wg sync.WaitGroup
	sem := make(chan struct{}, ingestWorkers)
dispatch:
	for _, m := range items {
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
				done.Add(1)
			}
		}(m)
	}
	wg.Wait()
	return int(done.Load())
}

// processItem saves the raw payload, upserts the anime, and links its external id.
func processItem(ctx context.Context, pool *pgxpool.Pool, store *anime.Store, logger *slog.Logger, m anilistMedia) bool {
	sourceID := strconv.Itoa(m.ID)
	if _, err := SavePayload(ctx, pool, "anilist", sourceID, m); err != nil {
		if !errors.Is(err, context.Canceled) {
			logger.Warn("save payload failed", "anilist_id", m.ID, "error", err)
		}
		return false
	}
	u := toUpsert(m)
	animeID, err := upsertWithRetry(ctx, store, logger, m.ID, u)
	if err != nil {
		if !errors.Is(err, context.Canceled) {
			logger.Warn("anime upsert failed", "anilist_id", m.ID, "title", u.TitlePrimary, "error", err)
		}
		return false
	}
	if err := MapExternalID(ctx, pool, "anilist", sourceID, animeID); err != nil {
		if !errors.Is(err, context.Canceled) {
			logger.Warn("map external id failed", "anilist_id", m.ID, "error", err)
		}
		return false
	}
	return true
}

func upsertWithRetry(ctx context.Context, store *anime.Store, logger *slog.Logger, anilistID int, u *anime.AnimeUpsert) (int64, error) {
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
		logger.Debug("upsert retry on conflict", "anilist_id", anilistID, "attempt", attempt+1, "error", err)
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

// AniListRelationOptions controls a relation backfill pass.
type AniListRelationOptions struct {
	// MaxIDs caps how many missing related ids one run resolves, zero drains the whole backlog.
	MaxIDs int
	// RPMLimit is requests per minute, the same budget the catalog crawl uses.
	RPMLimit int
}

// RunAniListRelationsOnce backfills related anime that existing records reference but the catalog is missing, before the popularity crawl.
func RunAniListRelationsOnce(ctx context.Context, pool *pgxpool.Pool, logger *slog.Logger, opts AniListRelationOptions) (runErr error) {
	anilistMu.Lock()
	defer anilistMu.Unlock()

	if opts.RPMLimit <= 0 {
		opts.RPMLimit = 25
	}

	// MaxIDs of zero drains the whole backlog in one run so a single pass clears it rather than chipping off a fixed batch per cron tick.
	ids, err := MissingRelationIDs(ctx, pool, opts.MaxIDs)
	if err != nil {
		return err
	}
	if len(ids) == 0 {
		logger.Debug("anilist relations, none missing")
		return nil
	}

	run, err := StartRun(ctx, pool, "anilist", "relations")
	if err != nil {
		return err
	}
	defer func() { _ = run.Finish(ctx, pool, runErr) }()

	client := NewAniListClient()
	store := anime.NewStore(pool)

	gap := time.Minute / time.Duration(opts.RPMLimit)
	ticker := time.NewTicker(gap)
	defer ticker.Stop()

	logger.Info("anilist relations started", "backlog", len(ids), "rpm", opts.RPMLimit)

	upserted := 0
	processed := 0
	for _, batch := range chunkInts(ids, 50) {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
		}

		media, err := fetchByIDsRetry(ctx, client, logger, batch)
		if err != nil {
			if !errors.Is(err, context.Canceled) {
				logger.Error("anilist relations fetch failed", "error", err)
			}
			return err
		}
		processed += len(batch)
		upserted += upsertMedia(ctx, pool, store, logger, media)
		_ = run.Bump(ctx, pool, len(media), upserted, map[string]int{"remaining": len(ids) - processed})
		logger.Debug("anilist relations batch", "found", len(media), "processed", processed, "backlog", len(ids), "total_upserted", upserted)
	}

	logger.Info("anilist relations finished", "upserted", upserted, "attempted", processed)
	return nil
}

// fetchByIDsRetry resolves a batch of ids, waiting out a rate limit and retrying the same batch.
func fetchByIDsRetry(ctx context.Context, client *AniListClient, logger *slog.Logger, ids []int) ([]anilistMedia, error) {
	for {
		media, err := client.FetchByIDs(ctx, ids)
		if err == nil {
			return media, nil
		}
		var rl RateLimitError
		if !errors.As(err, &rl) {
			return nil, err
		}
		logger.Warn("anilist rate limited", "retry_after", rl.RetryAfter, "job", "relations")
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		case <-time.After(rl.RetryAfter):
		}
	}
}

func chunkInts(ids []int, size int) [][]int {
	var out [][]int
	for i := 0; i < len(ids); i += size {
		out = append(out, ids[i:min(i+size, len(ids))])
	}
	return out
}

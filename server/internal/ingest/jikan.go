package ingest

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kgrahammatzen/onepiece-server/internal/anime"
)

const jikanBase = "https://api.jikan.moe/v4"

type JikanClient struct {
	HTTP *http.Client
}

func NewJikanClient() *JikanClient {
	return &JikanClient{HTTP: &http.Client{Timeout: 30 * time.Second}}
}

type jikanAnimeRaw struct {
	MalID         int      `json:"mal_id"`
	URL           string   `json:"url"`
	Title         string   `json:"title"`
	Rank          *int     `json:"rank"`
	Members       *int     `json:"members"`
	TitleSynonyms []string `json:"title_synonyms"`
}

type jikanFullRaw struct {
	Data jikanAnimeRaw `json:"data"`
}

func (c *JikanClient) FetchFull(ctx context.Context, malID int) (*jikanAnimeRaw, error) {
	url := fmt.Sprintf("%s/anime/%d/full", jikanBase, malID)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("accept", "application/json")

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusTooManyRequests {
		return nil, RateLimitError{RetryAfter: time.Second * 60}
	}
	if resp.StatusCode == http.StatusNotFound {
		return nil, ErrNotFound
	}
	if resp.StatusCode >= 400 {
		raw, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("jikan %d: %s", resp.StatusCode, string(raw))
	}

	var parsed jikanFullRaw
	if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
		return nil, err
	}
	return &parsed.Data, nil
}

var ErrNotFound = errors.New("not found")

type JikanRunOptions struct {
	// Batch is how many anime to enrich per run.
	Batch int
	// RPMLimit is requests per minute. Jikan documents 60.
	RPMLimit int
	// PerSecond is the requests per second hard cap. Jikan documents 3.
	PerSecond int
	// MaxAge re enriches if the existing payload is older than this.
	MaxAge time.Duration
}

// RunJikanOnce enriches anime that have an AniList captured payload with idMal,
// where the Jikan payload is missing or older than MaxAge.
func RunJikanOnce(ctx context.Context, pool *pgxpool.Pool, logger *slog.Logger, opts JikanRunOptions) (runErr error) {
	if opts.Batch <= 0 {
		opts.Batch = 100
	}
	if opts.RPMLimit <= 0 {
		opts.RPMLimit = 60
	}
	if opts.PerSecond <= 0 {
		opts.PerSecond = 3
	}
	if opts.MaxAge <= 0 {
		opts.MaxAge = 30 * 24 * time.Hour
	}

	run, err := StartRun(ctx, pool, "jikan", "enrich")
	if err != nil {
		return err
	}
	defer func() { _ = run.Finish(ctx, pool, runErr) }()

	candidates, err := AnimeForJikanEnrichment(ctx, pool, opts.Batch, opts.MaxAge)
	if err != nil {
		return err
	}
	if len(candidates) == 0 {
		logger.Info("jikan enrich, nothing to do")
		return nil
	}

	client := NewJikanClient()
	minute := time.Minute / time.Duration(opts.RPMLimit)
	second := time.Second / time.Duration(opts.PerSecond)
	gap := max(minute, second)
	ticker := time.NewTicker(gap)
	defer ticker.Stop()

	logger.Info("jikan enrich started", "candidates", len(candidates), "rpm", opts.RPMLimit, "per_sec", opts.PerSecond)

	enriched := 0
	for _, c := range candidates {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
		}

		data, err := client.FetchFull(ctx, c.MalID)
		if err != nil {
			if errors.Is(err, ErrNotFound) {
				logger.Debug("jikan 404", "mal_id", c.MalID)
				continue
			}
			var rl RateLimitError
			if errors.As(err, &rl) {
				logger.Warn("jikan rate limited", "retry_after", rl.RetryAfter)
				select {
				case <-ctx.Done():
					return ctx.Err()
				case <-time.After(rl.RetryAfter):
				}
				continue
			}
			logger.Warn("jikan fetch failed", "mal_id", c.MalID, "error", err)
			continue
		}

		if _, err := SavePayload(ctx, pool, "jikan", strconv.Itoa(c.MalID), data); err != nil {
			logger.Warn("save jikan payload failed", "mal_id", c.MalID, "error", err)
			continue
		}

		if _, err := pool.Exec(ctx, `UPDATE anime SET mal_rank = $1, mal_members = $2 WHERE id = $3`,
			data.Rank, data.Members, c.AnimeID); err != nil {
			logger.Warn("update anime mal fields failed", "anime_id", c.AnimeID, "error", err)
		}

		for _, syn := range data.TitleSynonyms {
			if syn == "" {
				continue
			}
			na := anime.Normalize(syn)
			if na == "" {
				continue
			}
			if _, err := pool.Exec(ctx, `
				INSERT INTO anime_alias (anime_id, alias, normalized_alias, source, priority)
				VALUES ($1, $2, $3, 'jikan', 50)
				ON CONFLICT (anime_id, normalized_alias) DO UPDATE SET
					alias    = EXCLUDED.alias,
					source   = EXCLUDED.source,
					priority = LEAST(anime_alias.priority, EXCLUDED.priority)
			`, c.AnimeID, syn, na); err != nil {
				logger.Warn("insert jikan alias failed", "anime_id", c.AnimeID, "alias", syn, "error", err)
			}
		}

		if err := MapExternalID(ctx, pool, "jikan", strconv.Itoa(c.MalID), c.AnimeID); err != nil {
			logger.Warn("map jikan id failed", "mal_id", c.MalID, "error", err)
		}

		enriched++
	}

	_ = run.Bump(ctx, pool, len(candidates), enriched, nil)
	logger.Info("jikan enrich finished", "enriched", enriched, "candidates", len(candidates))
	return nil
}

// StartJikanSchedule kicks off the first run 60s after boot, then every interval.
func StartJikanSchedule(ctx context.Context, pool *pgxpool.Pool, logger *slog.Logger, interval time.Duration, opts JikanRunOptions) {
	go func() {
		select {
		case <-ctx.Done():
			return
		case <-time.After(60 * time.Second):
		}

		for {
			if err := RunJikanOnce(ctx, pool, logger, opts); err != nil && !errors.Is(err, context.Canceled) {
				logger.Error("jikan scheduled run failed", "error", err)
			}

			select {
			case <-ctx.Done():
				return
			case <-time.After(interval):
			}
		}
	}()
}

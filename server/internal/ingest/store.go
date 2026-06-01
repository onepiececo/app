package ingest

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Run tracks one execution of an ingestion job.
type Run struct {
	ID     int64
	Source string
	Job    string
}

func StartRun(ctx context.Context, pool *pgxpool.Pool, source, job string) (*Run, error) {
	var id int64
	err := pool.QueryRow(ctx, `
		INSERT INTO source_runs (source, job, status)
		VALUES ($1, $2, 'running')
		RETURNING id
	`, source, job).Scan(&id)
	if err != nil {
		return nil, err
	}
	return &Run{ID: id, Source: source, Job: job}, nil
}

func (r *Run) Bump(ctx context.Context, pool *pgxpool.Pool, seen, written int, cursor any) error {
	cursorJSON, _ := json.Marshal(cursor)
	_, err := pool.Exec(ctx, `
		UPDATE source_runs
		SET rows_seen    = rows_seen    + $1,
		    rows_written = rows_written + $2,
		    cursor       = $3
		WHERE id = $4
	`, seen, written, cursorJSON, r.ID)
	return err
}

func (r *Run) Finish(ctx context.Context, pool *pgxpool.Pool, runErr error) error {
	status := "ok"
	var errMsg *string
	if runErr != nil {
		status = "error"
		s := runErr.Error()
		errMsg = &s
	}
	_, err := pool.Exec(ctx, `
		UPDATE source_runs
		SET status = $1, error = $2, finished_at = now()
		WHERE id = $3
	`, status, errMsg, r.ID)
	return err
}

// SavePayload upserts the raw API response keyed by (source, source_id).
// Returns true if the payload changed since the last save.
func SavePayload(ctx context.Context, pool *pgxpool.Pool, source, sourceID string, payload any) (bool, error) {
	raw, err := json.Marshal(payload)
	if err != nil {
		return false, err
	}
	sum := sha256.Sum256(raw)
	hash := hex.EncodeToString(sum[:])

	var changed bool
	err = pool.QueryRow(ctx, `
		INSERT INTO source_payloads (source, source_id, payload, payload_hash, fetched_at)
		VALUES ($1, $2, $3, $4, now())
		ON CONFLICT (source, source_id) DO UPDATE SET
			payload      = EXCLUDED.payload,
			payload_hash = EXCLUDED.payload_hash,
			fetched_at   = now()
		RETURNING (source_payloads.payload_hash IS DISTINCT FROM $4) OR (xmax = 0)
	`, source, sourceID, raw, hash).Scan(&changed)
	if err != nil {
		return false, err
	}
	return changed, nil
}

// MapExternalID links a (source, source_id) tuple to the local anime id.
func MapExternalID(ctx context.Context, pool *pgxpool.Pool, source, sourceID string, animeID int64) error {
	_, err := pool.Exec(ctx, `
		INSERT INTO source_id_map (source, source_id, anime_id)
		VALUES ($1, $2, $3)
		ON CONFLICT (source, source_id) DO UPDATE SET
			anime_id   = EXCLUDED.anime_id,
			created_at = source_id_map.created_at
	`, source, sourceID, animeID)
	return err
}

// AnimeForJikanEnrichment returns the next batch of anime that have a captured
// AniList payload with idMal, but whose Jikan payload is missing or older than maxAge.
func AnimeForJikanEnrichment(ctx context.Context, pool *pgxpool.Pool, limit int, maxAge time.Duration) ([]JikanCandidate, error) {
	cutoff := time.Now().Add(-maxAge)
	rows, err := pool.Query(ctx, `
		SELECT m.anime_id, (al.payload -> 'idMal')::int AS mal_id
		FROM source_id_map m
		JOIN source_payloads al ON al.source = 'anilist' AND al.source_id = m.source_id
		LEFT JOIN source_payloads jp ON jp.source = 'jikan' AND jp.source_id = (al.payload ->> 'idMal')
		WHERE m.source = 'anilist'
		  AND (al.payload ->> 'idMal') IS NOT NULL
		  AND (jp.fetched_at IS NULL OR jp.fetched_at < $1)
		ORDER BY m.anime_id ASC
		LIMIT $2
	`, cutoff, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []JikanCandidate
	for rows.Next() {
		var c JikanCandidate
		if err := rows.Scan(&c.AnimeID, &c.MalID); err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	return out, rows.Err()
}

type JikanCandidate struct {
	AnimeID int64
	MalID   int
}

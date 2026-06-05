package anime

import (
	"context"
	"fmt"
	"time"
)

// Count returns the catalog total under the same visibility filter Browse uses, cached briefly since it only shifts on ingest.
func (s *Store) Count(ctx context.Context) (int, error) {
	s.countMu.Lock()
	defer s.countMu.Unlock()
	if time.Now().Before(s.countExp) {
		return s.countVal, nil
	}
	var n int
	err := s.pool.QueryRow(ctx, `
		SELECT count(*)
		FROM anime
		WHERE is_adult = false AND title_primary IS NOT NULL
	`).Scan(&n)
	if err != nil {
		return 0, err
	}
	s.countVal = n
	s.countExp = time.Now().Add(countTTL)
	return n, nil
}

// Browse returns anime sorted by the requested column, paginated.
// Sort is whitelisted server-side so the value is safe to interpolate.
func (s *Store) Browse(ctx context.Context, sort string, limit, offset int) ([]Hit, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}
	var orderBy string
	switch sort {
	case "popularity":
		orderBy = "popularity DESC NULLS LAST, title_primary ASC"
	case "year":
		orderBy = "season_year DESC NULLS LAST, title_primary ASC"
	case "score":
		orderBy = "average_score DESC NULLS LAST, title_primary ASC"
	default:
		orderBy = "title_primary ASC NULLS LAST"
	}

	q := fmt.Sprintf(`
		SELECT id, slug, COALESCE(title_primary, ''), season_year, COALESCE(average_score, 0)
		FROM anime
		WHERE is_adult = false AND title_primary IS NOT NULL
		ORDER BY %s
		LIMIT $1 OFFSET $2
	`, orderBy)

	rows, err := s.pool.Query(ctx, q, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	hits := make([]Hit, 0, limit)
	for rows.Next() {
		var h Hit
		var avgScore float32
		if err := rows.Scan(&h.ID, &h.Slug, &h.Title, &h.Year, &avgScore); err != nil {
			return nil, err
		}
		h.Score = avgScore
		hits = append(hits, h)
	}
	return hits, rows.Err()
}

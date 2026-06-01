package anime

import (
	"context"
)

type Hit struct {
	ID    int64   `json:"id"`
	Slug  string  `json:"slug"`
	Title string  `json:"title"`
	Year  *int    `json:"year,omitempty"`
	Score float32 `json:"score,omitempty"`
}

// Search runs a layered match against the alias table backed by a pg_trgm GIN index.
// Exact normalized matches outrank prefix matches, prefix outranks fuzzy similarity, popularity breaks ties.
func (s *Store) Search(ctx context.Context, q string, limit int) ([]Hit, error) {
	if limit <= 0 || limit > 50 {
		limit = 10
	}
	nq := Normalize(q)
	if nq == "" {
		return nil, nil
	}

	rows, err := s.pool.Query(ctx, `
		WITH matched AS (
			SELECT
				a.id,
				a.slug,
				a.title_primary,
				a.season_year,
				a.popularity,
				CASE
					WHEN aa.normalized_alias = $1                THEN 3.0
					WHEN aa.normalized_alias LIKE $1 || '%'      THEN 2.0
					ELSE similarity(aa.normalized_alias, $1)
				END AS rank,
				ROW_NUMBER() OVER (PARTITION BY a.id ORDER BY aa.priority ASC) AS rn
			FROM anime_alias aa
			JOIN anime a ON a.id = aa.anime_id
			WHERE aa.normalized_alias % $1
			   OR aa.normalized_alias LIKE $1 || '%'
			   OR aa.normalized_alias = $1
		)
		SELECT id, slug, title_primary, season_year, rank
		FROM matched
		WHERE rn = 1
		ORDER BY rank DESC, popularity DESC
		LIMIT $2
	`, nq, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var hits []Hit
	for rows.Next() {
		var h Hit
		var rank float32
		if err := rows.Scan(&h.ID, &h.Slug, &h.Title, &h.Year, &rank); err != nil {
			return nil, err
		}
		h.Score = rank
		hits = append(hits, h)
	}
	return hits, rows.Err()
}

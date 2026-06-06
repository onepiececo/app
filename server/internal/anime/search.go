package anime

import (
	"context"
	"unicode/utf8"
)

type Hit struct {
	ID             int64   `json:"id"`
	Slug           string  `json:"slug"`
	Title          string  `json:"title"`
	Year           *int    `json:"year,omitempty"`
	Score          float32 `json:"score,omitempty"`
	CoverSourceURL *string `json:"coverSourceUrl,omitempty"`
	CoverColor     *string `json:"coverColor,omitempty"`
	// Cursor is the keyset pagination position for this row, set by Browse and empty for search.
	Cursor string `json:"cursor,omitempty"`
}

// Search runs a layered match against the alias table backed by a pg_trgm GIN index.
// Exact normalized matches outrank prefix matches, prefix outranks fuzzy similarity, popularity breaks ties.
// Queries under 3 characters skip trigram entirely so a single letter doesn't drag in
// every title that happens to share a few common trigrams. Longer queries keep trigram
// for typo tolerance but cap weak fuzzy matches via a rank floor.
func (s *Store) Search(ctx context.Context, q string, limit int) ([]Hit, error) {
	if limit <= 0 || limit > 50 {
		limit = 10
	}
	nq := Normalize(q)
	if nq == "" {
		return nil, nil
	}

	var query string
	if utf8.RuneCountInString(nq) < 3 {
		query = `
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
						ELSE 0
					END AS rank,
					ROW_NUMBER() OVER (PARTITION BY a.id ORDER BY aa.priority ASC) AS rn
				FROM anime_alias aa
				JOIN anime a ON a.id = aa.anime_id
				WHERE aa.normalized_alias = $1
				   OR aa.normalized_alias LIKE $1 || '%'
			)
			SELECT m.id, m.slug, m.title_primary, m.season_year, m.rank, a.cover_source_url, a.cover_color
			FROM matched m
			JOIN anime a ON a.id = m.id
			WHERE m.rn = 1
			ORDER BY m.rank DESC, m.popularity DESC
			LIMIT $2
		`
	} else {
		query = `
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
			SELECT m.id, m.slug, m.title_primary, m.season_year, m.rank, a.cover_source_url, a.cover_color
			FROM matched m
			JOIN anime a ON a.id = m.id
			WHERE m.rn = 1 AND m.rank >= 0.45
			ORDER BY m.rank DESC, m.popularity DESC
			LIMIT $2
		`
	}

	rows, err := s.pool.Query(ctx, query, nq, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	hits := make([]Hit, 0, limit)
	for rows.Next() {
		var h Hit
		var rank float32
		if err := rows.Scan(&h.ID, &h.Slug, &h.Title, &h.Year, &rank, &h.CoverSourceURL, &h.CoverColor); err != nil {
			return nil, err
		}
		h.Score = rank
		hits = append(hits, h)
	}
	return hits, rows.Err()
}

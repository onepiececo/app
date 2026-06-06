package anime

import (
	"context"
	"strconv"
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
// Each anime collapses to its best matching alias so a weak fuzzy alias never hides a strong prefix one.
// Queries under 3 characters skip trigram so a stray letter does not pull in everything, longer queries keep
// fuzzy typo tolerance behind a rank floor and a length guard so trailing junk past a title cannot match.
// An optional format narrows results so search honors the same toggle browse does.
func (s *Store) Search(ctx context.Context, q, format string, limit int) ([]Hit, error) {
	if limit <= 0 || limit > 50 {
		limit = 10
	}
	nq := Normalize(q)
	if nq == "" {
		return nil, nil
	}

	args := []any{nq}
	formatClause := ""
	if validFormats[format] {
		args = append(args, format)
		formatClause = " AND a.format = $" + strconv.Itoa(len(args))
	}
	args = append(args, limit)
	limitIdx := len(args)

	fuzzyExpr := "0"
	matchWhere := "aa.normalized_alias = $1 OR aa.normalized_alias LIKE $1 || '%'"
	rankFloor := ""
	if utf8.RuneCountInString(nq) >= 3 {
		fuzzyExpr = "similarity(aa.normalized_alias, $1)"
		// The length guard keeps fuzzy for shorter typos but drops a query that runs past the alias with extra characters.
		matchWhere = "aa.normalized_alias LIKE $1 || '%' OR aa.normalized_alias = $1 OR (aa.normalized_alias % $1 AND char_length($1) <= char_length(aa.normalized_alias))"
		rankFloor = " AND m.rank >= 0.45"
	}

	rankExpr := `CASE
			WHEN aa.normalized_alias = $1           THEN 3.0
			WHEN aa.normalized_alias LIKE $1 || '%' THEN 2.0
			ELSE ` + fuzzyExpr + `
		END`

	query := `
		WITH matched AS (
			SELECT
				a.id, a.slug, a.title_primary, a.season_year, a.popularity,
				` + rankExpr + ` AS rank,
				ROW_NUMBER() OVER (PARTITION BY a.id ORDER BY ` + rankExpr + ` DESC, aa.priority ASC) AS rn
			FROM anime_alias aa
			JOIN anime a ON a.id = aa.anime_id
			WHERE (` + matchWhere + `)` + formatClause + `
		)
		SELECT m.id, m.slug, m.title_primary, m.season_year, COALESCE(a.average_score, 0), a.cover_source_url, a.cover_color
		FROM matched m
		JOIN anime a ON a.id = m.id
		WHERE m.rn = 1` + rankFloor + `
		ORDER BY m.rank DESC, m.popularity DESC
		LIMIT $` + strconv.Itoa(limitIdx)

	rows, err := s.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	hits := make([]Hit, 0, limit)
	for rows.Next() {
		var h Hit
		var avgScore int
		if err := rows.Scan(&h.ID, &h.Slug, &h.Title, &h.Year, &avgScore, &h.CoverSourceURL, &h.CoverColor); err != nil {
			return nil, err
		}
		h.Score = float32(avgScore)
		hits = append(hits, h)
	}
	return hits, rows.Err()
}

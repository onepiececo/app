package anime

import (
	"context"
	"encoding/base64"
	"encoding/json"
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
		WHERE is_adult = false AND title_primary IS NOT NULL AND average_score IS NOT NULL
	`).Scan(&n)
	if err != nil {
		return 0, err
	}
	s.countVal = n
	s.countExp = time.Now().Add(countTTL)
	return n, nil
}

// validFormats restricts the format filter to values the catalog actually carries.
var validFormats = map[string]bool{
	"TV":       true,
	"TV_SHORT": true,
	"MOVIE":    true,
	"ONA":      true,
	"OVA":      true,
	"SPECIAL":  true,
}

// browseCursor is the opaque keyset position, the last row's sort value plus its id as the stable tiebreak.
type browseCursor struct {
	P  any   `json:"p"`
	ID int64 `json:"id"`
}

func encodeCursor(p any, id int64) string {
	raw, _ := json.Marshal(browseCursor{P: p, ID: id})
	return base64.RawURLEncoding.EncodeToString(raw)
}

func decodeCursor(s string) (*browseCursor, bool) {
	if s == "" {
		return nil, false
	}
	raw, err := base64.RawURLEncoding.DecodeString(s)
	if err != nil {
		return nil, false
	}
	var c browseCursor
	if err := json.Unmarshal(raw, &c); err != nil {
		return nil, false
	}
	return &c, true
}

// cursorValue coerces the JSON-decoded cursor key back to the type its sort column compares against.
func cursorValue(sort string, p any) any {
	if sort == "title" {
		s, _ := p.(string)
		return s
	}
	f, _ := p.(float64)
	return int64(f)
}

// Browse returns anime for the requested sort and optional format using keyset
// pagination. The after cursor walks past the last row of the previous page so
// deep pages cost the same as the first. Sort and format are whitelisted
// server-side so the order and filter are safe to interpolate.
func (s *Store) Browse(ctx context.Context, sort, format string, limit int, after string) ([]Hit, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}

	// keyExpr is the sort key, cmp is the inequality that walks past the cursor, id ASC is the stable tiebreak.
	var keyExpr, cmp, orderBy string
	switch sort {
	case "popularity":
		keyExpr, cmp, orderBy = "popularity", "<", "popularity DESC, id ASC"
	case "year":
		keyExpr, cmp, orderBy = "COALESCE(season_year, -1)", "<", "COALESCE(season_year, -1) DESC, id ASC"
	case "score":
		keyExpr, cmp, orderBy = "average_score", "<", "average_score DESC, id ASC"
	default:
		sort = "title"
		keyExpr, cmp, orderBy = "title_primary", ">", "title_primary ASC, id ASC"
	}

	where := "is_adult = false AND title_primary IS NOT NULL AND average_score IS NOT NULL"
	var args []any
	if validFormats[format] {
		args = append(args, format)
		where += fmt.Sprintf(" AND format = $%d", len(args))
	}
	if c, ok := decodeCursor(after); ok {
		args = append(args, cursorValue(sort, c.P), c.ID)
		p, id := len(args)-1, len(args)
		where += fmt.Sprintf(" AND (%s %s $%d OR (%s = $%d AND id > $%d))", keyExpr, cmp, p, keyExpr, p, id)
	}
	args = append(args, limit)

	q := fmt.Sprintf(`
		SELECT id, slug, COALESCE(title_primary, ''), season_year, COALESCE(average_score, 0), popularity, cover_source_url, cover_color
		FROM anime
		WHERE %s
		ORDER BY %s
		LIMIT $%d
	`, where, orderBy, len(args))

	rows, err := s.pool.Query(ctx, q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	hits := make([]Hit, 0, limit)
	for rows.Next() {
		var h Hit
		var avgScore, popularity int
		if err := rows.Scan(&h.ID, &h.Slug, &h.Title, &h.Year, &avgScore, &popularity, &h.CoverSourceURL, &h.CoverColor); err != nil {
			return nil, err
		}
		h.Score = float32(avgScore)

		var p any
		switch sort {
		case "popularity":
			p = popularity
		case "year":
			p = -1
			if h.Year != nil {
				p = *h.Year
			}
		case "score":
			p = avgScore
		default:
			p = h.Title
		}
		h.Cursor = encodeCursor(p, h.ID)
		hits = append(hits, h)
	}
	return hits, rows.Err()
}

package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/kgrahammatzen/onepiece-server/internal/apiutil"
)

type CatalogHandler struct {
	pool *pgxpool.Pool
}

func NewCatalogHandler(pool *pgxpool.Pool) *CatalogHandler {
	return &CatalogHandler{pool: pool}
}

type gameRow struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	IsActive    bool   `json:"isActive"`
}

// Games returns every row from the game table ordered by id so clients can
// merge their own metadata (tone, copy) against a stable, canonical list.
func (h *CatalogHandler) Games(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pool.Query(r.Context(), `
		SELECT id, name, COALESCE(description, ''), is_active
		FROM game
		ORDER BY id
	`)
	if err != nil {
		apiutil.WriteError(w, apiutil.APIError{Status: http.StatusInternalServerError, Code: "games_failed", Message: err.Error()})
		return
	}
	defer rows.Close()

	games := make([]gameRow, 0)
	for rows.Next() {
		var g gameRow
		if err := rows.Scan(&g.ID, &g.Name, &g.Description, &g.IsActive); err != nil {
			apiutil.WriteError(w, apiutil.APIError{Status: http.StatusInternalServerError, Code: "games_scan", Message: err.Error()})
			return
		}
		games = append(games, g)
	}
	apiutil.WriteJSON(w, http.StatusOK, games)
}

// Days returns the distinct puzzle_date values, newest first, capped at the
// requested limit (default 30, max 365). Drives the date-rail and calendar
// bounds on the web side.
func (h *CatalogHandler) Days(w http.ResponseWriter, r *http.Request) {
	limit := 30
	if v := r.URL.Query().Get("limit"); v != "" {
		n, err := strconv.Atoi(v)
		if err == nil && n > 0 {
			limit = n
		}
	}
	if limit > 365 {
		limit = 365
	}

	rows, err := h.pool.Query(r.Context(), `
		SELECT DISTINCT puzzle_date
		FROM puzzle
		WHERE puzzle_date IS NOT NULL
		ORDER BY puzzle_date DESC
		LIMIT $1
	`, limit)
	if err != nil {
		apiutil.WriteError(w, apiutil.APIError{Status: http.StatusInternalServerError, Code: "days_failed", Message: err.Error()})
		return
	}
	defer rows.Close()

	dates := make([]string, 0)
	for rows.Next() {
		var d time.Time
		if err := rows.Scan(&d); err != nil {
			apiutil.WriteError(w, apiutil.APIError{Status: http.StatusInternalServerError, Code: "days_scan", Message: err.Error()})
			return
		}
		dates = append(dates, d.Format("2006-01-02"))
	}
	apiutil.WriteJSON(w, http.StatusOK, map[string]any{"dates": dates})
}

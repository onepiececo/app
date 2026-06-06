package handlers

import (
	"net/http"
	"strconv"

	"github.com/kgrahammatzen/onepiece-server/internal/anime"
	"github.com/kgrahammatzen/onepiece-server/internal/httpx"
)

type AnimeHandler struct {
	store *anime.Store
}

func NewAnimeHandler(store *anime.Store) *AnimeHandler {
	return &AnimeHandler{store: store}
}

func (h *AnimeHandler) Search(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	format := r.URL.Query().Get("format")
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	hits, err := h.store.Search(r.Context(), q, format, limit)
	if err != nil {
		httpx.WriteError(w, httpx.APIError{Status: http.StatusInternalServerError, Code: "search_failed", Message: err.Error()})
		return
	}
	if hits == nil {
		hits = []anime.Hit{}
	}
	httpx.WriteJSON(w, http.StatusOK, hits)
}

func (h *AnimeHandler) Count(w http.ResponseWriter, r *http.Request) {
	n, err := h.store.Count(r.Context())
	if err != nil {
		httpx.WriteError(w, httpx.APIError{Status: http.StatusInternalServerError, Code: "count_failed", Message: err.Error()})
		return
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]int{"count": n})
}

func (h *AnimeHandler) Browse(w http.ResponseWriter, r *http.Request) {
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	sort := r.URL.Query().Get("sort")
	format := r.URL.Query().Get("format")
	after := r.URL.Query().Get("after")

	hits, err := h.store.Browse(r.Context(), sort, format, limit, after)
	if err != nil {
		httpx.WriteError(w, httpx.APIError{Status: http.StatusInternalServerError, Code: "browse_failed", Message: err.Error()})
		return
	}
	if hits == nil {
		hits = []anime.Hit{}
	}
	httpx.WriteJSON(w, http.StatusOK, hits)
}

func (h *AnimeHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		httpx.WriteError(w, httpx.APIError{Status: http.StatusBadRequest, Code: "bad_id", Message: "id must be numeric"})
		return
	}
	d, err := h.store.GetDetailByID(r.Context(), id)
	if err != nil {
		httpx.WriteError(w, httpx.APIError{Status: http.StatusInternalServerError, Code: "get_failed", Message: err.Error()})
		return
	}
	if d == nil {
		httpx.WriteError(w, httpx.APIError{Status: http.StatusNotFound, Code: "not_found", Message: "anime not found"})
		return
	}
	httpx.WriteJSON(w, http.StatusOK, d)
}

func (h *AnimeHandler) GetBySlug(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("slug")
	if slug == "" {
		httpx.WriteError(w, httpx.APIError{Status: http.StatusBadRequest, Code: "missing_slug", Message: "slug is required"})
		return
	}

	a, err := h.store.GetBySlug(r.Context(), slug)
	if err != nil {
		httpx.WriteError(w, httpx.APIError{Status: http.StatusInternalServerError, Code: "get_failed", Message: err.Error()})
		return
	}
	if a == nil {
		httpx.WriteError(w, httpx.APIError{Status: http.StatusNotFound, Code: "not_found", Message: "anime not found"})
		return
	}
	httpx.WriteJSON(w, http.StatusOK, a)
}

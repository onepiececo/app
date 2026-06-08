package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/google/uuid"

	"github.com/kgrahammatzen/onepiece-server/internal/anime"
	"github.com/kgrahammatzen/onepiece-server/internal/auth"
	"github.com/kgrahammatzen/onepiece-server/internal/games"
	"github.com/kgrahammatzen/onepiece-server/internal/httpx"
	"github.com/kgrahammatzen/onepiece-server/internal/player"
)

type PuzzleHandler struct {
	store   *games.Store
	anime   *anime.Store
	players *player.Store
	jwks    *auth.JWKSStore
}

func NewPuzzleHandler(store *games.Store, animeStore *anime.Store, players *player.Store, jwks *auth.JWKSStore) *PuzzleHandler {
	return &PuzzleHandler{store: store, anime: animeStore, players: players, jwks: jwks}
}

// resolve maps the request to a player identity, writing the error and returning ok false on failure.
func (h *PuzzleHandler) resolve(w http.ResponseWriter, r *http.Request) (uuid.UUID, bool, bool) {
	if bearer := r.Header.Get("Authorization"); bearer != "" {
		userID, err := auth.VerifyBearer(h.jwks, bearer)
		if err != nil && !errors.Is(err, auth.ErrMissingToken) {
			httpx.WriteError(w, httpx.APIError{Status: http.StatusUnauthorized, Code: "invalid_token", Message: "invalid bearer"})
			return uuid.Nil, false, false
		}
		if userID != "" {
			id, err := h.players.ResolveUser(r.Context(), userID)
			if err != nil {
				httpx.WriteError(w, httpx.APIError{Status: http.StatusInternalServerError, Code: "identity_failed", Message: err.Error()})
				return uuid.Nil, false, false
			}
			return id.ID, false, true
		}
	}

	anonKey := r.Header.Get("X-Anonymous-Key")
	if anonKey == "" {
		httpx.WriteError(w, httpx.APIError{Status: http.StatusUnauthorized, Code: "missing_identity", Message: "send Authorization Bearer or X-Anonymous-Key"})
		return uuid.Nil, false, false
	}
	id, err := h.players.ResolveAnonymous(r.Context(), player.HashAnonymousKey(anonKey))
	if err != nil {
		httpx.WriteError(w, httpx.APIError{Status: http.StatusInternalServerError, Code: "identity_failed", Message: err.Error()})
		return uuid.Nil, false, false
	}
	return id.ID, true, true
}

// Today returns the puzzle for a game and date with the player's attempt state, defaulting to today.
func (h *PuzzleHandler) Today(w http.ResponseWriter, r *http.Request) {
	game := r.URL.Query().Get("game")
	if game == "" {
		game = games.ClueGame
	}
	date := time.Now().UTC().Truncate(24 * time.Hour)
	if v := r.URL.Query().Get("date"); v != "" {
		d, err := time.Parse("2006-01-02", v)
		if err != nil {
			httpx.WriteError(w, httpx.APIError{Status: http.StatusBadRequest, Code: "bad_date", Message: "date must be YYYY-MM-DD"})
			return
		}
		date = d
	}

	playerID, anon, ok := h.resolve(w, r)
	if !ok {
		return
	}

	puzzle, err := h.store.GetByGameDate(r.Context(), game, date)
	if err != nil {
		httpx.WriteError(w, httpx.APIError{Status: http.StatusInternalServerError, Code: "puzzle_failed", Message: err.Error()})
		return
	}
	// Generate today on demand so a fresh server serves it before the cron tick.
	if puzzle == nil {
		switch game {
		case games.ClueGame:
			_, err = h.store.EnsureClueForDate(r.Context(), h.anime, date)
		case games.HigherLowerGame:
			_, err = h.store.EnsureHigherLowerForDate(r.Context(), h.anime, date)
		}
		if err != nil {
			httpx.WriteError(w, httpx.APIError{Status: http.StatusInternalServerError, Code: "puzzle_failed", Message: err.Error()})
			return
		}
		puzzle, err = h.store.GetByGameDate(r.Context(), game, date)
		if err != nil {
			httpx.WriteError(w, httpx.APIError{Status: http.StatusInternalServerError, Code: "puzzle_failed", Message: err.Error()})
			return
		}
	}
	if puzzle == nil {
		httpx.WriteError(w, httpx.APIError{Status: http.StatusNotFound, Code: "no_puzzle", Message: "no puzzle for that game and date"})
		return
	}

	attempt, err := h.store.GetOrCreateAttempt(r.Context(), puzzle.ID, playerID, anon)
	if err != nil {
		httpx.WriteError(w, httpx.APIError{Status: http.StatusInternalServerError, Code: "attempt_failed", Message: err.Error()})
		return
	}
	if puzzle.GameID == games.HigherLowerGame {
		view, err := h.store.BuildHLView(puzzle, attempt)
		if err != nil {
			httpx.WriteError(w, httpx.APIError{Status: http.StatusInternalServerError, Code: "view_failed", Message: err.Error()})
			return
		}
		httpx.WriteJSON(w, http.StatusOK, view)
		return
	}
	view, err := h.store.BuildView(r.Context(), puzzle, attempt)
	if err != nil {
		httpx.WriteError(w, httpx.APIError{Status: http.StatusInternalServerError, Code: "view_failed", Message: err.Error()})
		return
	}
	httpx.WriteJSON(w, http.StatusOK, view)
}

// Statuses returns the player's per day standing for a game, read only so viewing the home grid never starts a puzzle.
func (h *PuzzleHandler) Statuses(w http.ResponseWriter, r *http.Request) {
	game := r.URL.Query().Get("game")
	if game == "" {
		game = games.ClueGame
	}
	var userID *string
	if bearer := r.Header.Get("Authorization"); bearer != "" {
		if uid, err := auth.VerifyBearer(h.jwks, bearer); err == nil && uid != "" {
			userID = &uid
		}
	}
	var anonHash *string
	if userID == nil {
		if key := r.Header.Get("X-Anonymous-Key"); key != "" {
			hash := player.HashAnonymousKey(key)
			anonHash = &hash
		}
	}
	statuses, err := h.store.PlayerStatuses(r.Context(), game, userID, anonHash)
	if err != nil {
		httpx.WriteError(w, httpx.APIError{Status: http.StatusInternalServerError, Code: "statuses_failed", Message: err.Error()})
		return
	}
	httpx.WriteJSON(w, http.StatusOK, statuses)
}

// Guess scores a guess against the puzzle's answer, a title for clue or a higher lower call.
func (h *PuzzleHandler) Guess(w http.ResponseWriter, r *http.Request) {
	id, ok := parsePuzzleID(w, r)
	if !ok {
		return
	}
	playerID, anon, ok := h.resolve(w, r)
	if !ok {
		return
	}
	puzzle, attempt, ok := h.load(w, r, id, playerID, anon)
	if !ok {
		return
	}

	if puzzle.GameID == games.HigherLowerGame {
		var body struct {
			Direction string `json:"direction"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			httpx.WriteError(w, httpx.APIError{Status: http.StatusBadRequest, Code: "bad_body", Message: "expected a direction"})
			return
		}
		res, err := h.store.GuessHL(r.Context(), puzzle, attempt, body.Direction)
		if err != nil {
			writeGameErr(w, err)
			return
		}
		httpx.WriteJSON(w, http.StatusOK, res)
		return
	}

	var body struct {
		AnimeID int64  `json:"animeId"`
		Title   string `json:"title"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.AnimeID == 0 {
		httpx.WriteError(w, httpx.APIError{Status: http.StatusBadRequest, Code: "bad_body", Message: "expected an animeId"})
		return
	}
	detail, err := h.anime.GetDetailByID(r.Context(), body.AnimeID)
	if err != nil {
		httpx.WriteError(w, httpx.APIError{Status: http.StatusInternalServerError, Code: "guess_failed", Message: err.Error()})
		return
	}
	if detail == nil {
		httpx.WriteError(w, httpx.APIError{Status: http.StatusBadRequest, Code: "unknown_anime", Message: "no anime with that id"})
		return
	}
	res, err := h.store.Guess(r.Context(), puzzle, attempt, detail)
	if err != nil {
		writeGameErr(w, err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, res)
}

func (h *PuzzleHandler) load(w http.ResponseWriter, r *http.Request, id int64, playerID uuid.UUID, anon bool) (*games.Puzzle, *games.Attempt, bool) {
	puzzle, err := h.store.GetByID(r.Context(), id)
	if err != nil {
		httpx.WriteError(w, httpx.APIError{Status: http.StatusInternalServerError, Code: "puzzle_failed", Message: err.Error()})
		return nil, nil, false
	}
	if puzzle == nil {
		httpx.WriteError(w, httpx.APIError{Status: http.StatusNotFound, Code: "no_puzzle", Message: "puzzle not found"})
		return nil, nil, false
	}
	attempt, err := h.store.GetOrCreateAttempt(r.Context(), puzzle.ID, playerID, anon)
	if err != nil {
		httpx.WriteError(w, httpx.APIError{Status: http.StatusInternalServerError, Code: "attempt_failed", Message: err.Error()})
		return nil, nil, false
	}
	return puzzle, attempt, true
}

func parsePuzzleID(w http.ResponseWriter, r *http.Request) (int64, bool) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		httpx.WriteError(w, httpx.APIError{Status: http.StatusBadRequest, Code: "bad_id", Message: "id must be numeric"})
		return 0, false
	}
	return id, true
}

// writeGameErr maps the games package's play errors to status codes.
func writeGameErr(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, games.ErrNoTries):
		httpx.WriteError(w, httpx.APIError{Status: http.StatusConflict, Code: "no_tries", Message: "no tries left"})
	case errors.Is(err, games.ErrNotPlaying):
		httpx.WriteError(w, httpx.APIError{Status: http.StatusConflict, Code: "round_over", Message: "round already over"})
	case errors.Is(err, games.ErrInvalidDirection):
		httpx.WriteError(w, httpx.APIError{Status: http.StatusBadRequest, Code: "bad_direction", Message: "direction must be higher or lower"})
	default:
		httpx.WriteError(w, httpx.APIError{Status: http.StatusInternalServerError, Code: "play_failed", Message: err.Error()})
	}
}

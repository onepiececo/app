package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/kgrahammatzen/onepiece-server/internal/anime"
	"github.com/kgrahammatzen/onepiece-server/internal/apiutil"
	"github.com/kgrahammatzen/onepiece-server/internal/auth"
	"github.com/kgrahammatzen/onepiece-server/internal/games"
	"github.com/kgrahammatzen/onepiece-server/internal/player"
)

type PuzzleHandler struct {
	pool    *pgxpool.Pool
	games   *games.Store
	anime   *anime.Store
	players *player.Store
	jwks    *auth.JWKSStore
	engines map[string]games.GameEngine
}

func NewPuzzleHandler(pool *pgxpool.Pool, g *games.Store, a *anime.Store, p *player.Store, jwks *auth.JWKSStore, engines map[string]games.GameEngine) *PuzzleHandler {
	return &PuzzleHandler{pool: pool, games: g, anime: a, players: p, jwks: jwks, engines: engines}
}

type todayResponse struct {
	Puzzle  *games.Puzzle  `json:"puzzle"`
	Attempt *games.Attempt `json:"attempt,omitempty"`
	// Guesses returns the player's prior guesses for this attempt so the client can rehydrate.
	Guesses []priorGuess `json:"guesses,omitempty"`
}

type priorGuess struct {
	Position int             `json:"position"`
	RawGuess string          `json:"rawGuess"`
	Result   json.RawMessage `json:"result"`
}

// Today returns the current puzzle for the requested game.
// When the caller provides identity, the attempt and prior guesses are included so the client can resume mid game.
func (h *PuzzleHandler) Today(w http.ResponseWriter, r *http.Request) {
	gameID := r.URL.Query().Get("game")
	if gameID == "" {
		gameID = games.ClueGameID
	}
	engine, ok := h.engines[gameID]
	if !ok {
		apiutil.WriteError(w, apiutil.APIError{Status: http.StatusNotFound, Code: "unknown_game", Message: "game not registered"})
		return
	}

	ctx := r.Context()
	today := time.Now().UTC().Truncate(24 * time.Hour)

	puzzle, err := h.games.GetByDate(ctx, gameID, today)
	if err != nil {
		apiutil.WriteError(w, apiutil.APIError{Status: http.StatusInternalServerError, Code: "load_failed", Message: err.Error()})
		return
	}
	if puzzle == nil {
		if _, err := games.EnsurePuzzleForDate(ctx, h.pool, engine, today); err != nil {
			apiutil.WriteError(w, apiutil.APIError{Status: http.StatusInternalServerError, Code: "generate_failed", Message: err.Error()})
			return
		}
		puzzle, err = h.games.GetByDate(ctx, gameID, today)
		if err != nil || puzzle == nil {
			apiutil.WriteError(w, apiutil.APIError{Status: http.StatusInternalServerError, Code: "load_failed", Message: "puzzle missing after generate"})
			return
		}
	}
	// Never leak the answer key to clients.
	puzzle.AnswerKey = nil

	resp := todayResponse{Puzzle: puzzle}

	identity, _ := h.resolveIdentity(r)
	if identity != nil {
		attempt, err := h.games.GetAttempt(ctx, puzzle.ID, identity.ID)
		if err == nil && attempt != nil {
			resp.Attempt = attempt
			resp.Guesses = h.loadGuesses(ctx, attempt.ID)
		}
	}

	apiutil.WriteJSON(w, http.StatusOK, resp)
}

type guessRequest struct {
	RawGuess string `json:"rawGuess"`
	AnimeID  *int64 `json:"animeId,omitempty"`
}

// Guess records a guess against the puzzle and returns the engine's result.
// Auto starts the attempt on first call. Auto completes the attempt on a win or final loss.
func (h *PuzzleHandler) Guess(w http.ResponseWriter, r *http.Request) {
	puzzleID, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		apiutil.WriteError(w, apiutil.APIError{Status: http.StatusBadRequest, Code: "bad_puzzle_id", Message: "puzzle id must be numeric"})
		return
	}

	var body guessRequest
	if err := apiutil.DecodeJSON(r, &body); err != nil {
		apiutil.WriteError(w, apiutil.APIError{Status: http.StatusBadRequest, Code: "bad_body", Message: err.Error()})
		return
	}

	ctx := r.Context()
	puzzle, err := h.games.GetByID(ctx, puzzleID)
	if err != nil || puzzle == nil {
		apiutil.WriteError(w, apiutil.APIError{Status: http.StatusNotFound, Code: "puzzle_not_found", Message: "puzzle not found"})
		return
	}
	engine, ok := h.engines[puzzle.GameID]
	if !ok {
		apiutil.WriteError(w, apiutil.APIError{Status: http.StatusInternalServerError, Code: "no_engine", Message: "no engine for game"})
		return
	}

	identity, err := h.resolveIdentity(r)
	if err != nil || identity == nil {
		apiutil.WriteError(w, apiutil.APIError{Status: http.StatusUnauthorized, Code: "missing_identity", Message: "send Authorization Bearer or X-Anonymous-Key"})
		return
	}

	attempt, err := h.games.StartOrGetAttempt(ctx, puzzle.ID, identity.ID)
	if err != nil {
		apiutil.WriteError(w, apiutil.APIError{Status: http.StatusInternalServerError, Code: "attempt_failed", Message: err.Error()})
		return
	}
	if attempt.Status != "started" {
		apiutil.WriteError(w, apiutil.APIError{Status: http.StatusConflict, Code: "attempt_done", Message: "attempt already complete"})
		return
	}

	input := games.GuessInput{
		PuzzleID:        puzzle.ID,
		AttemptID:       attempt.ID,
		PlayerID:        identity.ID,
		Position:        attempt.GuessesCount + 1,
		RawGuess:        body.RawGuess,
		NormalizedGuess: anime.Normalize(body.RawGuess),
		AnimeID:         body.AnimeID,
		AnswerKey:       puzzle.AnswerKey,
	}

	result, err := engine.ValidateGuess(ctx, input)
	if err != nil {
		apiutil.WriteError(w, apiutil.APIError{Status: http.StatusInternalServerError, Code: "validate_failed", Message: err.Error()})
		return
	}
	if err := h.games.RecordGuess(ctx, attempt.ID, input, result); err != nil {
		apiutil.WriteError(w, apiutil.APIError{Status: http.StatusInternalServerError, Code: "record_failed", Message: err.Error()})
		return
	}

	if result.Status == "won" || result.Status == "lost" {
		state := h.attemptState(ctx, puzzle.ID, attempt.ID, result.Status)
		score, _ := engine.ScoreAttempt(ctx, state)
		duration := int(time.Since(attempt.CreatedAt).Milliseconds())
		_ = h.games.CompleteAttempt(ctx, attempt.ID, result.Status, score, duration)
	}

	apiutil.WriteJSON(w, http.StatusOK, result)
}

// Complete forcibly closes the attempt as lost. Useful for a give up button.
func (h *PuzzleHandler) Complete(w http.ResponseWriter, r *http.Request) {
	puzzleID, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		apiutil.WriteError(w, apiutil.APIError{Status: http.StatusBadRequest, Code: "bad_puzzle_id", Message: "puzzle id must be numeric"})
		return
	}
	identity, err := h.resolveIdentity(r)
	if err != nil || identity == nil {
		apiutil.WriteError(w, apiutil.APIError{Status: http.StatusUnauthorized, Code: "missing_identity", Message: "send Authorization Bearer or X-Anonymous-Key"})
		return
	}
	attempt, err := h.games.GetAttempt(r.Context(), puzzleID, identity.ID)
	if err != nil || attempt == nil {
		apiutil.WriteError(w, apiutil.APIError{Status: http.StatusNotFound, Code: "no_attempt", Message: "no attempt to complete"})
		return
	}
	if attempt.Status != "started" {
		apiutil.WriteJSON(w, http.StatusOK, attempt)
		return
	}
	duration := int(time.Since(attempt.CreatedAt).Milliseconds())
	if err := h.games.CompleteAttempt(r.Context(), attempt.ID, "lost", 0, duration); err != nil {
		apiutil.WriteError(w, apiutil.APIError{Status: http.StatusInternalServerError, Code: "complete_failed", Message: err.Error()})
		return
	}
	apiutil.WriteJSON(w, http.StatusOK, map[string]string{"status": "lost"})
}

func (h *PuzzleHandler) resolveIdentity(r *http.Request) (*player.Identity, error) {
	if bearer := r.Header.Get("Authorization"); bearer != "" {
		userID, err := auth.VerifyBearer(h.jwks, bearer)
		if err != nil {
			if errors.Is(err, auth.ErrMissingToken) {
				userID = ""
			} else {
				return nil, err
			}
		}
		if userID != "" {
			return h.players.ResolveUser(r.Context(), userID)
		}
	}
	if anonKey := r.Header.Get("X-Anonymous-Key"); anonKey != "" {
		return h.players.ResolveAnonymous(r.Context(), player.HashAnonymousKey(anonKey))
	}
	return nil, nil
}

func (h *PuzzleHandler) loadGuesses(ctx context.Context, attemptID int64) []priorGuess {
	rows, err := h.pool.Query(ctx, `
		SELECT position, raw_guess, result
		FROM puzzle_guess
		WHERE attempt_id = $1
		ORDER BY position ASC
	`, attemptID)
	if err != nil {
		return nil
	}
	defer rows.Close()
	var out []priorGuess
	for rows.Next() {
		var g priorGuess
		if err := rows.Scan(&g.Position, &g.RawGuess, &g.Result); err == nil {
			out = append(out, g)
		}
	}
	return out
}

func (h *PuzzleHandler) attemptState(ctx context.Context, puzzleID, attemptID int64, status string) games.AttemptState {
	state := games.AttemptState{PuzzleID: puzzleID, AttemptID: attemptID, Status: status}
	rows, err := h.pool.Query(ctx, `
		SELECT position, raw_guess, (result->>'correct')::bool, result
		FROM puzzle_guess WHERE attempt_id = $1 ORDER BY position ASC
	`, attemptID)
	if err != nil {
		return state
	}
	defer rows.Close()
	for rows.Next() {
		var g games.GuessRecord
		if err := rows.Scan(&g.Position, &g.RawGuess, &g.Correct, &g.Detail); err == nil {
			state.Guesses = append(state.Guesses, g)
		}
	}
	return state
}

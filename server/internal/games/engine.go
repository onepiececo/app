package games

import (
	"context"
	"encoding/json"

	"github.com/google/uuid"
)

// GameEngine is the contract every game implements. The store handles persistence,
// the engine provides the rules for puzzle generation, guess validation, scoring, and share output.
type GameEngine interface {
	GameID() string
	GeneratePuzzle(ctx context.Context, seed string) (PuzzleDraft, error)
	ValidateGuess(ctx context.Context, in GuessInput) (GuessResult, error)
	ScoreAttempt(ctx context.Context, state AttemptState) (int, error)
	BuildShare(ctx context.Context, state AttemptState) SharePayload
}

// PuzzleDraft is what GeneratePuzzle returns to the store.
// The store decides date, seed, and difficulty.
type PuzzleDraft struct {
	// Payload is the user visible state sent to clients.
	Payload json.RawMessage
	// AnswerKey is hidden, server only, used to validate guesses.
	AnswerKey json.RawMessage
}

type GuessInput struct {
	PuzzleID        int64
	AttemptID       int64
	PlayerID        uuid.UUID
	// Position is the 1 based index of this guess within the attempt.
	Position        int
	RawGuess        string
	NormalizedGuess string
	// AnimeID is set when the autocomplete resolved the guess. It may be nil for free text.
	AnimeID *int64
	// AnswerKey is the puzzle's server side answer. Never returned to the client.
	AnswerKey json.RawMessage
}

type GuessResult struct {
	Correct bool `json:"correct"`
	// Status is one of started, won, lost.
	Status      string          `json:"status"`
	NextClue    json.RawMessage `json:"nextClue,omitempty"`
	Hint        *string         `json:"hint,omitempty"`
	GuessesLeft int             `json:"guessesLeft"`
}

type AttemptState struct {
	PuzzleID  int64
	AttemptID int64
	Status    string
	Score     int
	Guesses   []GuessRecord
	// StartedAt and EndedAt are unix milliseconds.
	StartedAt int64
	EndedAt   int64
}

type GuessRecord struct {
	Position int
	RawGuess string
	Correct  bool
}

type SharePayload struct {
	Text  string `json:"text"`
	Emoji string `json:"emoji"`
	URL   string `json:"url,omitempty"`
}

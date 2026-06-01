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

// PuzzleDraft is what GeneratePuzzle returns to the store. The store decides date/seed/difficulty.
type PuzzleDraft struct {
	Payload   json.RawMessage // user visible state, sent to clients
	AnswerKey json.RawMessage // hidden, server only, used to validate guesses
}

type GuessInput struct {
	PuzzleID   int64
	AttemptID  int64
	PlayerID   uuid.UUID
	Position   int    // 1 based, the Nth guess in this attempt
	RawGuess   string // user typed text
	NormalizedGuess string
	AnimeID    *int64 // resolved by the autocomplete, may be nil if free text
}

type GuessResult struct {
	Correct     bool            `json:"correct"`
	Status      string          `json:"status"`  // started, won, lost
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
	StartedAt int64 // unix ms
	EndedAt   int64 // unix ms
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

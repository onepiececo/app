package games

import (
	"context"
	"fmt"
	"time"
)

// EnsurePuzzleForDate returns the existing puzzle for the date or generates, stores, and returns a fresh one.
func EnsurePuzzleForDate(ctx context.Context, store *Store, engine GameEngine, date time.Time) (*Puzzle, bool, error) {
	d := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.UTC)

	existing, err := store.GetByDate(ctx, engine.GameID(), d)
	if err != nil {
		return nil, false, err
	}
	if existing != nil {
		return existing, false, nil
	}

	seed := fmt.Sprintf("daily:%s:%s", engine.GameID(), d.Format("2006-01-02"))
	draft, err := engine.GeneratePuzzle(ctx, seed)
	if err != nil {
		return nil, false, err
	}
	p, err := store.UpsertPuzzle(ctx, engine.GameID(), &d, seed, "normal", draft)
	if err != nil {
		return nil, false, err
	}
	return p, true, nil
}

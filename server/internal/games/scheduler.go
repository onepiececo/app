package games

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// EnsurePuzzleForDate generates and stores the puzzle for the given date if missing.
// Returns the puzzle (existing or freshly generated) plus a flag indicating whether it was just created.
func EnsurePuzzleForDate(ctx context.Context, pool *pgxpool.Pool, engine GameEngine, date time.Time) (*Puzzle, bool, error) {
	store := NewStore(pool)
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

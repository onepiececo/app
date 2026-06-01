package games

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type SchedulerOptions struct {
	// Interval is how often the scheduler wakes to top up missing puzzles.
	Interval time.Duration
	// BackfillDays generates puzzles for the last N days so new players can replay history.
	BackfillDays int
	// Engines is one entry per active game.
	Engines []GameEngine
}

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

// StartScheduler runs every Interval. Each tick it walks BackfillDays back through tomorrow,
// generating any missing puzzles in chronological order so the answer exclusion logic in each engine
// sees the older days first.
func StartScheduler(ctx context.Context, pool *pgxpool.Pool, logger *slog.Logger, opts SchedulerOptions) {
	if opts.Interval <= 0 {
		opts.Interval = time.Hour
	}
	if opts.BackfillDays < 0 {
		opts.BackfillDays = 0
	}
	go func() {
		runOnce := func() {
			now := time.Now().UTC()
			oldest := now.AddDate(0, 0, -opts.BackfillDays)
			latest := now.AddDate(0, 0, 1)
			for _, e := range opts.Engines {
				generated := 0
				for d := oldest; !d.After(latest); d = d.AddDate(0, 0, 1) {
					_, created, err := EnsurePuzzleForDate(ctx, pool, e, d)
					if err != nil {
						logger.Warn("puzzle generate failed", "game", e.GameID(), "date", d.Format("2006-01-02"), "error", err)
						continue
					}
					if created {
						generated++
						logger.Info("puzzle generated", "game", e.GameID(), "date", d.Format("2006-01-02"))
					}
				}
				if generated == 0 {
					logger.Debug("puzzle scheduler, no gaps", "game", e.GameID(), "backfill_days", opts.BackfillDays)
				}
			}
		}

		runOnce()

		t := time.NewTicker(opts.Interval)
		defer t.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-t.C:
				runOnce()
			}
		}
	}()
}

package games

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// SchedulerOptions controls how the daily puzzle generator runs.
type SchedulerOptions struct {
	Interval time.Duration // how often to poll for missing puzzles
	Engines  []GameEngine  // one entry per active game
}

// EnsurePuzzleForDate generates and stores the puzzle for the given date if missing.
// Returns true if a new puzzle was created.
func EnsurePuzzleForDate(ctx context.Context, pool *pgxpool.Pool, engine GameEngine, date time.Time) (bool, error) {
	store := NewStore(pool)
	d := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.UTC)

	existing, err := store.GetByDate(ctx, engine.GameID(), d)
	if err != nil {
		return false, err
	}
	if existing != nil {
		return false, nil
	}

	seed := fmt.Sprintf("daily:%s:%s", engine.GameID(), d.Format("2006-01-02"))
	draft, err := engine.GeneratePuzzle(ctx, seed)
	if err != nil {
		return false, err
	}
	if _, err := store.UpsertPuzzle(ctx, engine.GameID(), &d, seed, "normal", draft); err != nil {
		return false, err
	}
	return true, nil
}

// StartScheduler runs every Interval. Each tick it ensures today's and tomorrow's puzzle exist for each engine.
func StartScheduler(ctx context.Context, pool *pgxpool.Pool, logger *slog.Logger, opts SchedulerOptions) {
	if opts.Interval <= 0 {
		opts.Interval = time.Hour
	}
	go func() {
		runOnce := func() {
			now := time.Now().UTC()
			tomorrow := now.Add(24 * time.Hour)
			for _, e := range opts.Engines {
				for _, day := range []time.Time{now, tomorrow} {
					created, err := EnsurePuzzleForDate(ctx, pool, e, day)
					if err != nil {
						logger.Warn("puzzle generate failed", "game", e.GameID(), "date", day.Format("2006-01-02"), "error", err)
						continue
					}
					if created {
						logger.Info("puzzle generated", "game", e.GameID(), "date", day.Format("2006-01-02"))
					}
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

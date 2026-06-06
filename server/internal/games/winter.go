package games

import (
	"context"
	"errors"
	"log/slog"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kylegrahammatzen/winter"
)

const puzzleQueue = "puzzle"

// GeneratePuzzles tops up missing daily puzzles across the backfill window.
type GeneratePuzzles struct{}

func (GeneratePuzzles) Kind() string                { return "puzzle.generate" }
func (GeneratePuzzles) Options() winter.TaskOptions { return winter.TaskOptions{Queue: puzzleQueue} }

// PuzzleWinterOptions configures the puzzle generation worker.
type PuzzleWinterOptions struct {
	Cron         string
	BackfillDays int
	Engines      []GameEngine
}

// WinterCron returns the puzzle generation cron entry for the shared Winter server.
func WinterCron(opts PuzzleWinterOptions) []winter.CronEntry {
	return []winter.CronEntry{
		{Name: "puzzle", Schedule: opts.Cron, Queue: puzzleQueue, Kind: GeneratePuzzles{}.Kind(), Payload: []byte("{}")},
	}
}

// RegisterWinter wires the puzzle generation handler onto the shared server and tops up once on boot.
func RegisterWinter(ctx context.Context, server *winter.Server, client *winter.Client, pool *pgxpool.Pool, logger *slog.Logger, opts PuzzleWinterOptions) {
	winter.HandleFunc(server, func(c context.Context, _ *winter.Job[GeneratePuzzles]) error {
		return runPuzzleBackfill(c, pool, logger, opts.Engines, opts.BackfillDays)
	})
	if _, err := winter.Enqueue(client, ctx, GeneratePuzzles{}); err != nil {
		logger.Warn("initial puzzle enqueue failed", "error", err)
	}
}

// runPuzzleBackfill walks BackfillDays back through tomorrow, generating missing puzzles in chronological
// order so each engine's answer exclusion logic sees the older days first.
func runPuzzleBackfill(ctx context.Context, pool *pgxpool.Pool, logger *slog.Logger, engines []GameEngine, backfillDays int) error {
	if backfillDays < 0 {
		backfillDays = 0
	}
	now := time.Now().UTC()
	oldest := now.AddDate(0, 0, -backfillDays)
	latest := now.AddDate(0, 0, 1)
	store := NewStore(pool)
	for _, e := range engines {
		generated := 0
		for d := oldest; !d.After(latest); d = d.AddDate(0, 0, 1) {
			if err := ctx.Err(); err != nil {
				return err
			}
			_, created, err := EnsurePuzzleForDate(ctx, store, e, d)
			if err != nil {
				if errors.Is(err, context.Canceled) {
					return err
				}
				logger.Warn("puzzle generate failed", "game", e.GameID(), "date", d.Format("2006-01-02"), "error", err)
				continue
			}
			if created {
				generated++
				logger.Debug("puzzle generated", "game", e.GameID(), "date", d.Format("2006-01-02"))
			}
		}
		if generated > 0 {
			logger.Info("puzzle backfill", "game", e.GameID(), "generated", generated)
		} else {
			logger.Debug("puzzle backfill, no gaps", "game", e.GameID(), "backfill_days", backfillDays)
		}
	}
	return nil
}

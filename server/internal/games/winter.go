package games

import (
	"context"
	"errors"
	"log/slog"
	"time"

	"github.com/kylegrahammatzen/winter"
	"github.com/robfig/cron/v3"
)

// logNextRun reports how long until the cron expression fires again so each pass ends with the wait to the next one.
func logNextRun(logger *slog.Logger, source, expr string) {
	sched, err := cron.ParseStandard(expr)
	if err != nil {
		return
	}
	logger.Info("next "+source+" pass", "in", time.Until(sched.Next(time.Now())).Round(time.Minute).String())
}

// GamesDaily ensures today's puzzle exists and extends the backfill one chunk further back.
type GamesDaily struct{}

func (GamesDaily) Kind() string                { return "games.daily" }
func (GamesDaily) Options() winter.TaskOptions { return winter.TaskOptions{Queue: "games"} }

// WinterOptions tunes one daily generation pass.
type WinterOptions struct {
	Cron          string
	BackfillChunk int
}

// WinterCron returns the games cron entry for the shared Winter server.
func WinterCron(opts WinterOptions) []winter.CronEntry {
	return []winter.CronEntry{
		{Name: "games", Schedule: opts.Cron, Queue: "games", Kind: GamesDaily{}.Kind(), Payload: []byte("{}")},
	}
}

// RegisterWinter wires the daily generator onto the shared server and kicks one pass on boot so today exists at once.
func RegisterWinter(ctx context.Context, server *winter.Server, client *winter.Client, store *Store, ar animeReader, logger *slog.Logger, opts WinterOptions) {
	winter.HandleFunc(server, func(c context.Context, _ *winter.Job[GamesDaily]) error {
		for _, run := range []struct {
			name string
			fn   func(context.Context, animeReader, *slog.Logger, int) error
		}{
			{"clue", store.BackfillClue},
			{"higher lower", store.BackfillHigherLower},
		} {
			err := run.fn(c, ar, logger, opts.BackfillChunk)
			if errors.Is(err, context.Canceled) {
				return nil
			}
			if err != nil {
				logger.Error("games daily run failed", "game", run.name, "error", err)
			}
		}
		logNextRun(logger, "games", opts.Cron)
		return nil
	})

	if _, err := winter.Enqueue(client, ctx, GamesDaily{}); err != nil {
		logger.Warn("initial games enqueue failed", "error", err)
	}
}

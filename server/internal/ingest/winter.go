package ingest

import (
	"context"
	"errors"
	"log/slog"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
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

// AniListPass is the cron entry point that fans the relation backfill and crawl into an ordered chain.
type AniListPass struct{}

func (AniListPass) Kind() string                { return "ingest.anilist.pass" }
func (AniListPass) Options() winter.TaskOptions { return winter.TaskOptions{Queue: "anilist"} }

// AniListRelations backfills related anime the catalog references but is missing.
type AniListRelations struct{}

func (AniListRelations) Kind() string                { return "ingest.anilist.relations" }
func (AniListRelations) Options() winter.TaskOptions { return winter.TaskOptions{Queue: "anilist"} }

// AniListCrawl pulls AniList by popularity.
type AniListCrawl struct{}

func (AniListCrawl) Kind() string { return "ingest.anilist.crawl" }
func (AniListCrawl) Options() winter.TaskOptions {
	return winter.TaskOptions{Queue: "anilist", MaxRetries: 3, Backoff: winter.Exponential(2 * time.Second)}
}

// JikanEnrich layers MyAnimeList synonyms onto existing anime.
type JikanEnrich struct{}

func (JikanEnrich) Kind() string { return "ingest.jikan.enrich" }
func (JikanEnrich) Options() winter.TaskOptions {
	return winter.TaskOptions{Queue: "jikan", MaxRetries: 3, Backoff: winter.Exponential(2 * time.Second)}
}

// WinterOptions tunes a single ingest pass. The crons drive scheduling, the rest size one run.
type WinterOptions struct {
	CrawlEnabled       bool
	JikanEnabled       bool
	AniListCron        string
	AniListPages       int
	AniListRPM         int
	AniListRelationIDs int
	JikanCron          string
	JikanBatch         int
	JikanRPM           int
	JikanPerSecond     int
}

// WinterCron returns the AniList and Jikan cron entries for the shared Winter server.
func WinterCron(opts WinterOptions) []winter.CronEntry {
	crons := []winter.CronEntry{
		{Name: "anilist", Schedule: opts.AniListCron, Queue: "anilist", Kind: AniListPass{}.Kind(), Payload: []byte("{}")},
	}
	if opts.JikanEnabled {
		crons = append(crons, winter.CronEntry{Name: "jikan", Schedule: opts.JikanCron, Queue: "jikan", Kind: JikanEnrich{}.Kind(), Payload: []byte("{}")})
	}
	return crons
}

// RegisterWinter wires the ingest handlers onto the shared server and kicks one pass on boot.
// AniList is the primary catalog source so each pass chains the relation backfill ahead of the popularity crawl.
func RegisterWinter(ctx context.Context, server *winter.Server, client *winter.Client, pool *pgxpool.Pool, logger *slog.Logger, opts WinterOptions) {
	winter.HandleFunc(server, func(c context.Context, _ *winter.Job[AniListPass]) error {
		tasks := []winter.Task{AniListRelations{}}
		if opts.CrawlEnabled {
			tasks = append(tasks, AniListCrawl{})
		}
		_, err := winter.Chain(client, c, tasks)
		return err
	})

	winter.HandleFunc(server, func(c context.Context, _ *winter.Job[AniListRelations]) error {
		// Swallow the error so a failed backfill never blocks the chained crawl, the next pass retries it.
		err := RunAniListRelationsOnce(c, pool, logger, AniListRelationOptions{
			MaxIDs:   opts.AniListRelationIDs,
			RPMLimit: opts.AniListRPM,
		})
		if errors.Is(err, context.Canceled) {
			return nil
		}
		if err != nil {
			logger.Error("anilist relations run failed", "error", err)
		}
		logNextRun(logger, "anilist relations", opts.AniListCron)
		return nil
	})

	winter.HandleFunc(server, func(c context.Context, _ *winter.Job[AniListCrawl]) error {
		err := RunAniListOnce(c, pool, logger, AniListRunOptions{
			PerPage:  50,
			MaxPages: opts.AniListPages,
			RPMLimit: opts.AniListRPM,
		})
		if errors.Is(err, context.Canceled) {
			return nil
		}
		logNextRun(logger, "anilist", opts.AniListCron)
		return err
	})

	winter.HandleFunc(server, func(c context.Context, _ *winter.Job[JikanEnrich]) error {
		err := RunJikanOnce(c, pool, logger, JikanRunOptions{
			Batch:     opts.JikanBatch,
			RPMLimit:  opts.JikanRPM,
			PerSecond: opts.JikanPerSecond,
		})
		if errors.Is(err, context.Canceled) {
			return nil
		}
		logNextRun(logger, "jikan", opts.JikanCron)
		return err
	})

	// Kick one pass on boot so a fresh start populates without waiting for the first cron tick.
	if _, err := winter.Enqueue(client, ctx, AniListPass{}); err != nil {
		logger.Warn("initial anilist enqueue failed", "error", err)
	}
	if opts.JikanEnabled {
		if _, err := winter.Enqueue(client, ctx, JikanEnrich{}); err != nil {
			logger.Warn("initial jikan enqueue failed", "error", err)
		}
	}
}

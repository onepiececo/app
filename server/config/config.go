package config

import (
	"github.com/caarlos0/env/v11"
)

type Config struct {
	DatabaseURL string `env:"DATABASE_URL,required"`
	DBMaxConns  int    `env:"DB_MAX_CONNS" envDefault:"25"`
	Port        int    `env:"PORT" envDefault:"8080"`
	WebURL      string `env:"WEB_URL" envDefault:"http://localhost:3000"`
	LogLevel    string `env:"LOG_LEVEL" envDefault:"info"`
	LogFormat   string `env:"LOG_FORMAT" envDefault:"json"`

	// PuzzleBackfillDays controls how far back the puzzle worker generates history on each pass.
	// 30 means new players can replay the last month of puzzles.
	PuzzleBackfillDays int `env:"PUZZLE_BACKFILL_DAYS" envDefault:"30"`

	// PuzzleCron drives how often the Winter puzzle worker tops up missing daily puzzles.
	PuzzleCron string `env:"PUZZLE_CRON" envDefault:"0 * * * *"`

	// RedisAddr is the Redis backing the Winter task queue that drives ingestion.
	RedisAddr string `env:"REDIS_ADDR" envDefault:"localhost:6379"`

	// IngestEmbedded toggles the in-server Winter ingest workers.
	// Defaults on so the single server binary owns the whole pipeline, set false to pause ingestion entirely.
	IngestEmbedded bool `env:"INGEST_EMBEDDED" envDefault:"true"`

	// IngestConcurrency caps how many ingest jobs the Winter worker runs at once.
	IngestConcurrency int `env:"INGEST_CONCURRENCY" envDefault:"5"`

	// AniListCrawlEnabled runs the popularity crawl, set false to backfill relations against the existing catalog only.
	AniListCrawlEnabled bool `env:"ANILIST_CRAWL_ENABLED" envDefault:"true"`
	// JikanEnabled runs the MyAnimeList enrichment pass.
	JikanEnabled bool `env:"JIKAN_ENABLED" envDefault:"true"`

	// AniList ingestion knobs. The cron drives each pass, the rest tune a single pass.
	AniListCron        string `env:"ANILIST_CRON" envDefault:"0 * * * *"`
	AniListPages       int    `env:"ANILIST_PAGES" envDefault:"50"`
	AniListRPM         int    `env:"ANILIST_RPM" envDefault:"25"`
	AniListRelationIDs int    `env:"ANILIST_RELATION_IDS" envDefault:"100"`

	// Jikan ingestion knobs.
	JikanCron      string `env:"JIKAN_CRON" envDefault:"*/30 * * * *"`
	JikanBatch     int    `env:"JIKAN_BATCH" envDefault:"50"`
	JikanRPM       int    `env:"JIKAN_RPM" envDefault:"60"`
	JikanPerSecond int    `env:"JIKAN_PER_SECOND" envDefault:"3"`
}

func Load() (*Config, error) {
	cfg := &Config{}
	if err := env.Parse(cfg); err != nil {
		return nil, err
	}
	return cfg, nil
}

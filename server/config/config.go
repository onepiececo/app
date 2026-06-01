package config

import (
	"time"

	"github.com/caarlos0/env/v11"
)

type Config struct {
	DatabaseURL string `env:"DATABASE_URL,required"`
	DBMaxConns  int    `env:"DB_MAX_CONNS" envDefault:"25"`
	Port        int    `env:"PORT" envDefault:"8080"`
	WebURL      string `env:"WEB_URL" envDefault:"http://localhost:3000"`
	LogLevel    string `env:"LOG_LEVEL" envDefault:"info"`
	LogFormat   string `env:"LOG_FORMAT" envDefault:"json"`

	// AniList ingestion is opt in so dev restarts don't crawl AniList.
	// Use the onepiece-cli subcommand for one shot runs.
	IngestAniListEnabled  bool          `env:"INGEST_ANILIST_ENABLED" envDefault:"false"`
	IngestAniListInterval time.Duration `env:"INGEST_ANILIST_INTERVAL" envDefault:"24h"`
	IngestAniListMaxPages int           `env:"INGEST_ANILIST_MAX_PAGES" envDefault:"20"`
	IngestAniListRPM      int           `env:"INGEST_ANILIST_RPM" envDefault:"25"`
}

func Load() (*Config, error) {
	cfg := &Config{}
	if err := env.Parse(cfg); err != nil {
		return nil, err
	}
	return cfg, nil
}

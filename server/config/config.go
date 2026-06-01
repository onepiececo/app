package config

import "github.com/caarlos0/env/v11"

type Config struct {
	DatabaseURL string `env:"DATABASE_URL,required"`
	DBMaxConns  int    `env:"DB_MAX_CONNS" envDefault:"25"`
	Port        int    `env:"PORT" envDefault:"8080"`
	WebURL      string `env:"WEB_URL" envDefault:"http://localhost:3000"`
	LogLevel    string `env:"LOG_LEVEL" envDefault:"info"`
	LogFormat   string `env:"LOG_FORMAT" envDefault:"json"`

	// PuzzleBackfillDays controls how far back the puzzle scheduler generates history on each tick.
	// 30 means new players can replay the last month of puzzles. Ingestion lives in the onepiece-cli binary.
	PuzzleBackfillDays int `env:"PUZZLE_BACKFILL_DAYS" envDefault:"30"`
}

func Load() (*Config, error) {
	cfg := &Config{}
	if err := env.Parse(cfg); err != nil {
		return nil, err
	}
	return cfg, nil
}

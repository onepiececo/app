package store

import (
	"embed"
	"fmt"
	"log/slog"
	"strings"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/pgx/v5"
	"github.com/golang-migrate/migrate/v4/source/iofs"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

type migrateLogger struct {
	logger *slog.Logger
}

func (l *migrateLogger) Printf(format string, v ...any) {
	msg := strings.TrimRight(fmt.Sprintf(format, v...), "\n")
	l.logger.Info("migration", "detail", msg)
}

func (l *migrateLogger) Verbose() bool {
	return true
}

// RunMigrations applies any pending embedded migrations to the target database.
// Call this from the server entrypoint before any service starts reading or writing.
func RunMigrations(databaseURL string, logger *slog.Logger) error {
	dbURL := strings.Replace(databaseURL, "postgres://", "pgx5://", 1)

	source, err := iofs.New(migrationsFS, "migrations")
	if err != nil {
		return fmt.Errorf("loading migration source: %w", err)
	}
	m, err := migrate.NewWithSourceInstance("iofs", source, dbURL)
	if err != nil {
		return fmt.Errorf("initializing migrate: %w", err)
	}
	m.Log = &migrateLogger{logger: logger}

	before, _, verr := m.Version()
	if verr != nil && verr != migrate.ErrNilVersion {
		return fmt.Errorf("reading current version: %w", verr)
	}

	upErr := m.Up()
	if upErr != nil && upErr != migrate.ErrNoChange {
		return fmt.Errorf("applying migrations: %w", upErr)
	}

	after, dirty, verr := m.Version()
	if verr != nil {
		return fmt.Errorf("reading post migration version: %w", verr)
	}
	if dirty {
		return fmt.Errorf("schema left in dirty state at version %d", after)
	}

	if upErr == migrate.ErrNoChange {
		logger.Info("migrations up to date", "version", after)
	} else {
		logger.Info("migrations applied", "from", before, "to", after)
	}
	return nil
}

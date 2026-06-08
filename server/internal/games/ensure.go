package games

import (
	"context"
	"errors"
	"log/slog"
	"time"
)

// today returns the current date at UTC midnight, the daily boundary all puzzles align to.
func today() time.Time {
	return time.Now().UTC().Truncate(24 * time.Hour)
}

// EnsureClueForDate returns the stored puzzle id for a date or generates and stores one.
func (s *Store) EnsureClueForDate(ctx context.Context, ar animeReader, date time.Time) (int64, error) {
	existing, err := s.GetByGameDate(ctx, ClueGame, date)
	if err != nil {
		return 0, err
	}
	if existing != nil {
		return existing.ID, nil
	}
	payload, answerKey, seed, _, err := s.GenerateClue(ctx, ar, date)
	if err != nil {
		return 0, err
	}
	return s.UpsertPuzzle(ctx, ClueGame, date, seed, payload, answerKey)
}

// BackfillClue guarantees today then extends the history backwards by up to chunk older days,
// stopping when the eligible answer pool runs out so a finite catalog has a natural floor.
func (s *Store) BackfillClue(ctx context.Context, ar animeReader, logger *slog.Logger, chunk int) error {
	now := today()
	if _, err := s.EnsureClueForDate(ctx, ar, now); err != nil {
		if errors.Is(err, ErrPoolExhausted) {
			return nil
		}
		return err
	}

	oldest, ok, err := s.OldestDate(ctx, ClueGame)
	if err != nil {
		return err
	}
	if !ok {
		oldest = now
	}

	for range chunk {
		oldest = oldest.AddDate(0, 0, -1)
		if _, err := s.EnsureClueForDate(ctx, ar, oldest); err != nil {
			if errors.Is(err, ErrPoolExhausted) {
				logger.Info("clue backfill reached the end of the answer pool", "oldest", oldest.Format("2006-01-02"))
				return nil
			}
			return err
		}
	}
	return nil
}

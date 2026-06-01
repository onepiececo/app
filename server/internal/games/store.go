package games

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Store struct {
	pool *pgxpool.Pool
}

func NewStore(pool *pgxpool.Pool) *Store {
	return &Store{pool: pool}
}

type Puzzle struct {
	ID          int64           `json:"id"`
	GameID      string          `json:"gameId"`
	PuzzleDate  *time.Time      `json:"puzzleDate,omitempty"`
	Seed        string          `json:"seed"`
	Difficulty  string          `json:"difficulty"`
	Payload     json.RawMessage `json:"payload"`
	AnswerKey   json.RawMessage `json:"-"`
	PublishedAt *time.Time      `json:"publishedAt,omitempty"`
}

type Attempt struct {
	ID           int64      `json:"id"`
	PuzzleID     int64      `json:"puzzleId"`
	PlayerID     uuid.UUID  `json:"playerId"`
	Status       string     `json:"status"`
	Score        int        `json:"score"`
	GuessesCount int        `json:"guessesCount"`
	DurationMS   *int       `json:"durationMs,omitempty"`
	CreatedAt    time.Time  `json:"createdAt"`
	CompletedAt  *time.Time `json:"completedAt,omitempty"`
}

func (s *Store) UpsertPuzzle(ctx context.Context, gameID string, date *time.Time, seed, difficulty string, draft PuzzleDraft) (*Puzzle, error) {
	var p Puzzle
	err := s.pool.QueryRow(ctx, `
		INSERT INTO puzzle (game_id, puzzle_date, seed, difficulty, payload, answer_key, published_at)
		VALUES ($1, $2, $3, $4, $5, $6, now())
		ON CONFLICT (game_id, puzzle_date) DO UPDATE SET
			seed       = EXCLUDED.seed,
			difficulty = EXCLUDED.difficulty,
			payload    = EXCLUDED.payload,
			answer_key = EXCLUDED.answer_key
		RETURNING id, game_id, puzzle_date, seed, difficulty, payload, answer_key, published_at
	`, gameID, date, seed, difficulty, draft.Payload, draft.AnswerKey).Scan(
		&p.ID, &p.GameID, &p.PuzzleDate, &p.Seed, &p.Difficulty, &p.Payload, &p.AnswerKey, &p.PublishedAt,
	)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (s *Store) GetByDate(ctx context.Context, gameID string, date time.Time) (*Puzzle, error) {
	row := s.pool.QueryRow(ctx, `
		SELECT id, game_id, puzzle_date, seed, difficulty, payload, answer_key, published_at
		FROM puzzle WHERE game_id = $1 AND puzzle_date = $2
	`, gameID, date)
	return scanPuzzle(row)
}

func (s *Store) GetByID(ctx context.Context, id int64) (*Puzzle, error) {
	row := s.pool.QueryRow(ctx, `
		SELECT id, game_id, puzzle_date, seed, difficulty, payload, answer_key, published_at
		FROM puzzle WHERE id = $1
	`, id)
	return scanPuzzle(row)
}

func scanPuzzle(row pgx.Row) (*Puzzle, error) {
	var p Puzzle
	err := row.Scan(&p.ID, &p.GameID, &p.PuzzleDate, &p.Seed, &p.Difficulty, &p.Payload, &p.AnswerKey, &p.PublishedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &p, nil
}

// StartOrGetAttempt returns the existing attempt for (puzzle, player) or creates a fresh one.
func (s *Store) StartOrGetAttempt(ctx context.Context, puzzleID int64, playerID uuid.UUID) (*Attempt, error) {
	var a Attempt
	err := s.pool.QueryRow(ctx, `
		WITH ins AS (
			INSERT INTO puzzle_attempt (puzzle_id, player_id)
			VALUES ($1, $2)
			ON CONFLICT (puzzle_id, player_id) DO NOTHING
			RETURNING id, puzzle_id, player_id, status, score, guesses_count, duration_ms, created_at, completed_at
		)
		SELECT * FROM ins
		UNION ALL
		SELECT id, puzzle_id, player_id, status, score, guesses_count, duration_ms, created_at, completed_at
		FROM puzzle_attempt WHERE puzzle_id = $1 AND player_id = $2
		LIMIT 1
	`, puzzleID, playerID).Scan(&a.ID, &a.PuzzleID, &a.PlayerID, &a.Status, &a.Score, &a.GuessesCount, &a.DurationMS, &a.CreatedAt, &a.CompletedAt)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (s *Store) GetAttempt(ctx context.Context, puzzleID int64, playerID uuid.UUID) (*Attempt, error) {
	var a Attempt
	err := s.pool.QueryRow(ctx, `
		SELECT id, puzzle_id, player_id, status, score, guesses_count, duration_ms, created_at, completed_at
		FROM puzzle_attempt WHERE puzzle_id = $1 AND player_id = $2
	`, puzzleID, playerID).Scan(&a.ID, &a.PuzzleID, &a.PlayerID, &a.Status, &a.Score, &a.GuessesCount, &a.DurationMS, &a.CreatedAt, &a.CompletedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &a, nil
}

// RecordGuess appends a guess row and bumps the attempt's guesses_count.
func (s *Store) RecordGuess(ctx context.Context, attemptID int64, in GuessInput, result GuessResult) error {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	resultJSON, _ := json.Marshal(result)

	if _, err := tx.Exec(ctx, `
		INSERT INTO puzzle_guess (attempt_id, anime_id, raw_guess, normalized_guess, result, position)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, attemptID, in.AnimeID, in.RawGuess, in.NormalizedGuess, resultJSON, in.Position); err != nil {
		return err
	}

	if _, err := tx.Exec(ctx, `
		UPDATE puzzle_attempt
		SET guesses_count = guesses_count + 1
		WHERE id = $1
	`, attemptID); err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (s *Store) CompleteAttempt(ctx context.Context, attemptID int64, status string, score, durationMS int) error {
	_, err := s.pool.Exec(ctx, `
		UPDATE puzzle_attempt
		SET status = $1, score = $2, duration_ms = $3, completed_at = now()
		WHERE id = $4
	`, status, score, durationMS, attemptID)
	return err
}

func (s *Store) BumpAnswerStats(ctx context.Context, puzzleID int64, slot string, animeID int64, correct bool) error {
	c := 0
	if correct {
		c = 1
	}
	_, err := s.pool.Exec(ctx, `
		INSERT INTO puzzle_answer_stats (puzzle_id, answer_slot, anime_id, correct_count, total_count)
		VALUES ($1, $2, $3, $4, 1)
		ON CONFLICT (puzzle_id, answer_slot, anime_id) DO UPDATE SET
			correct_count = puzzle_answer_stats.correct_count + EXCLUDED.correct_count,
			total_count   = puzzle_answer_stats.total_count   + 1
	`, puzzleID, slot, animeID, c)
	return err
}

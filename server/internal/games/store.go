package games

import (
	"context"
	"encoding/json"
	"errors"
	"strings"
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

// Puzzle is one stored daily puzzle. Payload is the client safe clue body, AnswerKey is server only.
type Puzzle struct {
	ID        int64
	GameID    string
	Date      time.Time
	Payload   json.RawMessage
	AnswerKey json.RawMessage
}

// Attempt is one player's run at a puzzle, holding the revealed facet indices and the guess count.
type Attempt struct {
	ID           int64
	Status       string
	GuessesCount int
	Revealed     []int
}

func scanPuzzle(row pgx.Row) (*Puzzle, error) {
	var p Puzzle
	if err := row.Scan(&p.ID, &p.GameID, &p.Date, &p.Payload, &p.AnswerKey); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &p, nil
}

func (s *Store) GetByGameDate(ctx context.Context, game string, date time.Time) (*Puzzle, error) {
	return scanPuzzle(s.pool.QueryRow(ctx, `
		SELECT id, game_id, puzzle_date, payload, answer_key
		FROM puzzle
		WHERE game_id = $1 AND puzzle_date = $2
	`, game, date))
}

// DayStatus is a player's per day standing for a game, sent to the home grid.
type DayStatus struct {
	Date   string `json:"date"`
	Status string `json:"status"`
}

// PlayerStatuses reads a player's per day standing without ever creating an attempt, only days with a real guess count.
func (s *Store) PlayerStatuses(ctx context.Context, game string, userID, anonHash *string) ([]DayStatus, error) {
	const sel = `
		SELECT p.puzzle_date,
		       CASE WHEN pa.status <> 'started' THEN pa.status ELSE 'in_progress' END
		FROM puzzle_attempt pa
		JOIN puzzle p ON p.id = pa.puzzle_id
		JOIN player_identity pi ON pi.id = pa.player_id`

	var rows pgx.Rows
	var err error
	switch {
	case userID != nil:
		rows, err = s.pool.Query(ctx, sel+`
		WHERE p.game_id = $1 AND pa.guesses_count > 0 AND pi.user_id = $2`, game, *userID)
	case anonHash != nil:
		rows, err = s.pool.Query(ctx, sel+`
		JOIN anonymous_player ap ON ap.id = pi.anonymous_player_id
		WHERE p.game_id = $1 AND pa.guesses_count > 0 AND ap.anonymous_key_hash = $2`, game, *anonHash)
	default:
		return []DayStatus{}, nil
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]DayStatus, 0)
	for rows.Next() {
		var d time.Time
		var st string
		if err := rows.Scan(&d, &st); err != nil {
			return nil, err
		}
		out = append(out, DayStatus{Date: d.Format("2006-01-02"), Status: st})
	}
	return out, rows.Err()
}

func (s *Store) GetByID(ctx context.Context, id int64) (*Puzzle, error) {
	return scanPuzzle(s.pool.QueryRow(ctx, `
		SELECT id, game_id, puzzle_date, payload, answer_key
		FROM puzzle
		WHERE id = $1
	`, id))
}

// UpsertPuzzle writes a generated puzzle and leaves an existing day untouched so a generated date stays stable.
func (s *Store) UpsertPuzzle(ctx context.Context, game string, date time.Time, seed string, payload, answerKey json.RawMessage) (int64, error) {
	var id int64
	err := s.pool.QueryRow(ctx, `
		INSERT INTO puzzle (game_id, puzzle_date, seed, payload, answer_key, published_at)
		VALUES ($1, $2, $3, $4, $5, now())
		ON CONFLICT (game_id, puzzle_date) DO NOTHING
		RETURNING id
	`, game, date, seed, payload, answerKey).Scan(&id)
	if errors.Is(err, pgx.ErrNoRows) {
		if err := s.pool.QueryRow(ctx, `SELECT id FROM puzzle WHERE game_id = $1 AND puzzle_date = $2`, game, date).Scan(&id); err != nil {
			return 0, err
		}
		return id, nil
	}
	if err != nil {
		return 0, err
	}
	return id, nil
}

// UsedAnswerAnimeIDs returns every anime id ever used as an answer for a game so the generator never repeats one.
func (s *Store) UsedAnswerAnimeIDs(ctx context.Context, game string) (map[int64]bool, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT (answer_key->>'animeId')::bigint
		FROM puzzle
		WHERE game_id = $1 AND answer_key ? 'animeId'
	`, game)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	used := make(map[int64]bool)
	for rows.Next() {
		var id int64
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		used[id] = true
	}
	return used, rows.Err()
}

// OldestDate returns the earliest stored puzzle_date for a game, ok false when none exist yet.
func (s *Store) OldestDate(ctx context.Context, game string) (time.Time, bool, error) {
	var d *time.Time
	if err := s.pool.QueryRow(ctx, `
		SELECT min(puzzle_date) FROM puzzle WHERE game_id = $1 AND puzzle_date IS NOT NULL
	`, game).Scan(&d); err != nil {
		return time.Time{}, false, err
	}
	if d == nil {
		return time.Time{}, false, nil
	}
	return *d, true, nil
}

// EligibleAnimeIDs returns the top popularity eligible anime ids, the pool the generator draws answers from.
// A sequel carries a PREQUEL edge and a spin off carries a PARENT edge, so excluding both keeps only origin entries.
func (s *Store) EligibleAnimeIDs(ctx context.Context, limit int) ([]int64, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT a.id FROM anime a
		WHERE a.is_game_eligible = true AND a.is_adult = false
		  AND a.title_primary IS NOT NULL AND a.average_score IS NOT NULL
		  AND NOT EXISTS (
		    SELECT 1 FROM anime_relation r
		    WHERE r.from_anime_id = a.id AND r.relation_type IN ('PREQUEL', 'PARENT')
		  )
		ORDER BY a.popularity DESC, a.id ASC
		LIMIT $1
	`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	ids := make([]int64, 0, limit)
	for rows.Next() {
		var id int64
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}
	return ids, rows.Err()
}

// GetOrCreateAttempt resolves the player's attempt at a puzzle, creating a fresh one on first touch.
func (s *Store) GetOrCreateAttempt(ctx context.Context, puzzleID int64, playerID uuid.UUID, anon bool) (*Attempt, error) {
	if _, err := s.pool.Exec(ctx, `
		INSERT INTO puzzle_attempt (puzzle_id, player_id, is_anonymous)
		VALUES ($1, $2, $3)
		ON CONFLICT (puzzle_id, player_id) DO NOTHING
	`, puzzleID, playerID, anon); err != nil {
		return nil, err
	}

	var a Attempt
	var revealed []byte
	if err := s.pool.QueryRow(ctx, `
		SELECT id, status, guesses_count, COALESCE(state->'revealed', '[]'::jsonb)
		FROM puzzle_attempt
		WHERE puzzle_id = $1 AND player_id = $2
	`, puzzleID, playerID).Scan(&a.ID, &a.Status, &a.GuessesCount, &revealed); err != nil {
		return nil, err
	}
	_ = json.Unmarshal(revealed, &a.Revealed)
	return &a, nil
}

// RecordGuess writes a guess row with its scored result and bumps the attempt's guess count in one transaction.
func (s *Store) RecordGuess(ctx context.Context, attemptID int64, animeID *int64, raw string, result json.RawMessage, position int) error {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	if _, err := tx.Exec(ctx, `
		INSERT INTO puzzle_guess (attempt_id, anime_id, raw_guess, normalized_guess, result, position)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, attemptID, animeID, raw, strings.ToLower(strings.TrimSpace(raw)), result, position); err != nil {
		return err
	}
	if _, err := tx.Exec(ctx, `UPDATE puzzle_attempt SET guesses_count = guesses_count + 1 WHERE id = $1`, attemptID); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

// CompleteAttempt marks the attempt finished with the given status.
func (s *Store) CompleteAttempt(ctx context.Context, attemptID int64, status string) error {
	_, err := s.pool.Exec(ctx, `
		UPDATE puzzle_attempt SET status = $2, completed_at = now() WHERE id = $1
	`, attemptID, status)
	return err
}

// AttemptResults returns the scored result of each guess oldest first so the client replays the table on reload.
func (s *Store) AttemptResults(ctx context.Context, attemptID int64) ([]json.RawMessage, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT result
		FROM puzzle_guess
		WHERE attempt_id = $1
		ORDER BY position ASC
	`, attemptID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]json.RawMessage, 0)
	for rows.Next() {
		var r []byte
		if err := rows.Scan(&r); err != nil {
			return nil, err
		}
		out = append(out, json.RawMessage(r))
	}
	return out, rows.Err()
}

package games

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"math/rand/v2"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

const WordleGameID = "wordle"

const maxWordleGuesses = 6

// Category order is intentional, share grid emoji left to right matches this.
var wordleCategories = []string{"format", "year", "episodes", "score", "source", "studios", "genres"}

type WordlePayload struct {
	Game       string   `json:"game"`
	MaxGuesses int      `json:"maxGuesses"`
	Categories []string `json:"categories"`
}

// WordleAnswer is stored in puzzle.answer_key. Never returned to the client.
type WordleAnswer struct {
	AnimeID  int64    `json:"animeId"`
	Slug     string   `json:"slug"`
	Title    string   `json:"title"`
	Format   *string  `json:"format,omitempty"`
	Year     *int     `json:"year,omitempty"`
	Episodes *int     `json:"episodes,omitempty"`
	Score    *int     `json:"score,omitempty"`
	Source   *string  `json:"source,omitempty"`
	Studios  []string `json:"studios,omitempty"`
	Genres   []string `json:"genres,omitempty"`
}

// FieldCompare carries the per-category result for one guess. Match is match | close | none.
type FieldCompare struct {
	Value     any      `json:"value"`
	Match     string   `json:"match"`
	Direction string   `json:"direction,omitempty"`
	Shared    []string `json:"shared,omitempty"`
}

type WordleCompare struct {
	Format   FieldCompare `json:"format"`
	Year     FieldCompare `json:"year"`
	Episodes FieldCompare `json:"episodes"`
	Score    FieldCompare `json:"score"`
	Source   FieldCompare `json:"source"`
	Studios  FieldCompare `json:"studios"`
	Genres   FieldCompare `json:"genres"`
}

type WordleEngine struct {
	pool *pgxpool.Pool
}

func NewWordleEngine(pool *pgxpool.Pool) *WordleEngine {
	return &WordleEngine{pool: pool}
}

func (e *WordleEngine) GameID() string { return WordleGameID }

type wordleAnime struct {
	ID       int64
	Slug     string
	Title    string
	Format   *string
	Year     *int
	Episodes *int
	Score    *int
	Source   *string
	Studios  []string
	Genres   []string
}

func (e *WordleEngine) GeneratePuzzle(ctx context.Context, seed string) (PuzzleDraft, error) {
	used, err := e.usedAnswerIDs(ctx)
	if err != nil {
		return PuzzleDraft{}, fmt.Errorf("load used: %w", err)
	}

	const baseFilter = `
		is_game_eligible = true
		AND is_adult = false
		AND popularity >= 5000
		AND format IN ('TV','TV_SHORT','MOVIE','OVA','ONA')
		AND title_primary IS NOT NULL
	`

	var count int
	if err := e.pool.QueryRow(ctx, `SELECT count(*) FROM anime WHERE `+baseFilter+` AND NOT (id = ANY($1))`, used).Scan(&count); err != nil {
		return PuzzleDraft{}, err
	}
	fellBack := false
	if count == 0 {
		if err := e.pool.QueryRow(ctx, `SELECT count(*) FROM anime WHERE `+baseFilter).Scan(&count); err != nil {
			return PuzzleDraft{}, err
		}
		if count == 0 {
			return PuzzleDraft{}, errors.New("no eligible anime, run the AniList ingest first")
		}
		fellBack = true
	}

	r := rand.New(rand.NewPCG(seedToUint64(seed), 0xBF58476D1CE4E5B9))
	offset := r.IntN(count)

	const selectCols = `
		a.id, a.slug, a.title_primary, a.format, a.season_year, a.episodes, a.average_score, a.source,
		COALESCE(
			(SELECT array_agg(s.name ORDER BY asg.is_main DESC, s.id)
			 FROM anime_studio asg JOIN studio s ON s.id = asg.studio_id
			 WHERE asg.anime_id = a.id),
			'{}'::text[]
		) AS studios,
		COALESCE(
			(SELECT array_agg(g.name ORDER BY g.id)
			 FROM anime_genre ag JOIN genre g ON g.id = ag.genre_id
			 WHERE ag.anime_id = a.id),
			'{}'::text[]
		) AS genres
	`

	pickQuery := `SELECT ` + selectCols + ` FROM anime a WHERE ` + baseFilter + ` AND NOT (a.id = ANY($2)) ORDER BY a.id OFFSET $1 LIMIT 1`
	args := []any{offset, used}
	if fellBack {
		pickQuery = `SELECT ` + selectCols + ` FROM anime a WHERE ` + baseFilter + ` ORDER BY a.id OFFSET $1 LIMIT 1`
		args = []any{offset}
	}

	var a wordleAnime
	if err := e.pool.QueryRow(ctx, pickQuery, args...).Scan(&a.ID, &a.Slug, &a.Title, &a.Format, &a.Year, &a.Episodes, &a.Score, &a.Source, &a.Studios, &a.Genres); err != nil {
		return PuzzleDraft{}, err
	}

	answer := WordleAnswer{
		AnimeID: a.ID, Slug: a.Slug, Title: a.Title,
		Format: a.Format, Year: a.Year, Episodes: a.Episodes, Score: a.Score, Source: a.Source,
		Studios: a.Studios, Genres: a.Genres,
	}
	payload := WordlePayload{Game: WordleGameID, MaxGuesses: maxWordleGuesses, Categories: wordleCategories}

	payloadJSON, _ := json.Marshal(payload)
	answerJSON, _ := json.Marshal(answer)
	return PuzzleDraft{Payload: payloadJSON, AnswerKey: answerJSON}, nil
}

func (e *WordleEngine) ValidateGuess(ctx context.Context, in GuessInput) (GuessResult, error) {
	var answer WordleAnswer
	if err := json.Unmarshal(in.AnswerKey, &answer); err != nil {
		return GuessResult{}, fmt.Errorf("decode answer: %w", err)
	}

	result := GuessResult{GuessesLeft: max(0, maxWordleGuesses-in.Position)}

	if in.AnimeID == nil {
		result.Status = "started"
		if in.Position >= maxWordleGuesses {
			result.Status = "lost"
			reveal, _ := json.Marshal(map[string]any{"answer": answer.Title, "slug": answer.Slug})
			result.NextClue = reveal
		}
		hint := "pick an anime from the autocomplete so we can compare it"
		result.Hint = &hint
		return result, nil
	}

	guess, err := e.fetchAnime(ctx, *in.AnimeID)
	if err != nil {
		return GuessResult{}, fmt.Errorf("fetch guess: %w", err)
	}

	cmp := WordleCompare{
		Format:   compareString(guess.Format, answer.Format),
		Year:     compareInt(guess.Year, answer.Year, 3),
		Episodes: compareInt(guess.Episodes, answer.Episodes, 5),
		Score:    compareInt(guess.Score, answer.Score, 5),
		Source:   compareString(guess.Source, answer.Source),
		Studios:  compareSet(guess.Studios, answer.Studios),
		Genres:   compareSet(guess.Genres, answer.Genres),
	}
	detail, _ := json.Marshal(cmp)
	result.Detail = detail

	result.Correct = *in.AnimeID == answer.AnimeID
	switch {
	case result.Correct:
		result.Status = "won"
	case in.Position >= maxWordleGuesses:
		result.Status = "lost"
		reveal, _ := json.Marshal(map[string]any{"answer": answer.Title, "slug": answer.Slug})
		result.NextClue = reveal
	default:
		result.Status = "started"
	}
	return result, nil
}

func (e *WordleEngine) ScoreAttempt(ctx context.Context, state AttemptState) (int, error) {
	if state.Status != "won" {
		return 0, nil
	}
	used := 0
	for _, g := range state.Guesses {
		used++
		if g.Correct {
			break
		}
	}
	return max(100-(used-1)*15, 10), nil
}

func (e *WordleEngine) BuildShare(ctx context.Context, state AttemptState) SharePayload {
	var rows []string
	for _, g := range state.Guesses {
		row := ""
		if g.Correct {
			row = strings.Repeat("🟩", len(wordleCategories))
		} else if g.Detail != nil {
			var c WordleCompare
			if err := json.Unmarshal(g.Detail, &c); err == nil {
				row += emojiFor(c.Format.Match)
				row += emojiFor(c.Year.Match)
				row += emojiFor(c.Episodes.Match)
				row += emojiFor(c.Score.Match)
				row += emojiFor(c.Source.Match)
				row += emojiFor(c.Studios.Match)
				row += emojiFor(c.Genres.Match)
			} else {
				row = strings.Repeat("⬛", len(wordleCategories))
			}
		} else {
			row = strings.Repeat("⬛", len(wordleCategories))
		}
		rows = append(rows, row)
	}
	grid := strings.Join(rows, "\n")

	header := fmt.Sprintf("onepiece wordle %d/%d", min(len(state.Guesses), maxWordleGuesses), maxWordleGuesses)
	if state.Status != "won" {
		header = fmt.Sprintf("onepiece wordle X/%d", maxWordleGuesses)
	}
	return SharePayload{Text: header + "\n" + grid, Emoji: grid}
}

func emojiFor(match string) string {
	switch match {
	case "match":
		return "🟩"
	case "close":
		return "🟨"
	default:
		return "⬛"
	}
}

func compareString(guess, answer *string) FieldCompare {
	val := any(nil)
	if guess != nil {
		val = *guess
	}
	if guess != nil && answer != nil && *guess == *answer {
		return FieldCompare{Value: val, Match: "match"}
	}
	return FieldCompare{Value: val, Match: "none"}
}

func compareInt(guess, answer *int, closeWindow int) FieldCompare {
	if guess == nil {
		return FieldCompare{Match: "none"}
	}
	val := *guess
	if answer == nil {
		return FieldCompare{Value: val, Match: "none"}
	}
	diff := *guess - *answer
	abs := diff
	if abs < 0 {
		abs = -abs
	}
	direction := ""
	if diff < 0 {
		direction = "up"
	} else if diff > 0 {
		direction = "down"
	}
	match := "none"
	switch {
	case abs == 0:
		match = "match"
	case abs <= closeWindow:
		match = "close"
	}
	return FieldCompare{Value: val, Match: match, Direction: direction}
}

func compareSet(guess, answer []string) FieldCompare {
	answerSet := make(map[string]bool, len(answer))
	for _, a := range answer {
		answerSet[a] = true
	}
	var shared []string
	for _, g := range guess {
		if answerSet[g] {
			shared = append(shared, g)
		}
	}
	match := "none"
	switch {
	case len(shared) > 0 && len(shared) == len(answer) && len(guess) == len(answer):
		match = "match"
	case len(shared) > 0:
		match = "close"
	}
	return FieldCompare{Value: guess, Match: match, Shared: shared}
}

func (e *WordleEngine) usedAnswerIDs(ctx context.Context) ([]int64, error) {
	rows, err := e.pool.Query(ctx, `
		SELECT (answer_key->>'animeId')::bigint
		FROM puzzle
		WHERE game_id = $1 AND answer_key ? 'animeId'
	`, WordleGameID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	ids := make([]int64, 0)
	for rows.Next() {
		var id int64
		if err := rows.Scan(&id); err == nil {
			ids = append(ids, id)
		}
	}
	return ids, rows.Err()
}

// fetchAnime pulls the anime row plus its studio and genre sets in a single query.
// Previously this was three round trips, the array_agg collapses them.
func (e *WordleEngine) fetchAnime(ctx context.Context, id int64) (*wordleAnime, error) {
	var a wordleAnime
	if err := e.pool.QueryRow(ctx, `
		SELECT
			a.id, a.slug, a.title_primary, a.format, a.season_year, a.episodes, a.average_score, a.source,
			COALESCE(
				(SELECT array_agg(s.name ORDER BY asg.is_main DESC, s.id)
				 FROM anime_studio asg
				 JOIN studio s ON s.id = asg.studio_id
				 WHERE asg.anime_id = a.id),
				'{}'::text[]
			) AS studios,
			COALESCE(
				(SELECT array_agg(g.name ORDER BY g.id)
				 FROM anime_genre ag
				 JOIN genre g ON g.id = ag.genre_id
				 WHERE ag.anime_id = a.id),
				'{}'::text[]
			) AS genres
		FROM anime a
		WHERE a.id = $1
	`, id).Scan(&a.ID, &a.Slug, &a.Title, &a.Format, &a.Year, &a.Episodes, &a.Score, &a.Source, &a.Studios, &a.Genres); err != nil {
		return nil, err
	}
	return &a, nil
}

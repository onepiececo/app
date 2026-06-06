package games

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"hash/fnv"
	"math/rand/v2"

	"github.com/jackc/pgx/v5/pgxpool"
)

const ClueGameID = "clue"

const maxClueGuesses = 6

// Clue is a single hint about the answer anime.
type Clue struct {
	Type  string `json:"type"`
	Value string `json:"value"`
}

// CluePayload is what the client sees in `puzzle.payload`. The clues slice is full length,
// but the client should only render `cluesVisible := 1 + guessesCount` entries.
type CluePayload struct {
	Game        string `json:"game"`
	MaxGuesses  int    `json:"maxGuesses"`
	Clues       []Clue `json:"clues"`
	GuessLabel  string `json:"guessLabel"`
}

// ClueAnswerKey lives in `puzzle.answer_key` and is never returned to the client.
type ClueAnswerKey struct {
	AnimeID int64  `json:"animeId"`
	Slug    string `json:"slug"`
	Title   string `json:"title"`
}

type ClueEngine struct {
	pool *pgxpool.Pool
}

func NewClueEngine(pool *pgxpool.Pool) *ClueEngine {
	return &ClueEngine{pool: pool}
}

func (e *ClueEngine) GameID() string { return ClueGameID }

type clueAnime struct {
	ID         int64
	Slug       string
	Title      string
	Format     *string
	SeasonYear *int
	Episodes   *int
	Popularity int
	CoverColor *string
}

func (e *ClueEngine) GeneratePuzzle(ctx context.Context, seed string) (PuzzleDraft, error) {
	used, err := e.usedAnswerIDs(ctx)
	if err != nil {
		return PuzzleDraft{}, fmt.Errorf("load used answers: %w", err)
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

	r := rand.New(rand.NewPCG(seedToUint64(seed), 0x9E3779B97F4A7C15))
	offset := r.IntN(count)

	pickQuery := `
		SELECT id, slug, title_primary, format, season_year, episodes, popularity, cover_color
		FROM anime
		WHERE ` + baseFilter + `
		  AND NOT (id = ANY($2))
		ORDER BY id
		OFFSET $1 LIMIT 1
	`
	args := []any{offset, used}
	if fellBack {
		pickQuery = `
			SELECT id, slug, title_primary, format, season_year, episodes, popularity, cover_color
			FROM anime
			WHERE ` + baseFilter + `
			ORDER BY id
			OFFSET $1 LIMIT 1
		`
		args = []any{offset}
	}

	var a clueAnime
	if err := e.pool.QueryRow(ctx, pickQuery, args...).Scan(&a.ID, &a.Slug, &a.Title, &a.Format, &a.SeasonYear, &a.Episodes, &a.Popularity, &a.CoverColor); err != nil {
		return PuzzleDraft{}, err
	}

	clues, err := e.buildClues(ctx, &a, r)
	if err != nil {
		return PuzzleDraft{}, err
	}

	payload := CluePayload{
		Game:       ClueGameID,
		MaxGuesses: maxClueGuesses,
		GuessLabel: "Guess the anime",
		Clues:      clues,
	}
	answer := ClueAnswerKey{AnimeID: a.ID, Slug: a.Slug, Title: a.Title}

	payloadJSON, _ := json.Marshal(payload)
	answerJSON, _ := json.Marshal(answer)
	return PuzzleDraft{Payload: payloadJSON, AnswerKey: answerJSON}, nil
}

func (e *ClueEngine) ValidateGuess(ctx context.Context, in GuessInput) (GuessResult, error) {
	var key ClueAnswerKey
	if err := json.Unmarshal(in.AnswerKey, &key); err != nil {
		return GuessResult{}, fmt.Errorf("decode answer key: %w", err)
	}

	correct := in.AnimeID != nil && *in.AnimeID == key.AnimeID
	res := GuessResult{
		Correct:     correct,
		GuessesLeft: maxClueGuesses - in.Position,
	}

	switch {
	case correct:
		res.Status = "won"
		res.GuessesLeft = max(0, maxClueGuesses-in.Position)
	case in.Position >= maxClueGuesses:
		res.Status = "lost"
		res.GuessesLeft = 0
		reveal, _ := json.Marshal(map[string]any{"answer": key.Title, "slug": key.Slug})
		res.NextClue = reveal
	default:
		res.Status = "started"
	}

	return res, nil
}

func (e *ClueEngine) ScoreAttempt(ctx context.Context, state AttemptState) (int, error) {
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
	pop, _ := lookupAnswerPopularity(ctx, e.pool, state.PuzzleID)
	score, _ := StandardScore(ScoreInput{
		GuessesUsed:      used,
		DurationMS:       state.EndedAt - state.StartedAt,
		AnswerPopularity: pop,
		Won:              true,
	})
	return score, nil
}

func (e *ClueEngine) BuildShare(ctx context.Context, state AttemptState) SharePayload {
	var emoji string
	for _, g := range state.Guesses {
		if g.Correct {
			emoji += "🟩"
		} else {
			emoji += "⬛"
		}
	}
	if state.Status == "lost" && len(state.Guesses) < maxClueGuesses {
		for i := len(state.Guesses); i < maxClueGuesses; i++ {
			emoji += "⬛"
		}
	}

	header := fmt.Sprintf("onepiece clue %d/%d", min(len(state.Guesses), maxClueGuesses), maxClueGuesses)
	if state.Status != "won" {
		header = fmt.Sprintf("onepiece clue X/%d", maxClueGuesses)
	}
	text := header + "\n" + emoji
	return SharePayload{Text: text, Emoji: emoji}
}

func (e *ClueEngine) buildClues(ctx context.Context, a *clueAnime, r *rand.Rand) ([]Clue, error) {
	clues := []Clue{
		{Type: "format_decade", Value: formatDecade(a.Format, a.SeasonYear)},
	}

	if g := pickOne(ctx, e.pool, r,
		`SELECT g.name FROM genre g JOIN anime_genre ag ON ag.genre_id = g.id WHERE ag.anime_id = $1`, a.ID); g != "" {
		clues = append(clues, Clue{Type: "genre", Value: g})
	}

	if s := pickOne(ctx, e.pool, r,
		`SELECT s.name FROM studio s JOIN anime_studio asg ON asg.studio_id = s.id WHERE asg.anime_id = $1 AND asg.is_main = true ORDER BY s.id`, a.ID); s != "" {
		clues = append(clues, Clue{Type: "studio", Value: s})
	}

	clues = append(clues, Clue{Type: "episode_bucket", Value: episodeBucket(a.Episodes)})

	if t := pickOne(ctx, e.pool, r,
		`SELECT t.name FROM tag t JOIN anime_tag at ON at.tag_id = t.id WHERE at.anime_id = $1 AND t.is_spoiler = false AND t.is_adult = false`, a.ID); t != "" {
		clues = append(clues, Clue{Type: "tag", Value: t})
	}

	cover := "viral"
	switch {
	case a.Popularity >= 200000:
		cover = "viral"
	case a.Popularity >= 50000:
		cover = "popular"
	case a.Popularity >= 10000:
		cover = "known"
	default:
		cover = "niche"
	}
	if a.CoverColor != nil && *a.CoverColor != "" {
		cover = *a.CoverColor + ", " + cover
	}
	clues = append(clues, Clue{Type: "cover_color", Value: cover})

	for len(clues) < maxClueGuesses {
		clues = append(clues, Clue{Type: "fallback", Value: "no extra clue available"})
	}
	return clues[:maxClueGuesses], nil
}

func formatDecade(format *string, year *int) string {
	f := "Anime"
	if format != nil && *format != "" {
		f = *format
	}
	if year == nil {
		return f
	}
	d := (*year / 10) * 10
	return fmt.Sprintf("%s, %ds", f, d)
}

func episodeBucket(eps *int) string {
	if eps == nil {
		return "unknown episode count"
	}
	e := *eps
	switch {
	case e <= 1:
		return "movie or 1 episode"
	case e <= 12:
		return "2 to 12 episodes"
	case e <= 24:
		return "13 to 24 episodes"
	case e <= 50:
		return "25 to 50 episodes"
	case e <= 99:
		return "51 to 99 episodes"
	default:
		return "100+ episodes"
	}
}

func pickOne(ctx context.Context, pool *pgxpool.Pool, r *rand.Rand, sql string, args ...any) string {
	rows, err := pool.Query(ctx, sql, args...)
	if err != nil {
		return ""
	}
	defer rows.Close()
	var options []string
	for rows.Next() {
		var v string
		if err := rows.Scan(&v); err == nil && v != "" {
			options = append(options, v)
		}
	}
	if rows.Err() != nil {
		return ""
	}
	if len(options) == 0 {
		return ""
	}
	return options[r.IntN(len(options))]
}

func seedToUint64(seed string) uint64 {
	h := fnv.New64a()
	_, _ = h.Write([]byte(seed))
	return h.Sum64()
}

// usedAnswerIDs returns every anime that has already been a clue answer, as a non-nil slice so it composes with NOT (id = ANY($1)).
func (e *ClueEngine) usedAnswerIDs(ctx context.Context) ([]int64, error) {
	rows, err := e.pool.Query(ctx, `
		SELECT (answer_key->>'animeId')::bigint
		FROM puzzle
		WHERE game_id = $1 AND answer_key ? 'animeId'
	`, ClueGameID)
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


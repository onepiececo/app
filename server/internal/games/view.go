package games

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/kgrahammatzen/onepiece-server/internal/anime"
)

const (
	StatusStarted = "started"
	StatusWon     = "won"
	StatusLost    = "lost"
)

var (
	ErrNoTries          = errors.New("games: no tries left")
	ErrNotPlaying       = errors.New("games: round already over")
	ErrInvalidDirection = errors.New("games: direction must be higher or lower")
)

// FieldCmp is one scalar attribute scored against the answer, the arrow points toward the answer when numeric.
type FieldCmp struct {
	Text   string `json:"text"`
	Status string `json:"status"`
	Arrow  string `json:"arrow,omitempty"`
}

// ItemCmp is one entry of a set attribute like a genre or a tag.
type ItemCmp struct {
	Text   string `json:"text"`
	Status string `json:"status"`
}

// GuessCompare is the full per attribute scoring of one guess, stored on the guess row and replayed on reload.
type GuessCompare struct {
	AnimeID int64     `json:"animeId"`
	Title   string    `json:"title"`
	Correct bool      `json:"correct"`
	Year    FieldCmp  `json:"year"`
	Studio  FieldCmp  `json:"studio"`
	Source  FieldCmp  `json:"source"`
	Score   FieldCmp  `json:"score"`
	Genres  []ItemCmp `json:"genres"`
	Tags    []ItemCmp `json:"tags"`
}

// Answer is the reveal sent only once a round is won or lost.
type Answer struct {
	AnimeID        int64  `json:"animeId"`
	Title          string `json:"title"`
	CoverSourceURL string `json:"coverSourceUrl,omitempty"`
	CoverColor     string `json:"coverColor,omitempty"`
	Sub            string `json:"sub"`
}

// View is the full client state for a puzzle and a player's attempt.
type View struct {
	ID         int64          `json:"id"`
	Game       string         `json:"game"`
	Date       string         `json:"date"`
	Status     string         `json:"status"`
	TriesLeft  int            `json:"triesLeft"`
	Budget     int            `json:"budget"`
	Categories []string       `json:"categories"`
	Guesses    []GuessCompare `json:"guesses"`
	Answer     *Answer        `json:"answer,omitempty"`
}

// GuessResult is returned after spending a try, carrying the freshly scored guess.
type GuessResult struct {
	Correct   bool          `json:"correct"`
	TriesLeft int           `json:"triesLeft"`
	Status    string        `json:"status"`
	Guess     *GuessCompare `json:"guess,omitempty"`
	Answer    *Answer       `json:"answer,omitempty"`
}

func decodeClue(p *Puzzle) (cluePayload, clueAnswer, error) {
	var pl cluePayload
	var ak clueAnswer
	if err := json.Unmarshal(p.Payload, &pl); err != nil {
		return pl, ak, err
	}
	if err := json.Unmarshal(p.AnswerKey, &ak); err != nil {
		return pl, ak, err
	}
	return pl, ak, nil
}

func answerFromKey(ak clueAnswer) *Answer {
	return &Answer{
		AnimeID:        ak.AnimeID,
		Title:          ak.Title,
		CoverSourceURL: ak.CoverSourceURL,
		CoverColor:     ak.CoverColor,
		Sub:            ak.Sub,
	}
}

func completed(status string) bool { return status == StatusWon || status == StatusLost }

// BuildView assembles the client state, replaying every scored guess and exposing the answer only when done.
func (s *Store) BuildView(ctx context.Context, p *Puzzle, a *Attempt) (*View, error) {
	pl, ak, err := decodeClue(p)
	if err != nil {
		return nil, err
	}

	results, err := s.AttemptResults(ctx, a.ID)
	if err != nil {
		return nil, err
	}
	guesses := make([]GuessCompare, 0, len(results))
	for _, raw := range results {
		var g GuessCompare
		if err := json.Unmarshal(raw, &g); err != nil {
			return nil, err
		}
		guesses = append(guesses, g)
	}

	v := &View{
		ID:         p.ID,
		Game:       p.GameID,
		Date:       p.Date.Format("2006-01-02"),
		Status:     a.Status,
		TriesLeft:  max(pl.Budget-len(guesses), 0),
		Budget:     pl.Budget,
		Categories: pl.Categories,
		Guesses:    guesses,
	}
	if completed(a.Status) {
		v.Answer = answerFromKey(ak)
	}
	return v, nil
}

// Guess scores a guessed anime against the answer, recording the comparison and ending the round on a win or a drained budget.
func (s *Store) Guess(ctx context.Context, p *Puzzle, a *Attempt, guess *anime.Detail) (*GuessResult, error) {
	pl, ak, err := decodeClue(p)
	if err != nil {
		return nil, err
	}
	if a.Status != StatusStarted {
		return nil, ErrNotPlaying
	}
	if a.GuessesCount >= pl.Budget {
		return nil, ErrNoTries
	}

	correct := guess.ID == ak.AnimeID
	cmp := compareClue(ak.Attrs, guess, correct)
	raw, err := json.Marshal(cmp)
	if err != nil {
		return nil, err
	}
	if err := s.RecordGuess(ctx, a.ID, &guess.ID, guess.TitlePrimary, raw, a.GuessesCount); err != nil {
		return nil, err
	}

	triesLeft := max(pl.Budget-(a.GuessesCount+1), 0)
	res := &GuessResult{Correct: correct, TriesLeft: triesLeft, Status: StatusStarted, Guess: &cmp}
	switch {
	case correct:
		if err := s.CompleteAttempt(ctx, a.ID, StatusWon); err != nil {
			return nil, err
		}
		res.Status = StatusWon
		res.Answer = answerFromKey(ak)
	case triesLeft <= 0:
		if err := s.CompleteAttempt(ctx, a.ID, StatusLost); err != nil {
			return nil, err
		}
		res.Status = StatusLost
		res.Answer = answerFromKey(ak)
	}
	return res, nil
}

func compareClue(answer clueAttrs, guess *anime.Detail, correct bool) GuessCompare {
	g := extractAttrs(guess)
	return GuessCompare{
		AnimeID: guess.ID,
		Title:   guess.TitlePrimary,
		Correct: correct,
		Year:    numberCmp(answer.Year, g.Year, func(n int) string { return strconv.Itoa(n) }),
		Studio:  exactCmp(answer.Studio, g.Studio),
		Source:  exactCmp(answer.Source, g.Source),
		Score:   numberCmp(answer.Score, g.Score, func(n int) string { return fmt.Sprintf("%.1f", float64(n)/10) }),
		Genres:  setCmp(answer.Genres, g.Genres, 4),
		Tags:    setCmp(answer.Tags, g.Tags, 4),
	}
}

func numberCmp(answer, guess *int, fmtN func(int) string) FieldCmp {
	if guess == nil {
		return FieldCmp{Text: "?", Status: "miss"}
	}
	text := fmtN(*guess)
	if answer == nil {
		return FieldCmp{Text: text, Status: "miss"}
	}
	switch {
	case *guess == *answer:
		return FieldCmp{Text: text, Status: "hit"}
	case *answer > *guess:
		return FieldCmp{Text: text, Status: "miss", Arrow: "up"}
	default:
		return FieldCmp{Text: text, Status: "miss", Arrow: "down"}
	}
}

func exactCmp(answer, guess string) FieldCmp {
	if guess == "" {
		return FieldCmp{Text: "?", Status: "miss"}
	}
	if strings.EqualFold(answer, guess) {
		return FieldCmp{Text: guess, Status: "hit"}
	}
	return FieldCmp{Text: guess, Status: "miss"}
}

func setCmp(answer, guess []string, limit int) []ItemCmp {
	have := make(map[string]bool, len(answer))
	for _, a := range answer {
		have[strings.ToLower(a)] = true
	}
	out := make([]ItemCmp, 0, limit)
	for _, g := range guess {
		if len(out) >= limit {
			break
		}
		status := "miss"
		if have[strings.ToLower(g)] {
			status = "hit"
		}
		out = append(out, ItemCmp{Text: g, Status: status})
	}
	return out
}

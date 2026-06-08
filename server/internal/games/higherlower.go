package games

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"math/rand"
	"time"
)

const (
	// HigherLowerGame is the game id seeded in the catalog.
	HigherLowerGame = "higherlower"
	// hlChainLen is how many anime make up a day's chain, the player calls higher or lower down the line.
	hlChainLen = 12
)

// hlItem is one anime in the chain, score is the stat the call is made on, stored as the 0 to 100 average.
type hlItem struct {
	AnimeID        int64  `json:"animeId"`
	Title          string `json:"title"`
	CoverSourceURL string `json:"coverSourceUrl,omitempty"`
	CoverColor     string `json:"coverColor,omitempty"`
	Score          int    `json:"score"`
}

// hlPayload is the client safe body, only the chain length since the items reveal one call at a time.
type hlPayload struct {
	Game   string `json:"game"`
	Length int    `json:"length"`
}

// hlAnswer is the server only chain with every member count.
type hlAnswer struct {
	Items []hlItem `json:"items"`
}

// GenerateHigherLower builds the day's chain, spreading picks across the popularity curve then shuffling so calls are not predictable.
func (s *Store) GenerateHigherLower(ctx context.Context, ar animeReader, date time.Time) (payload, answerKey json.RawMessage, seed string, err error) {
	iso := date.Format("2006-01-02")

	pool, err := s.EligibleAnimeIDs(ctx, answerPool)
	if err != nil {
		return nil, nil, "", err
	}
	if len(pool) < hlChainLen {
		return nil, nil, "", ErrPoolExhausted
	}

	start := int(dateSeed(HigherLowerGame, iso) % uint64(len(pool)))
	stride := len(pool) / hlChainLen
	items := make([]hlItem, 0, hlChainLen)
	for i := 0; len(items) < hlChainLen && i < len(pool); i++ {
		cand := pool[(start+i*stride)%len(pool)]
		d, err := ar.GetDetailByID(ctx, cand)
		if err != nil {
			return nil, nil, "", err
		}
		if d == nil || d.AverageScore == nil {
			continue
		}
		it := hlItem{AnimeID: d.ID, Title: d.TitlePrimary, Score: *d.AverageScore}
		if d.CoverSourceURL != nil {
			it.CoverSourceURL = *d.CoverSourceURL
		}
		if d.CoverColor != nil {
			it.CoverColor = *d.CoverColor
		}
		items = append(items, it)
	}
	if len(items) < hlChainLen {
		return nil, nil, "", ErrPoolExhausted
	}

	// Shuffle with the date seed so the order is stable per day but not the descending popularity walk.
	rng := rand.New(rand.NewSource(int64(dateSeed(HigherLowerGame, iso))))
	rng.Shuffle(len(items), func(a, b int) { items[a], items[b] = items[b], items[a] })

	payload, err = json.Marshal(hlPayload{Game: HigherLowerGame, Length: hlChainLen})
	if err != nil {
		return nil, nil, "", err
	}
	answerKey, err = json.Marshal(hlAnswer{Items: items})
	if err != nil {
		return nil, nil, "", err
	}
	return payload, answerKey, iso, nil
}

// EnsureHigherLowerForDate returns the stored puzzle id for a date or generates and stores one.
func (s *Store) EnsureHigherLowerForDate(ctx context.Context, ar animeReader, date time.Time) (int64, error) {
	existing, err := s.GetByGameDate(ctx, HigherLowerGame, date)
	if err != nil {
		return 0, err
	}
	if existing != nil {
		return existing.ID, nil
	}
	payload, answerKey, seed, err := s.GenerateHigherLower(ctx, ar, date)
	if err != nil {
		return 0, err
	}
	return s.UpsertPuzzle(ctx, HigherLowerGame, date, seed, payload, answerKey)
}

// BackfillHigherLower guarantees today then extends the history backwards by up to chunk older days.
func (s *Store) BackfillHigherLower(ctx context.Context, ar animeReader, logger *slog.Logger, chunk int) error {
	now := today()
	if _, err := s.EnsureHigherLowerForDate(ctx, ar, now); err != nil {
		if errors.Is(err, ErrPoolExhausted) {
			return nil
		}
		return err
	}

	oldest, ok, err := s.OldestDate(ctx, HigherLowerGame)
	if err != nil {
		return err
	}
	if !ok {
		oldest = now
	}

	for range chunk {
		oldest = oldest.AddDate(0, 0, -1)
		if _, err := s.EnsureHigherLowerForDate(ctx, ar, oldest); err != nil {
			if errors.Is(err, ErrPoolExhausted) {
				logger.Info("higher lower backfill reached the end of the answer pool", "oldest", oldest.Format("2006-01-02"))
				return nil
			}
			return err
		}
	}
	return nil
}

// HLEntry is one anime sent to the client, members present only once revealed.
type HLEntry struct {
	AnimeID        int64  `json:"animeId"`
	Title          string `json:"title"`
	CoverSourceURL string `json:"coverSourceUrl,omitempty"`
	CoverColor     string `json:"coverColor,omitempty"`
	Score          *int   `json:"score,omitempty"`
}

// HLView is the full client state, the reference shows its members and the next hides them until a call lands.
type HLView struct {
	ID        int64    `json:"id"`
	Game      string   `json:"game"`
	Date      string   `json:"date"`
	Status    string   `json:"status"`
	Index     int      `json:"index"`
	Length    int      `json:"length"`
	Reference HLEntry  `json:"reference"`
	Next      *HLEntry `json:"next,omitempty"`
}

// HLGuessResult is returned after a call, carrying the revealed count and the next state.
type HLGuessResult struct {
	Correct   bool    `json:"correct"`
	LastScore int     `json:"lastScore"`
	View      *HLView `json:"view"`
}

func decodeHL(p *Puzzle) (hlPayload, hlAnswer, error) {
	var pl hlPayload
	var ak hlAnswer
	if err := json.Unmarshal(p.Payload, &pl); err != nil {
		return pl, ak, err
	}
	if err := json.Unmarshal(p.AnswerKey, &ak); err != nil {
		return pl, ak, err
	}
	return pl, ak, nil
}

func hlEntry(it hlItem, revealScore bool) HLEntry {
	e := HLEntry{AnimeID: it.AnimeID, Title: it.Title, CoverSourceURL: it.CoverSourceURL, CoverColor: it.CoverColor}
	if revealScore {
		m := it.Score
		e.Score = &m
	}
	return e
}

// BuildHLView assembles the chain state at the player's current position.
func (s *Store) BuildHLView(p *Puzzle, a *Attempt) (*HLView, error) {
	pl, ak, err := decodeHL(p)
	if err != nil {
		return nil, err
	}
	idx := a.Index
	if idx >= len(ak.Items) {
		idx = len(ak.Items) - 1
	}
	done := completed(a.Status)
	v := &HLView{
		ID:        p.ID,
		Game:      p.GameID,
		Date:      p.Date.Format("2006-01-02"),
		Status:    a.Status,
		Index:     idx,
		Length:    pl.Length,
		Reference: hlEntry(ak.Items[idx], true),
	}
	if idx+1 < len(ak.Items) {
		next := hlEntry(ak.Items[idx+1], done)
		v.Next = &next
	}
	return v, nil
}

// GuessHL scores a higher or lower call against the next item, advancing the streak or ending the run.
func (s *Store) GuessHL(ctx context.Context, p *Puzzle, a *Attempt, direction string) (*HLGuessResult, error) {
	_, ak, err := decodeHL(p)
	if err != nil {
		return nil, err
	}
	if a.Status != StatusStarted {
		return nil, ErrNotPlaying
	}
	if direction != "higher" && direction != "lower" {
		return nil, ErrInvalidDirection
	}
	idx := a.Index
	if idx+1 >= len(ak.Items) {
		return nil, ErrNotPlaying
	}

	ref := ak.Items[idx].Score
	next := ak.Items[idx+1].Score
	correct := (direction == "higher" && next >= ref) || (direction == "lower" && next <= ref)

	newIdx := idx
	status := StatusStarted
	if correct {
		newIdx = idx + 1
		if newIdx >= len(ak.Items)-1 {
			status = StatusWon
		}
	} else {
		status = StatusLost
	}

	result, err := json.Marshal(map[string]any{"direction": direction, "correct": correct})
	if err != nil {
		return nil, err
	}
	if err := s.RecordHLGuess(ctx, a.ID, direction, result, newIdx, a.GuessesCount); err != nil {
		return nil, err
	}
	if status != StatusStarted {
		if err := s.CompleteAttempt(ctx, a.ID, status); err != nil {
			return nil, err
		}
	}

	updated := &Attempt{ID: a.ID, Status: status, GuessesCount: a.GuessesCount + 1, Index: newIdx}
	view, err := s.BuildHLView(p, updated)
	if err != nil {
		return nil, err
	}
	return &HLGuessResult{Correct: correct, LastScore: next, View: view}, nil
}

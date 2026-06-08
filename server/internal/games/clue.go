package games

import (
	"context"
	"crypto/sha256"
	"encoding/binary"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/kgrahammatzen/onepiece-server/internal/anime"
)

const (
	// ClueGame is the game id seeded in migration 005.
	ClueGame = "clue"
	// answerPool caps how deep into the popularity ranking an answer can be drawn from.
	answerPool = 1000
)

// clueCategories are the columns every guess is scored against, the budget scales with how many there are.
var clueCategories = []string{"Year", "Studio", "Source", "Score", "Genres", "Tags"}

// TryBudget gives three guesses per category. Tunable through clueCategories.
var TryBudget = 3 * len(clueCategories)

// ErrPoolExhausted means every eligible answer is already used for this game, so the backfill can stop walking back.
var ErrPoolExhausted = errors.New("games: answer pool exhausted")

// animeReader is the slice of the anime store the generator needs.
type animeReader interface {
	GetDetailByID(ctx context.Context, id int64) (*anime.Detail, error)
}

// clueAttrs are the comparable attributes pulled from an anime, used for both the answer and each guess.
type clueAttrs struct {
	Year   *int     `json:"year,omitempty"`
	Studio string   `json:"studio,omitempty"`
	Source string   `json:"source,omitempty"`
	Score  *int     `json:"score,omitempty"`
	Genres []string `json:"genres,omitempty"`
	Tags   []string `json:"tags,omitempty"`
}

// cluePayload is the client safe body, the compared categories and the try budget.
type cluePayload struct {
	Game       string   `json:"game"`
	Categories []string `json:"categories"`
	Budget     int      `json:"budget"`
}

// clueAnswer is the server only key, the hidden answer plus its comparable attributes.
type clueAnswer struct {
	AnimeID        int64     `json:"animeId"`
	Title          string    `json:"title"`
	CoverSourceURL string    `json:"coverSourceUrl,omitempty"`
	CoverColor     string    `json:"coverColor,omitempty"`
	Sub            string    `json:"sub"`
	Attrs          clueAttrs `json:"attrs"`
}

// dateSeed hashes the game and iso date to a stable value so a day always probes the pool the same way.
func dateSeed(game, iso string) uint64 {
	sum := sha256.Sum256([]byte(game + ":" + iso))
	return binary.BigEndian.Uint64(sum[:8])
}

// GenerateClue builds the clue puzzle for a date, picking an unused eligible anime and storing its attributes.
func (s *Store) GenerateClue(ctx context.Context, ar animeReader, date time.Time) (payload, answerKey json.RawMessage, seed string, animeID int64, err error) {
	iso := date.Format("2006-01-02")

	pool, err := s.EligibleAnimeIDs(ctx, answerPool)
	if err != nil {
		return nil, nil, "", 0, err
	}
	if len(pool) == 0 {
		return nil, nil, "", 0, ErrPoolExhausted
	}
	used, err := s.UsedAnswerAnimeIDs(ctx, ClueGame)
	if err != nil {
		return nil, nil, "", 0, err
	}

	start := int(dateSeed(ClueGame, iso) % uint64(len(pool)))
	chosen := int64(0)
	found := false
	for i := range len(pool) {
		cand := pool[(start+i)%len(pool)]
		if !used[cand] {
			chosen = cand
			found = true
			break
		}
	}
	if !found {
		return nil, nil, "", 0, ErrPoolExhausted
	}

	d, err := ar.GetDetailByID(ctx, chosen)
	if err != nil {
		return nil, nil, "", 0, err
	}
	if d == nil {
		return nil, nil, "", 0, fmt.Errorf("games: chosen anime %d has no detail", chosen)
	}

	ans := clueAnswer{
		AnimeID: d.ID,
		Title:   d.TitlePrimary,
		Sub:     clueSub(d),
		Attrs:   extractAttrs(d),
	}
	if d.CoverSourceURL != nil {
		ans.CoverSourceURL = *d.CoverSourceURL
	}
	if d.CoverColor != nil {
		ans.CoverColor = *d.CoverColor
	}

	payload, err = json.Marshal(cluePayload{Game: ClueGame, Categories: clueCategories, Budget: TryBudget})
	if err != nil {
		return nil, nil, "", 0, err
	}
	answerKey, err = json.Marshal(ans)
	if err != nil {
		return nil, nil, "", 0, err
	}
	return payload, answerKey, iso, d.ID, nil
}

// extractAttrs pulls the comparable attributes from an anime, capping the genre and tag sets so the answer key stays small.
func extractAttrs(d *anime.Detail) clueAttrs {
	a := clueAttrs{Year: d.SeasonYear, Studio: mainStudio(d), Score: d.AverageScore}
	if d.Source != nil {
		a.Source = labelize(*d.Source)
	}
	for i, g := range d.Genres {
		if i >= 6 {
			break
		}
		a.Genres = append(a.Genres, g)
	}
	for _, t := range d.Tags {
		if t.IsSpoiler {
			continue
		}
		a.Tags = append(a.Tags, t.Name)
		if len(a.Tags) >= 8 {
			break
		}
	}
	return a
}

// labelize turns an enum like LIGHT_NOVEL into Light novel.
func labelize(s string) string {
	s = strings.ReplaceAll(strings.ToLower(s), "_", " ")
	if s == "" {
		return s
	}
	return strings.ToUpper(s[:1]) + s[1:]
}

func mainStudio(d *anime.Detail) string {
	for _, st := range d.Studios {
		if st.IsMain {
			return st.Name
		}
	}
	if len(d.Studios) > 0 {
		return d.Studios[0].Name
	}
	return ""
}

func clueSub(d *anime.Detail) string {
	var parts []string
	if d.SeasonYear != nil {
		parts = append(parts, strconv.Itoa(*d.SeasonYear))
	}
	if st := mainStudio(d); st != "" {
		parts = append(parts, st)
	}
	return strings.Join(parts, " · ")
}

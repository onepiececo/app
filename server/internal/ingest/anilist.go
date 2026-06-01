package ingest

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/kgrahammatzen/onepiece-server/internal/anime"
)

const anilistEndpoint = "https://graphql.anilist.co"

type RateLimitError struct {
	RetryAfter time.Duration
}

func (e RateLimitError) Error() string {
	return fmt.Sprintf("rate limited, retry after %s", e.RetryAfter)
}

const anilistQuery = `
query CatalogPage($page: Int!, $perPage: Int!) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      currentPage
      hasNextPage
    }
    media(type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
      id
      idMal
      title {
        romaji
        english
        native
        userPreferred
      }
      synonyms
      format
      status
      source
      season
      seasonYear
      episodes
      duration
      averageScore
      meanScore
      popularity
      favourites
      isAdult
      genres
      tags {
        id
        name
        category
        rank
        isGeneralSpoiler
        isMediaSpoiler
        isAdult
      }
      studios(isMain: true) {
        edges {
          isMain
          node { id name }
        }
      }
      relations {
        edges {
          relationType
          node { id idMal }
        }
      }
      characters(perPage: 10, sort: [ROLE, RELEVANCE]) {
        edges {
          role
          node {
            id
            name { full native }
            image { large }
            gender
            age
          }
        }
      }
      coverImage {
        extraLarge
        large
        color
      }
      bannerImage
    }
  }
}
`

type anilistResponse struct {
	Data struct {
		Page struct {
			PageInfo struct {
				CurrentPage int  `json:"currentPage"`
				HasNextPage bool `json:"hasNextPage"`
			} `json:"pageInfo"`
			Media []anilistMedia `json:"media"`
		} `json:"Page"`
	} `json:"data"`
	Errors []struct {
		Message string `json:"message"`
	} `json:"errors"`
}

type anilistMedia struct {
	ID    int  `json:"id"`
	IDMal *int `json:"idMal"`
	Title struct {
		Romaji        *string `json:"romaji"`
		English       *string `json:"english"`
		Native        *string `json:"native"`
		UserPreferred *string `json:"userPreferred"`
	} `json:"title"`
	Synonyms     []string `json:"synonyms"`
	Format       *string  `json:"format"`
	Status       *string  `json:"status"`
	Source       *string  `json:"source"`
	Season       *string  `json:"season"`
	SeasonYear   *int     `json:"seasonYear"`
	Episodes     *int     `json:"episodes"`
	Duration     *int     `json:"duration"`
	AverageScore *int     `json:"averageScore"`
	MeanScore    *int     `json:"meanScore"`
	Popularity   int      `json:"popularity"`
	Favourites   int      `json:"favourites"`
	IsAdult      bool     `json:"isAdult"`
	Genres       []string `json:"genres"`
	Tags         []struct {
		ID               int     `json:"id"`
		Name             string  `json:"name"`
		Category         *string `json:"category"`
		Rank             *int    `json:"rank"`
		IsGeneralSpoiler bool    `json:"isGeneralSpoiler"`
		IsMediaSpoiler   bool    `json:"isMediaSpoiler"`
		IsAdult          bool    `json:"isAdult"`
	} `json:"tags"`
	Studios struct {
		Edges []struct {
			IsMain bool `json:"isMain"`
			Node   struct {
				ID   int    `json:"id"`
				Name string `json:"name"`
			} `json:"node"`
		} `json:"edges"`
	} `json:"studios"`
	Relations struct {
		Edges []struct {
			RelationType string `json:"relationType"`
			Node         struct {
				ID    int  `json:"id"`
				IDMal *int `json:"idMal"`
			} `json:"node"`
		} `json:"edges"`
	} `json:"relations"`
	Characters struct {
		Edges []struct {
			Role string `json:"role"`
			Node struct {
				ID   int `json:"id"`
				Name struct {
					Full   *string `json:"full"`
					Native *string `json:"native"`
				} `json:"name"`
				Image struct {
					Large *string `json:"large"`
				} `json:"image"`
				Gender *string `json:"gender"`
				Age    *string `json:"age"`
			} `json:"node"`
		} `json:"edges"`
	} `json:"characters"`
	CoverImage struct {
		ExtraLarge *string `json:"extraLarge"`
		Large      *string `json:"large"`
		Color      *string `json:"color"`
	} `json:"coverImage"`
	BannerImage *string `json:"bannerImage"`
}

type AniListPage struct {
	Items       []anilistMedia
	HasNextPage bool
}

type AniListClient struct {
	HTTP *http.Client
}

func NewAniListClient() *AniListClient {
	return &AniListClient{HTTP: &http.Client{Timeout: 30 * time.Second}}
}

func (c *AniListClient) FetchPage(ctx context.Context, page, perPage int) (*AniListPage, error) {
	body, _ := json.Marshal(map[string]any{
		"query":     anilistQuery,
		"variables": map[string]int{"page": page, "perPage": perPage},
	})

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, anilistEndpoint, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("content-type", "application/json")
	req.Header.Set("accept", "application/json")

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusTooManyRequests {
		secs, _ := strconv.Atoi(resp.Header.Get("retry-after"))
		if secs <= 0 {
			secs = 60
		}
		return nil, RateLimitError{RetryAfter: time.Duration(secs) * time.Second}
	}
	if resp.StatusCode >= 400 {
		raw, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("anilist %d: %s", resp.StatusCode, string(raw))
	}

	var parsed anilistResponse
	if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
		return nil, err
	}
	if len(parsed.Errors) > 0 {
		return nil, fmt.Errorf("anilist graphql error: %s", parsed.Errors[0].Message)
	}

	return &AniListPage{
		Items:       parsed.Data.Page.Media,
		HasNextPage: parsed.Data.Page.PageInfo.HasNextPage,
	}, nil
}

// ToUpsert maps a raw AniList media record into an anime.AnimeUpsert payload.
func toUpsert(m anilistMedia) *anime.AnimeUpsert {
	title := pickTitle(m.Title.English, m.Title.UserPreferred, m.Title.Romaji, m.Title.Native)
	if title == "" {
		title = "Untitled"
	}

	slug := anime.Slugify(title) + "-" + strconv.FormatInt(int64(m.ID), 36)

	u := &anime.AnimeUpsert{
		Slug:            slug,
		TitlePrimary:    title,
		TitleRomaji:     m.Title.Romaji,
		TitleEnglish:    m.Title.English,
		TitleNative:     m.Title.Native,
		Format:          m.Format,
		Status:          m.Status,
		Source:          m.Source,
		Season:          m.Season,
		SeasonYear:      m.SeasonYear,
		Episodes:        m.Episodes,
		DurationMinutes: m.Duration,
		AverageScore:    m.AverageScore,
		MeanScore:       m.MeanScore,
		Popularity:      m.Popularity,
		Favourites:      m.Favourites,
		IsAdult:         m.IsAdult,
		CoverSourceURL:  pickURL(m.CoverImage.ExtraLarge, m.CoverImage.Large),
		BannerSourceURL: m.BannerImage,
		CoverColor:      m.CoverImage.Color,
	}

	for _, raw := range collectAliases(m) {
		u.Aliases = append(u.Aliases, anime.AliasUpsert{Alias: raw, Source: "anilist", Priority: 100})
	}

	u.Genres = m.Genres

	for _, edge := range m.Studios.Edges {
		if edge.Node.Name == "" {
			continue
		}
		src := "anilist"
		sid := strconv.Itoa(edge.Node.ID)
		u.Studios = append(u.Studios, anime.StudioUpsert{
			Source:   &src,
			SourceID: &sid,
			Name:     edge.Node.Name,
			IsMain:   edge.IsMain,
		})
	}

	for _, t := range m.Tags {
		if t.Name == "" {
			continue
		}
		src := "anilist"
		sid := strconv.Itoa(t.ID)
		u.Tags = append(u.Tags, anime.TagUpsert{
			Source:    &src,
			SourceID:  &sid,
			Name:      t.Name,
			Category:  t.Category,
			IsSpoiler: t.IsGeneralSpoiler || t.IsMediaSpoiler,
			IsAdult:   t.IsAdult,
			Rank:      t.Rank,
		})
	}

	for _, edge := range m.Relations.Edges {
		if edge.RelationType == "" || edge.Node.ID == 0 {
			continue
		}
		u.Relations = append(u.Relations, anime.RelationUpsert{
			ToSource:     "anilist",
			ToSourceID:   strconv.Itoa(edge.Node.ID),
			RelationType: edge.RelationType,
		})
	}

	for _, edge := range m.Characters.Edges {
		name := pickTitle(edge.Node.Name.Full, edge.Node.Name.Native)
		if name == "" || edge.Node.ID == 0 {
			continue
		}
		role := edge.Role
		if role == "" {
			role = "SUPPORTING"
		}
		u.Characters = append(u.Characters, anime.CharacterUpsert{
			Source:     "anilist",
			SourceID:   strconv.Itoa(edge.Node.ID),
			NameFull:   name,
			NameNative: edge.Node.Name.Native,
			ImageURL:   edge.Node.Image.Large,
			Gender:     edge.Node.Gender,
			Age:        edge.Node.Age,
			Role:       role,
		})
	}

	return u
}

func pickTitle(opts ...*string) string {
	for _, o := range opts {
		if o != nil && strings.TrimSpace(*o) != "" {
			return strings.TrimSpace(*o)
		}
	}
	return ""
}

func pickURL(opts ...*string) *string {
	for _, o := range opts {
		if o != nil && *o != "" {
			return o
		}
	}
	return nil
}

func collectAliases(m anilistMedia) []string {
	seen := map[string]struct{}{}
	var out []string
	add := func(s *string) {
		if s == nil {
			return
		}
		v := strings.TrimSpace(*s)
		if v == "" {
			return
		}
		if _, ok := seen[v]; ok {
			return
		}
		seen[v] = struct{}{}
		out = append(out, v)
	}
	add(m.Title.Romaji)
	add(m.Title.English)
	add(m.Title.Native)
	add(m.Title.UserPreferred)
	for _, s := range m.Synonyms {
		add(&s)
	}
	return out
}

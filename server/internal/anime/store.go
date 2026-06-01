package anime

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Store struct {
	pool *pgxpool.Pool
}

func NewStore(pool *pgxpool.Pool) *Store {
	return &Store{pool: pool}
}

type Anime struct {
	ID              int64   `json:"id"`
	Slug            string  `json:"slug"`
	TitlePrimary    string  `json:"titlePrimary"`
	TitleRomaji     *string `json:"titleRomaji,omitempty"`
	TitleEnglish    *string `json:"titleEnglish,omitempty"`
	TitleNative     *string `json:"titleNative,omitempty"`
	Format          *string `json:"format,omitempty"`
	Status          *string `json:"status,omitempty"`
	Season          *string `json:"season,omitempty"`
	SeasonYear      *int    `json:"seasonYear,omitempty"`
	Episodes        *int    `json:"episodes,omitempty"`
	DurationMinutes *int    `json:"durationMinutes,omitempty"`
	AverageScore    *int    `json:"averageScore,omitempty"`
	MeanScore       *int    `json:"meanScore,omitempty"`
	Popularity      int     `json:"popularity"`
	Favourites      int     `json:"favourites"`
	IsAdult         bool    `json:"isAdult"`
	IsGameEligible  bool    `json:"isGameEligible"`
	CoverSourceURL  *string `json:"coverSourceUrl,omitempty"`
	BannerSourceURL *string `json:"bannerSourceUrl,omitempty"`
	CoverColor      *string `json:"coverColor,omitempty"`
}

type AnimeUpsert struct {
	Slug            string
	TitlePrimary    string
	TitleRomaji     *string
	TitleEnglish    *string
	TitleNative     *string
	Format          *string
	Status          *string
	Season          *string
	SeasonYear      *int
	Episodes        *int
	DurationMinutes *int
	AverageScore    *int
	MeanScore       *int
	Popularity      int
	Favourites      int
	IsAdult         bool
	CoverSourceURL  *string
	BannerSourceURL *string
	CoverColor      *string

	Aliases   []AliasUpsert
	Studios   []StudioUpsert
	Tags      []TagUpsert
	Genres    []string
	Relations []RelationUpsert
}

type AliasUpsert struct {
	Alias    string
	Source   string
	Priority int
}

type StudioUpsert struct {
	Source         *string
	SourceID       *string
	Name           string
	IsMain         bool
}

type TagUpsert struct {
	Source    *string
	SourceID  *string
	Name      string
	Category  *string
	IsSpoiler bool
	IsAdult   bool
	Rank      *int
}

type RelationUpsert struct {
	ToSource     string
	ToSourceID   string
	RelationType string
}

// Upsert writes anime plus child rows in a transaction. Returns the anime id.
// Slug is the lookup key, callers must ensure it is stable across re-ingestion of the same upstream record.
func (s *Store) Upsert(ctx context.Context, u *AnimeUpsert) (int64, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return 0, fmt.Errorf("begin: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var animeID int64
	err = tx.QueryRow(ctx, `
		INSERT INTO anime (slug, title_primary, title_romaji, title_english, title_native,
		                   format, status, season, season_year, episodes, duration_minutes,
		                   average_score, mean_score, popularity, favourites, is_adult,
		                   cover_source_url, banner_source_url, cover_color, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19, now())
		ON CONFLICT (slug) DO UPDATE SET
			title_primary     = EXCLUDED.title_primary,
			title_romaji      = EXCLUDED.title_romaji,
			title_english     = EXCLUDED.title_english,
			title_native      = EXCLUDED.title_native,
			format            = EXCLUDED.format,
			status            = EXCLUDED.status,
			season            = EXCLUDED.season,
			season_year       = EXCLUDED.season_year,
			episodes          = EXCLUDED.episodes,
			duration_minutes  = EXCLUDED.duration_minutes,
			average_score     = EXCLUDED.average_score,
			mean_score        = EXCLUDED.mean_score,
			popularity        = EXCLUDED.popularity,
			favourites        = EXCLUDED.favourites,
			is_adult          = EXCLUDED.is_adult,
			cover_source_url  = EXCLUDED.cover_source_url,
			banner_source_url = EXCLUDED.banner_source_url,
			cover_color       = EXCLUDED.cover_color,
			updated_at        = now()
		RETURNING id
	`, u.Slug, u.TitlePrimary, u.TitleRomaji, u.TitleEnglish, u.TitleNative,
		u.Format, u.Status, u.Season, u.SeasonYear, u.Episodes, u.DurationMinutes,
		u.AverageScore, u.MeanScore, u.Popularity, u.Favourites, u.IsAdult,
		u.CoverSourceURL, u.BannerSourceURL, u.CoverColor).Scan(&animeID)
	if err != nil {
		return 0, fmt.Errorf("upsert anime: %w", err)
	}

	for _, a := range u.Aliases {
		na := Normalize(a.Alias)
		if na == "" {
			continue
		}
		_, err := tx.Exec(ctx, `
			INSERT INTO anime_alias (anime_id, alias, normalized_alias, source, priority)
			VALUES ($1, $2, $3, $4, $5)
			ON CONFLICT (anime_id, normalized_alias) DO UPDATE SET
				alias    = EXCLUDED.alias,
				source   = EXCLUDED.source,
				priority = LEAST(anime_alias.priority, EXCLUDED.priority)
		`, animeID, a.Alias, na, a.Source, a.Priority)
		if err != nil {
			return 0, fmt.Errorf("upsert alias: %w", err)
		}
	}

	for _, name := range u.Genres {
		if name == "" {
			continue
		}
		var genreID int64
		if err := tx.QueryRow(ctx, `
			INSERT INTO genre (name) VALUES ($1)
			ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
			RETURNING id
		`, name).Scan(&genreID); err != nil {
			return 0, fmt.Errorf("upsert genre: %w", err)
		}
		if _, err := tx.Exec(ctx, `
			INSERT INTO anime_genre (anime_id, genre_id) VALUES ($1, $2)
			ON CONFLICT DO NOTHING
		`, animeID, genreID); err != nil {
			return 0, fmt.Errorf("link genre: %w", err)
		}
	}

	for _, st := range u.Studios {
		if st.Name == "" {
			continue
		}
		nn := Normalize(st.Name)
		var studioID int64
		if err := tx.QueryRow(ctx, `
			INSERT INTO studio (source, source_id, name, normalized_name)
			VALUES ($1, $2, $3, $4)
			ON CONFLICT (normalized_name) DO UPDATE SET
				source    = COALESCE(studio.source,    EXCLUDED.source),
				source_id = COALESCE(studio.source_id, EXCLUDED.source_id),
				name      = EXCLUDED.name
			RETURNING id
		`, st.Source, st.SourceID, st.Name, nn).Scan(&studioID); err != nil {
			return 0, fmt.Errorf("upsert studio: %w", err)
		}
		if _, err := tx.Exec(ctx, `
			INSERT INTO anime_studio (anime_id, studio_id, is_main)
			VALUES ($1, $2, $3)
			ON CONFLICT (anime_id, studio_id) DO UPDATE SET is_main = EXCLUDED.is_main
		`, animeID, studioID, st.IsMain); err != nil {
			return 0, fmt.Errorf("link studio: %w", err)
		}
	}

	for _, t := range u.Tags {
		if t.Name == "" {
			continue
		}
		nn := Normalize(t.Name)
		var tagID int64
		if err := tx.QueryRow(ctx, `
			INSERT INTO tag (source, source_id, name, normalized_name, category, is_spoiler, is_adult)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
			ON CONFLICT (normalized_name) DO UPDATE SET
				category   = COALESCE(tag.category, EXCLUDED.category),
				is_spoiler = EXCLUDED.is_spoiler,
				is_adult   = EXCLUDED.is_adult
			RETURNING id
		`, t.Source, t.SourceID, t.Name, nn, t.Category, t.IsSpoiler, t.IsAdult).Scan(&tagID); err != nil {
			return 0, fmt.Errorf("upsert tag: %w", err)
		}
		if _, err := tx.Exec(ctx, `
			INSERT INTO anime_tag (anime_id, tag_id, rank)
			VALUES ($1, $2, $3)
			ON CONFLICT (anime_id, tag_id) DO UPDATE SET rank = EXCLUDED.rank
		`, animeID, tagID, t.Rank); err != nil {
			return 0, fmt.Errorf("link tag: %w", err)
		}
	}

	if _, err := tx.Exec(ctx, `DELETE FROM anime_relation WHERE from_anime_id = $1`, animeID); err != nil {
		return 0, fmt.Errorf("clear relations: %w", err)
	}
	for _, r := range u.Relations {
		if _, err := tx.Exec(ctx, `
			INSERT INTO anime_relation (from_anime_id, external_to_source, external_to_id, relation_type)
			VALUES ($1, $2, $3, $4)
		`, animeID, r.ToSource, r.ToSourceID, r.RelationType); err != nil {
			return 0, fmt.Errorf("insert relation: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return 0, fmt.Errorf("commit: %w", err)
	}
	return animeID, nil
}

// ApplyAliasOverrides inserts the curated SeedAliases as priority 1 entries.
// Called at the end of every ingestion run so manual abbreviations always win the search ordering.
func (s *Store) ApplyAliasOverrides(ctx context.Context) error {
	for slug, aliases := range SeedAliases {
		var id int64
		err := s.pool.QueryRow(ctx, `SELECT id FROM anime WHERE slug = $1`, slug).Scan(&id)
		if err == pgx.ErrNoRows {
			continue
		}
		if err != nil {
			return err
		}
		for _, a := range aliases {
			na := Normalize(a)
			if na == "" {
				continue
			}
			if _, err := s.pool.Exec(ctx, `
				INSERT INTO anime_alias (anime_id, alias, normalized_alias, source, priority)
				VALUES ($1, $2, $3, 'manual', 1)
				ON CONFLICT (anime_id, normalized_alias) DO UPDATE SET
					alias    = EXCLUDED.alias,
					source   = EXCLUDED.source,
					priority = 1
			`, id, a, na); err != nil {
				return err
			}
		}
	}
	return nil
}

func (s *Store) GetBySlug(ctx context.Context, slug string) (*Anime, error) {
	return s.scanOne(ctx, `WHERE slug = $1`, slug)
}

func (s *Store) GetByID(ctx context.Context, id int64) (*Anime, error) {
	return s.scanOne(ctx, `WHERE id = $1`, id)
}

func (s *Store) scanOne(ctx context.Context, where string, args ...any) (*Anime, error) {
	row := s.pool.QueryRow(ctx, `
		SELECT id, slug, title_primary, title_romaji, title_english, title_native,
		       format, status, season, season_year, episodes, duration_minutes,
		       average_score, mean_score, popularity, favourites, is_adult,
		       is_game_eligible, cover_source_url, banner_source_url, cover_color
		FROM anime
	`+where, args...)

	var a Anime
	err := row.Scan(&a.ID, &a.Slug, &a.TitlePrimary, &a.TitleRomaji, &a.TitleEnglish, &a.TitleNative,
		&a.Format, &a.Status, &a.Season, &a.SeasonYear, &a.Episodes, &a.DurationMinutes,
		&a.AverageScore, &a.MeanScore, &a.Popularity, &a.Favourites, &a.IsAdult,
		&a.IsGameEligible, &a.CoverSourceURL, &a.BannerSourceURL, &a.CoverColor)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &a, nil
}

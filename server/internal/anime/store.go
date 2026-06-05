package anime

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// countTTL bounds how stale the cached catalog count may be since it only changes when ingest runs.
const countTTL = 60 * time.Second

type Store struct {
	pool *pgxpool.Pool

	countMu  sync.Mutex
	countVal int
	countExp time.Time
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
	Source          *string `json:"source,omitempty"`
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
	Source          *string
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

	Aliases    []AliasUpsert
	Studios    []StudioUpsert
	Tags       []TagUpsert
	Genres     []string
	Relations  []RelationUpsert
	Characters []CharacterUpsert
}

type CharacterUpsert struct {
	Source     string
	SourceID   string
	NameFull   string
	NameNative *string
	ImageURL   *string
	Gender     *string
	Age        *string
	// Role is one of MAIN, SUPPORTING, BACKGROUND per AniList's CharacterRole enum.
	Role string
}

type AliasUpsert struct {
	Alias    string
	Source   string
	Priority int
}

type StudioUpsert struct {
	Source   *string
	SourceID *string
	Name     string
	IsMain   bool
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
		                   format, status, source, season, season_year, episodes, duration_minutes,
		                   average_score, mean_score, popularity, favourites, is_adult,
		                   cover_source_url, banner_source_url, cover_color, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20, now())
		ON CONFLICT (slug) DO UPDATE SET
			title_primary     = EXCLUDED.title_primary,
			title_romaji      = EXCLUDED.title_romaji,
			title_english     = EXCLUDED.title_english,
			title_native      = EXCLUDED.title_native,
			format            = EXCLUDED.format,
			status            = EXCLUDED.status,
			source            = EXCLUDED.source,
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
		u.Format, u.Status, u.Source, u.Season, u.SeasonYear, u.Episodes, u.DurationMinutes,
		u.AverageScore, u.MeanScore, u.Popularity, u.Favourites, u.IsAdult,
		u.CoverSourceURL, u.BannerSourceURL, u.CoverColor).Scan(&animeID)
	if err != nil {
		return 0, fmt.Errorf("upsert anime: %w", err)
	}

	aliasBatch := &pgx.Batch{}
	for _, a := range u.Aliases {
		na := Normalize(a.Alias)
		if na == "" {
			continue
		}
		aliasBatch.Queue(`
			INSERT INTO anime_alias (anime_id, alias, normalized_alias, source, priority)
			VALUES ($1, $2, $3, $4, $5)
			ON CONFLICT (anime_id, normalized_alias) DO UPDATE SET
				alias    = EXCLUDED.alias,
				source   = EXCLUDED.source,
				priority = LEAST(anime_alias.priority, EXCLUDED.priority)
		`, animeID, a.Alias, na, a.Source, a.Priority)
	}
	if err := execBatch(ctx, tx, aliasBatch); err != nil {
		return 0, fmt.Errorf("upsert aliases: %w", err)
	}

	genreBatch := &pgx.Batch{}
	for _, name := range u.Genres {
		if name == "" {
			continue
		}
		genreBatch.Queue(`
			WITH g AS (
				INSERT INTO genre (name) VALUES ($2)
				ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
				RETURNING id
			)
			INSERT INTO anime_genre (anime_id, genre_id)
			SELECT $1, id FROM g
			ON CONFLICT DO NOTHING
		`, animeID, name)
	}
	if err := execBatch(ctx, tx, genreBatch); err != nil {
		return 0, fmt.Errorf("upsert genres: %w", err)
	}

	studioBatch := &pgx.Batch{}
	for _, st := range u.Studios {
		if st.Name == "" {
			continue
		}
		studioBatch.Queue(`
			WITH s AS (
				INSERT INTO studio (source, source_id, name, normalized_name)
				VALUES ($2, $3, $4, $5)
				ON CONFLICT (normalized_name) DO UPDATE SET
					source    = COALESCE(studio.source,    EXCLUDED.source),
					source_id = COALESCE(studio.source_id, EXCLUDED.source_id),
					name      = EXCLUDED.name
				RETURNING id
			)
			INSERT INTO anime_studio (anime_id, studio_id, is_main)
			SELECT $1, id, $6 FROM s
			ON CONFLICT (anime_id, studio_id) DO UPDATE SET is_main = EXCLUDED.is_main
		`, animeID, st.Source, st.SourceID, st.Name, Normalize(st.Name), st.IsMain)
	}
	if err := execBatch(ctx, tx, studioBatch); err != nil {
		return 0, fmt.Errorf("upsert studios: %w", err)
	}

	tagBatch := &pgx.Batch{}
	for _, t := range u.Tags {
		if t.Name == "" {
			continue
		}
		tagBatch.Queue(`
			WITH t AS (
				INSERT INTO tag (source, source_id, name, normalized_name, category, is_spoiler, is_adult)
				VALUES ($2, $3, $4, $5, $6, $7, $8)
				ON CONFLICT (normalized_name) DO UPDATE SET
					category   = COALESCE(tag.category, EXCLUDED.category),
					is_spoiler = EXCLUDED.is_spoiler,
					is_adult   = EXCLUDED.is_adult
				RETURNING id
			)
			INSERT INTO anime_tag (anime_id, tag_id, rank)
			SELECT $1, id, $9 FROM t
			ON CONFLICT (anime_id, tag_id) DO UPDATE SET rank = EXCLUDED.rank
		`, animeID, t.Source, t.SourceID, t.Name, Normalize(t.Name), t.Category, t.IsSpoiler, t.IsAdult, t.Rank)
	}
	if err := execBatch(ctx, tx, tagBatch); err != nil {
		return 0, fmt.Errorf("upsert tags: %w", err)
	}

	if _, err := tx.Exec(ctx, `DELETE FROM anime_relation WHERE from_anime_id = $1`, animeID); err != nil {
		return 0, fmt.Errorf("clear relations: %w", err)
	}
	relationBatch := &pgx.Batch{}
	for _, r := range u.Relations {
		relationBatch.Queue(`
			INSERT INTO anime_relation (from_anime_id, external_to_source, external_to_id, relation_type)
			VALUES ($1, $2, $3, $4)
		`, animeID, r.ToSource, r.ToSourceID, r.RelationType)
	}
	if err := execBatch(ctx, tx, relationBatch); err != nil {
		return 0, fmt.Errorf("insert relations: %w", err)
	}

	charaBatch := &pgx.Batch{}
	for _, c := range u.Characters {
		if c.NameFull == "" || c.SourceID == "" {
			continue
		}
		role := c.Role
		if role == "" {
			role = "SUPPORTING"
		}
		charaBatch.Queue(`
			WITH c AS (
				INSERT INTO chara (source, source_id, name_full, name_native, image_url, gender, age, updated_at)
				VALUES ($2, $3, $4, $5, $6, $7, $8, now())
				ON CONFLICT (source, source_id) DO UPDATE SET
					name_full   = EXCLUDED.name_full,
					name_native = COALESCE(EXCLUDED.name_native, chara.name_native),
					image_url   = COALESCE(EXCLUDED.image_url, chara.image_url),
					gender      = COALESCE(EXCLUDED.gender, chara.gender),
					age         = COALESCE(EXCLUDED.age, chara.age),
					updated_at  = now()
				RETURNING id
			)
			INSERT INTO anime_chara (anime_id, chara_id, role)
			SELECT $1, id, $9 FROM c
			ON CONFLICT (anime_id, chara_id) DO UPDATE SET role = EXCLUDED.role
		`, animeID, c.Source, c.SourceID, c.NameFull, c.NameNative, c.ImageURL, c.Gender, c.Age, role)
	}
	if err := execBatch(ctx, tx, charaBatch); err != nil {
		return 0, fmt.Errorf("upsert characters: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return 0, fmt.Errorf("commit: %w", err)
	}
	return animeID, nil
}

// batchSender is satisfied by both pgx.Tx and the pool so execBatch works inside or outside a transaction.
type batchSender interface {
	SendBatch(ctx context.Context, b *pgx.Batch) pgx.BatchResults
}

// execBatch pipelines every queued statement in one round trip and drains the results.
func execBatch(ctx context.Context, q batchSender, batch *pgx.Batch) error {
	if batch.Len() == 0 {
		return nil
	}
	br := q.SendBatch(ctx, batch)
	for i := 0; i < batch.Len(); i++ {
		if _, err := br.Exec(); err != nil {
			_ = br.Close()
			return err
		}
	}
	return br.Close()
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
		batch := &pgx.Batch{}
		for _, a := range aliases {
			na := Normalize(a)
			if na == "" {
				continue
			}
			batch.Queue(`
				INSERT INTO anime_alias (anime_id, alias, normalized_alias, source, priority)
				VALUES ($1, $2, $3, 'manual', 1)
				ON CONFLICT (anime_id, normalized_alias) DO UPDATE SET
					alias    = EXCLUDED.alias,
					source   = EXCLUDED.source,
					priority = 1
			`, id, a, na)
		}
		if err := execBatch(ctx, s.pool, batch); err != nil {
			return err
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
		       format, status, source, season, season_year, episodes, duration_minutes,
		       average_score, mean_score, popularity, favourites, is_adult,
		       is_game_eligible, cover_source_url, banner_source_url, cover_color
		FROM anime
	`+where, args...)

	var a Anime
	err := row.Scan(&a.ID, &a.Slug, &a.TitlePrimary, &a.TitleRomaji, &a.TitleEnglish, &a.TitleNative,
		&a.Format, &a.Status, &a.Source, &a.Season, &a.SeasonYear, &a.Episodes, &a.DurationMinutes,
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

package anime

import (
	"context"

	"github.com/jackc/pgx/v5"
)

// Detail embeds Anime and carries the joined arrays the web detail page renders.
type Detail struct {
	Anime
	Aliases    []DetailAlias     `json:"aliases,omitempty"`
	Genres     []string          `json:"genres,omitempty"`
	Tags       []DetailTag       `json:"tags,omitempty"`
	Studios    []DetailStudio    `json:"studios,omitempty"`
	Relations  []DetailRelation  `json:"relations,omitempty"`
	Characters []DetailCharacter `json:"characters,omitempty"`
}

type DetailAlias struct {
	Alias  string `json:"alias"`
	Source string `json:"source"`
}

type DetailTag struct {
	Name      string  `json:"name"`
	Category  *string `json:"category,omitempty"`
	Rank      *int    `json:"rank,omitempty"`
	IsSpoiler bool    `json:"isSpoiler"`
}

type DetailStudio struct {
	Name   string `json:"name"`
	IsMain bool   `json:"isMain"`
}

// DetailRelation flattens both in-catalog and external relations. AnimeID and
// the title fields are set when the target lives in our catalog, ExternalID
// is set when it does not.
type DetailRelation struct {
	RelationType   string  `json:"relationType"`
	AnimeID        *int64  `json:"animeId,omitempty"`
	Title          *string `json:"title,omitempty"`
	Slug           *string `json:"slug,omitempty"`
	CoverSourceURL *string `json:"coverSourceUrl,omitempty"`
	SeasonYear     *int    `json:"seasonYear,omitempty"`
	ExternalSource *string `json:"externalSource,omitempty"`
	ExternalID     *string `json:"externalId,omitempty"`
}

type DetailCharacter struct {
	ID       int64   `json:"id"`
	Name     string  `json:"name"`
	Native   *string `json:"native,omitempty"`
	ImageURL *string `json:"imageUrl,omitempty"`
	Role     string  `json:"role"`
}

// GetDetailByID returns the anime row plus aliases, genres, tags, studios,
// relations, and characters. Six queries are pipelined through pgx.Batch so
// the whole load is one network round trip.
func (s *Store) GetDetailByID(ctx context.Context, id int64) (*Detail, error) {
	batch := &pgx.Batch{}
	batch.Queue(`
		SELECT id, slug, title_primary, title_romaji, title_english, title_native,
		       format, status, source, season, season_year, episodes, duration_minutes,
		       average_score, mean_score, popularity, favourites, is_adult,
		       is_game_eligible, cover_source_url, banner_source_url, cover_color
		FROM anime WHERE id = $1
	`, id)
	batch.Queue(`SELECT alias, source FROM anime_alias WHERE anime_id = $1 ORDER BY priority ASC, alias ASC`, id)
	batch.Queue(`
		SELECT g.name FROM anime_genre ag
		JOIN genre g ON g.id = ag.genre_id
		WHERE ag.anime_id = $1 ORDER BY g.name ASC
	`, id)
	batch.Queue(`
		SELECT t.name, t.category, at.rank, t.is_spoiler
		FROM anime_tag at
		JOIN tag t ON t.id = at.tag_id
		WHERE at.anime_id = $1 AND t.is_adult = false
		ORDER BY at.rank DESC NULLS LAST, t.name ASC
	`, id)
	batch.Queue(`
		SELECT s.name, asx.is_main
		FROM anime_studio asx
		JOIN studio s ON s.id = asx.studio_id
		WHERE asx.anime_id = $1 ORDER BY asx.is_main DESC, s.name ASC
	`, id)
	batch.Queue(`
		SELECT ar.relation_type, a.id, a.title_primary, a.slug, a.cover_source_url, a.season_year,
		       ar.external_to_source, ar.external_to_id
		FROM anime_relation ar
		LEFT JOIN source_id_map m ON m.source = ar.external_to_source AND m.source_id = ar.external_to_id
		LEFT JOIN anime a ON a.id = m.anime_id
		WHERE ar.from_anime_id = $1
		ORDER BY ar.relation_type ASC, a.season_year DESC NULLS LAST
	`, id)
	batch.Queue(`
		SELECT c.id, c.name_full, c.name_native, c.image_url, ac.role
		FROM anime_chara ac
		JOIN chara c ON c.id = ac.chara_id
		WHERE ac.anime_id = $1
		ORDER BY CASE ac.role WHEN 'MAIN' THEN 0 WHEN 'SUPPORTING' THEN 1 ELSE 2 END, c.name_full ASC
	`, id)

	br := s.pool.SendBatch(ctx, batch)
	defer br.Close()

	d := &Detail{}
	row := br.QueryRow()
	if err := row.Scan(&d.ID, &d.Slug, &d.TitlePrimary, &d.TitleRomaji, &d.TitleEnglish, &d.TitleNative,
		&d.Format, &d.Status, &d.Source, &d.Season, &d.SeasonYear, &d.Episodes, &d.DurationMinutes,
		&d.AverageScore, &d.MeanScore, &d.Popularity, &d.Favourites, &d.IsAdult,
		&d.IsGameEligible, &d.CoverSourceURL, &d.BannerSourceURL, &d.CoverColor); err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	aliases, err := br.Query()
	if err != nil {
		return nil, err
	}
	for aliases.Next() {
		var a DetailAlias
		if err := aliases.Scan(&a.Alias, &a.Source); err != nil {
			aliases.Close()
			return nil, err
		}
		d.Aliases = append(d.Aliases, a)
	}
	aliases.Close()

	genres, err := br.Query()
	if err != nil {
		return nil, err
	}
	for genres.Next() {
		var g string
		if err := genres.Scan(&g); err != nil {
			genres.Close()
			return nil, err
		}
		d.Genres = append(d.Genres, g)
	}
	genres.Close()

	tags, err := br.Query()
	if err != nil {
		return nil, err
	}
	for tags.Next() {
		var t DetailTag
		if err := tags.Scan(&t.Name, &t.Category, &t.Rank, &t.IsSpoiler); err != nil {
			tags.Close()
			return nil, err
		}
		d.Tags = append(d.Tags, t)
	}
	tags.Close()

	studios, err := br.Query()
	if err != nil {
		return nil, err
	}
	for studios.Next() {
		var st DetailStudio
		if err := studios.Scan(&st.Name, &st.IsMain); err != nil {
			studios.Close()
			return nil, err
		}
		d.Studios = append(d.Studios, st)
	}
	studios.Close()

	relations, err := br.Query()
	if err != nil {
		return nil, err
	}
	for relations.Next() {
		var r DetailRelation
		if err := relations.Scan(&r.RelationType, &r.AnimeID, &r.Title, &r.Slug, &r.CoverSourceURL, &r.SeasonYear, &r.ExternalSource, &r.ExternalID); err != nil {
			relations.Close()
			return nil, err
		}
		d.Relations = append(d.Relations, r)
	}
	relations.Close()

	chars, err := br.Query()
	if err != nil {
		return nil, err
	}
	for chars.Next() {
		var c DetailCharacter
		if err := chars.Scan(&c.ID, &c.Name, &c.Native, &c.ImageURL, &c.Role); err != nil {
			chars.Close()
			return nil, err
		}
		d.Characters = append(d.Characters, c)
	}
	chars.Close()

	return d, nil
}

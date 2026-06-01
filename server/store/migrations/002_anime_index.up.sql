CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE anime (
    id                BIGSERIAL PRIMARY KEY,
    slug              TEXT NOT NULL UNIQUE,

    title_primary     TEXT NOT NULL,
    title_romaji      TEXT,
    title_english     TEXT,
    title_native      TEXT,

    format            TEXT,
    status            TEXT,
    season            TEXT,
    season_year       INT,
    episodes          INT,
    duration_minutes  INT,

    average_score     INT,
    mean_score        INT,
    popularity        INT NOT NULL DEFAULT 0,
    favourites        INT NOT NULL DEFAULT 0,

    is_adult          BOOLEAN NOT NULL DEFAULT false,
    is_game_eligible  BOOLEAN NOT NULL DEFAULT true,

    cover_source_url  TEXT,
    banner_source_url TEXT,
    cover_color       TEXT,

    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX anime_popularity_idx ON anime (popularity DESC);
CREATE INDEX anime_season_year_idx ON anime (season_year DESC);
CREATE INDEX anime_score_idx ON anime (average_score DESC);
CREATE INDEX anime_game_eligible_idx ON anime (is_game_eligible) WHERE is_game_eligible = true;

CREATE TABLE anime_alias (
    id                BIGSERIAL PRIMARY KEY,
    anime_id          BIGINT NOT NULL REFERENCES anime(id) ON DELETE CASCADE,
    alias             TEXT NOT NULL,
    normalized_alias  TEXT NOT NULL,
    source            TEXT NOT NULL,
    priority          INT NOT NULL DEFAULT 100,
    UNIQUE (anime_id, normalized_alias)
);

CREATE INDEX anime_alias_normalized_trgm_idx
    ON anime_alias USING GIN (normalized_alias gin_trgm_ops);

CREATE INDEX anime_alias_anime_id_idx ON anime_alias (anime_id);

CREATE TABLE studio (
    id              BIGSERIAL PRIMARY KEY,
    source          TEXT,
    source_id       TEXT,
    name            TEXT NOT NULL,
    normalized_name TEXT NOT NULL UNIQUE
);

CREATE TABLE anime_studio (
    anime_id   BIGINT NOT NULL REFERENCES anime(id) ON DELETE CASCADE,
    studio_id  BIGINT NOT NULL REFERENCES studio(id) ON DELETE CASCADE,
    is_main    BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY (anime_id, studio_id)
);

CREATE TABLE tag (
    id              BIGSERIAL PRIMARY KEY,
    source          TEXT,
    source_id       TEXT,
    name            TEXT NOT NULL,
    normalized_name TEXT NOT NULL UNIQUE,
    category        TEXT,
    is_spoiler      BOOLEAN NOT NULL DEFAULT false,
    is_adult        BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE anime_tag (
    anime_id  BIGINT NOT NULL REFERENCES anime(id) ON DELETE CASCADE,
    tag_id    BIGINT NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
    rank      INT,
    PRIMARY KEY (anime_id, tag_id)
);

CREATE TABLE genre (
    id    BIGSERIAL PRIMARY KEY,
    name  TEXT NOT NULL UNIQUE
);

CREATE TABLE anime_genre (
    anime_id  BIGINT NOT NULL REFERENCES anime(id) ON DELETE CASCADE,
    genre_id  BIGINT NOT NULL REFERENCES genre(id) ON DELETE CASCADE,
    PRIMARY KEY (anime_id, genre_id)
);

CREATE TABLE anime_relation (
    id                 BIGSERIAL PRIMARY KEY,
    from_anime_id      BIGINT NOT NULL REFERENCES anime(id) ON DELETE CASCADE,
    to_anime_id        BIGINT REFERENCES anime(id) ON DELETE SET NULL,
    external_to_source TEXT,
    external_to_id     TEXT,
    relation_type      TEXT NOT NULL
);

CREATE INDEX anime_relation_from_idx ON anime_relation (from_anime_id);
CREATE INDEX anime_relation_external_idx ON anime_relation (external_to_source, external_to_id);

CREATE TABLE anime_asset (
    id              BIGSERIAL PRIMARY KEY,
    anime_id        BIGINT NOT NULL REFERENCES anime(id) ON DELETE CASCADE,
    kind            TEXT NOT NULL,
    source          TEXT NOT NULL,
    source_url      TEXT NOT NULL,
    cdn_url         TEXT,
    width           INT,
    height          INT,
    dominant_color  TEXT,
    blurhash        TEXT,
    status          TEXT NOT NULL DEFAULT 'remote',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (anime_id, kind, source)
);

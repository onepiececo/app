CREATE TABLE chara (
    id           BIGSERIAL PRIMARY KEY,
    source       TEXT NOT NULL,
    source_id    TEXT NOT NULL,
    name_full    TEXT NOT NULL,
    name_native  TEXT,
    image_url    TEXT,
    gender       TEXT,
    age          TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (source, source_id)
);

CREATE INDEX chara_name_trgm_idx ON chara USING GIN (name_full gin_trgm_ops);
CREATE INDEX chara_name_native_idx ON chara (name_native) WHERE name_native IS NOT NULL;

CREATE TABLE anime_chara (
    anime_id  BIGINT NOT NULL REFERENCES anime(id) ON DELETE CASCADE,
    chara_id  BIGINT NOT NULL REFERENCES chara(id) ON DELETE CASCADE,
    role      TEXT NOT NULL DEFAULT 'SUPPORTING',
    PRIMARY KEY (anime_id, chara_id)
);

CREATE INDEX anime_chara_chara_idx ON anime_chara (chara_id);

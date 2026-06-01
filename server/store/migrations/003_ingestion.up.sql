CREATE TABLE source_runs (
    id           BIGSERIAL PRIMARY KEY,
    source       TEXT NOT NULL,
    job          TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'running',
    cursor       JSONB,
    rows_seen    INT NOT NULL DEFAULT 0,
    rows_written INT NOT NULL DEFAULT 0,
    started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    finished_at  TIMESTAMPTZ,
    error        TEXT
);

CREATE INDEX source_runs_source_started_idx ON source_runs (source, started_at DESC);

CREATE TABLE source_payloads (
    source        TEXT NOT NULL,
    source_id     TEXT NOT NULL,
    payload       JSONB NOT NULL,
    payload_hash  TEXT,
    fetched_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (source, source_id)
);

CREATE TABLE source_id_map (
    source      TEXT NOT NULL,
    source_id   TEXT NOT NULL,
    anime_id    BIGINT NOT NULL REFERENCES anime(id) ON DELETE CASCADE,
    confidence  INT NOT NULL DEFAULT 100,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (source, source_id),
    UNIQUE (anime_id, source)
);

CREATE INDEX source_id_map_anime_idx ON source_id_map (anime_id);

ALTER TABLE anime ADD COLUMN mal_rank INT;
ALTER TABLE anime ADD COLUMN mal_members INT;

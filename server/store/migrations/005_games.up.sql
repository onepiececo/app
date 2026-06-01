CREATE TABLE game (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO game (id, name, description) VALUES
    ('clue', 'Daily Anime Clue', 'Guess the anime. Each wrong guess reveals one new clue.');

CREATE TABLE puzzle (
    id            BIGSERIAL PRIMARY KEY,
    game_id       TEXT NOT NULL REFERENCES game(id),
    puzzle_date   DATE,
    seed          TEXT NOT NULL,
    difficulty    TEXT NOT NULL DEFAULT 'normal',
    payload       JSONB NOT NULL,
    answer_key    JSONB NOT NULL,
    published_at  TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (game_id, puzzle_date)
);

CREATE INDEX puzzle_game_date_idx ON puzzle (game_id, puzzle_date DESC);

CREATE TABLE puzzle_attempt (
    id             BIGSERIAL PRIMARY KEY,
    puzzle_id      BIGINT NOT NULL REFERENCES puzzle(id) ON DELETE CASCADE,
    player_id      UUID NOT NULL REFERENCES player_identity(id) ON DELETE CASCADE,
    status         TEXT NOT NULL DEFAULT 'started',
    score          INT NOT NULL DEFAULT 0,
    guesses_count  INT NOT NULL DEFAULT 0,
    duration_ms    INT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at   TIMESTAMPTZ,
    UNIQUE (puzzle_id, player_id)
);

CREATE INDEX puzzle_attempt_player_idx ON puzzle_attempt (player_id);

CREATE TABLE puzzle_guess (
    id                BIGSERIAL PRIMARY KEY,
    attempt_id        BIGINT NOT NULL REFERENCES puzzle_attempt(id) ON DELETE CASCADE,
    anime_id          BIGINT REFERENCES anime(id),
    raw_guess         TEXT NOT NULL,
    normalized_guess  TEXT NOT NULL,
    result            JSONB NOT NULL,
    position          INT NOT NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX puzzle_guess_attempt_idx ON puzzle_guess (attempt_id, position);

CREATE TABLE puzzle_answer_stats (
    puzzle_id      BIGINT NOT NULL REFERENCES puzzle(id) ON DELETE CASCADE,
    answer_slot    TEXT NOT NULL,
    anime_id       BIGINT NOT NULL REFERENCES anime(id),
    correct_count  INT NOT NULL DEFAULT 0,
    total_count    INT NOT NULL DEFAULT 0,
    PRIMARY KEY (puzzle_id, answer_slot, anime_id)
);

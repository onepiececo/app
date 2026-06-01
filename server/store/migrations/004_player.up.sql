CREATE TABLE user_profile (
    user_id      TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
    username     TEXT UNIQUE,
    display_name TEXT,
    avatar_url   TEXT,
    timezone     TEXT NOT NULL DEFAULT 'America/New_York',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE anonymous_player (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anonymous_key_hash  TEXT NOT NULL UNIQUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE player_identity (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              TEXT REFERENCES "user"(id) ON DELETE CASCADE,
    anonymous_player_id  UUID REFERENCES anonymous_player(id) ON DELETE CASCADE,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (
        (user_id IS NOT NULL AND anonymous_player_id IS NULL)
        OR
        (user_id IS NULL AND anonymous_player_id IS NOT NULL)
    )
);

CREATE UNIQUE INDEX player_identity_user_uniq ON player_identity (user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX player_identity_anon_uniq ON player_identity (anonymous_player_id) WHERE anonymous_player_id IS NOT NULL;

ALTER TABLE puzzle_attempt
    ADD COLUMN state JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN is_anonymous BOOLEAN NOT NULL DEFAULT false;

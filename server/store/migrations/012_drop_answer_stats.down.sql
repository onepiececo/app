CREATE TABLE puzzle_answer_stats (
    puzzle_id      BIGINT NOT NULL REFERENCES puzzle(id) ON DELETE CASCADE,
    answer_slot    TEXT NOT NULL,
    anime_id       BIGINT NOT NULL REFERENCES anime(id),
    correct_count  INT NOT NULL DEFAULT 0,
    total_count    INT NOT NULL DEFAULT 0,
    PRIMARY KEY (puzzle_id, answer_slot, anime_id)
);

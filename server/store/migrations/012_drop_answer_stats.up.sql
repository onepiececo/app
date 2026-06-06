-- puzzle_answer_stats was never wired up, nothing writes or reads it.
-- Drop it until a stats feature actually needs it, the down migration restores the schema.

DROP TABLE IF EXISTS puzzle_answer_stats;

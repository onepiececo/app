-- Adds a mode column so live room games are not generated as daily puzzles.
ALTER TABLE game ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'daily';

INSERT INTO game (id, name, description, mode) VALUES
    ('clue', 'Clue', 'Guess the anime, and each wrong guess reveals a clue.', 'daily'),
    ('cover', 'Cover', 'Guess the anime from a blurred cover that clears with each wrong guess.', 'daily'),
    ('character', 'Character', 'Guess the character from a blurred picture that clears with each wrong guess.', 'daily'),
    ('higherlower', 'Higher or Lower', 'Two anime and one stat, call which one ranks higher.', 'daily'),
    ('groups', 'Groups', 'Sixteen anime hide four secret categories, sort them all with four misses allowed.', 'daily'),
    ('synopsis', 'Synopsis', 'Guess the anime from its plot with the names hidden.', 'daily'),
    ('timeline', 'Timeline', 'Put a handful of anime in the order they aired.', 'daily'),
    ('dial', 'Dial', 'A room game where you guess where another player''s clue lands on a scale.', 'live')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, mode = EXCLUDED.mode;

-- These ids were placeholders that the roster renamed or merged, neither has generated puzzles.
DELETE FROM game WHERE id IN ('wordle', 'connections');

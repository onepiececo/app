INSERT INTO game (id, name, description) VALUES
    ('clue', 'Clue', 'One anime hides behind six progressive clues you unlock by guessing wrong.'),
    ('wordle', 'Wordle', 'Any anime works, the grid colors how close yours is across seven facets.'),
    ('connections', 'Connections', 'Sixteen anime, four hidden groupings, four wrong guesses before the board locks.'),
    ('character', 'Character Guess', 'Name the character from a blurred portrait that clears across six chances.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

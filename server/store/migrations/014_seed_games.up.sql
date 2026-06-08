INSERT INTO game (id, name, description) VALUES
    ('wordle', 'Anime Wordle', 'Guess the hidden anime title in six tries.'),
    ('connections', 'Anime Connections', 'Find the four hidden groups of four.'),
    ('character', 'Character Guess', 'Name the character from a blurred portrait.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO game (id, name, description) VALUES
    ('wordle', 'Daily Anime Wordle', 'Guess any anime. Each guess shows how close it is across format, year, episodes, score, source, studios, and genres.')
ON CONFLICT (id) DO NOTHING;

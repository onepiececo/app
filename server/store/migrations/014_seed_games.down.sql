DELETE FROM puzzle WHERE game_id IN ('wordle', 'connections', 'character');
DELETE FROM game WHERE id IN ('wordle', 'connections', 'character');

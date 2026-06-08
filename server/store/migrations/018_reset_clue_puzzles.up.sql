-- The clue answer key shape changed to stored comparable attributes, so old puzzles are cleared and regenerated.
DELETE FROM puzzle WHERE game_id = 'clue';

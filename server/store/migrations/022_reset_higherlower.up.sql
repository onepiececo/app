-- Higher or Lower switched its stat to score, so any chain stored under the old shape is cleared and regenerated.
DELETE FROM puzzle WHERE game_id = 'higherlower';

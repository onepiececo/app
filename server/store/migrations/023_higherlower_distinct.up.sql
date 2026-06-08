-- Higher or Lower now picks distinct scores so the stored chains are cleared and regenerated without ties.
DELETE FROM puzzle WHERE game_id = 'higherlower';

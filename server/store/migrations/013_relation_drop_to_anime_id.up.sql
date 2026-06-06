-- to_anime_id was never populated, relations resolve through source_id_map at query time instead.
ALTER TABLE anime_relation DROP COLUMN IF EXISTS to_anime_id;

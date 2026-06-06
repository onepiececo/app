-- AniList stores a placeholder when art is missing, clear it so missing images read as null.
UPDATE chara
SET image_url = NULL
WHERE image_url LIKE '%anilistcdn/%/default.jpg';

UPDATE anime
SET cover_source_url = NULL
WHERE cover_source_url LIKE '%anilistcdn/%/default.jpg';

UPDATE anime
SET banner_source_url = NULL
WHERE banner_source_url LIKE '%anilistcdn/%/default.jpg';

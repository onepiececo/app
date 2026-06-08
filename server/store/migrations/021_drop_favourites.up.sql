-- The favourites count was ingested but never surfaced to players so it is dropped from the catalog.
ALTER TABLE anime DROP COLUMN IF EXISTS favourites;

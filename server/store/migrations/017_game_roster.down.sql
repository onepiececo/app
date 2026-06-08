-- The roster rows are owned by 005 and 014 so this only drops the added column.
ALTER TABLE game DROP COLUMN IF EXISTS mode;

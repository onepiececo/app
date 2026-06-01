-- Reverse lookup indexes on the many-to-many join tables.
-- Without these, queries like "all anime in studio X" or "all anime with genre Action" do a full scan
-- because the PK (anime_id, X_id) only supports prefix lookups on anime_id.

CREATE INDEX anime_studio_studio_idx ON anime_studio (studio_id);
CREATE INDEX anime_tag_tag_idx       ON anime_tag (tag_id);
CREATE INDEX anime_genre_genre_idx   ON anime_genre (genre_id);

-- Composite index for puzzle eligibility queries.
-- The existing anime_game_eligible_idx is a partial on is_game_eligible only, so it cannot help
-- the popularity bound. ClueEngine and WordleEngine both run COUNT and OFFSET over this filter.

CREATE INDEX anime_eligible_popularity_idx ON anime (popularity DESC)
    WHERE is_game_eligible = true AND is_adult = false;

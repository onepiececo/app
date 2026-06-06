-- Browse's A-to-Z sort orders by (title_primary, id) under the catalog visibility filter.
-- Without this index that sort does a full scan and sort, so keyset paging the title list cannot seek.

CREATE INDEX anime_title_primary_idx ON anime (title_primary, id)
    WHERE is_adult = false AND average_score IS NOT NULL;

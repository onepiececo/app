# Onepiece

Anime puzzle platform with a browseable catalog, pulled from AniList and enriched by Jikan.

- Home with the day picker and the daily game grid, scroll between days, calendar to jump
- /anime, browseable catalog with title search, sort, and per-anime detail pages addressed by id
- Anonymous play out of the box, sign in to keep state across devices
- Better Auth with JWT plugin, Go server verifies tokens via JWKS straight from Postgres
- AniList catalog ingestion with a 25 RPM throttle, Jikan enrichment for MAL rank, members, synonyms
- Deterministic puzzle generation per day, regenerable from seed

## Getting Started

```bash
docker compose up -d
cd server && go run ./cmd/onepiece
cd web && bun install && bun run dev
```

Migrations run on server boot, both services share the Postgres at `localhost:5432`, and each `.env` file is gitignored next to its `.env.example`.

## Populating the Catalog

One command pulls AniList every hour and runs Jikan enrichment every 30 minutes, both throttled to their published rate limits.

```bash
cd server && go run ./cmd/onepiece-cli ingest
```

Pass `--once` for a single pass of each source and exit, or override any tuning via `--anilist-pages`, `--anilist-interval`, `--jikan-batch`, `--jikan-interval`, etc.

## How It Works

The home page renders a date rail and a grid of daily games for the active day, the calendar picker lets you jump to any backfilled date, and the day rail auto-loads older entries as you reach the bottom.

The /anime page is the catalog browser, search hits the trigram-backed alias index with prefix and exact matches outranking fuzzy similarity, sort cycles between title popularity year score, and each tile links to /anime/{id} for the full detail.

Fetch today's daily-game puzzle.

```bash
curl http://localhost:8080/v1/puzzles/today?game=clue
```

Search the anime catalog by alias or prefix, queries under three characters skip the trigram fallback and use prefix-only matching.

```bash
curl 'http://localhost:8080/v1/anime?q=jjk&limit=5'
```

Browse the catalog with sort and pagination.

```bash
curl 'http://localhost:8080/v1/anime/browse?sort=title&limit=20&offset=0'
```

Fetch a specific anime by its internal id.

```bash
curl http://localhost:8080/v1/anime/by-id/123
```

List the active games and the distinct puzzle dates so the web rail knows the window it can navigate.

```bash
curl http://localhost:8080/v1/games
curl 'http://localhost:8080/v1/days?limit=30'
```

Better Auth's `jwt()` plugin writes EdDSA keys to the `jwks` table, the Go server polls every five minutes and builds a `keyfunc` so any Bearer token verifies without a round trip back to Next.js.

## API Reference

The Go server exposes four scopes of routes.

- Public catalog and metadata, `/healthz`, `/v1/anime`, `/v1/anime/browse`, `/v1/anime/count`, `/v1/anime/by-id/{id}`, `/v1/anime/{slug}`, `/v1/games`, `/v1/days`, `/v1/puzzles/today`
- Anonymous or signed in, `/v1/players/me`, `/v1/puzzles/{id}/guesses`, `/v1/puzzles/{id}/complete`, send either `Authorization: Bearer <jwt>` or `X-Anonymous-Key: <random>`
- Signed in only, `/v1/me`, requires a valid Better Auth JWT
- CLI only, `onepiece-cli ingest` for catalog population

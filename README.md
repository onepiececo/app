# Onepiece

Daily anime guessing games built on a real catalog pulled from AniList and enriched by Jikan.

- Daily Anime Clue, six progressive clues, one chance per day
- AniList catalog ingestion with a 25 RPM throttle
- Jikan enrichment for MAL rank, members, and synonyms
- Anonymous play out of the box, sign in to keep streaks across devices
- Better Auth with JWT plugin, Go server verifies tokens via JWKS straight from Postgres
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

The `/clue` page fetches today's puzzle, hits the trigram-backed search as you type, and either reveals the next clue or closes the attempt on every guess.

Fetch today's puzzle.

```bash
curl http://localhost:8080/v1/puzzles/today?game=clue
```

Search anime by alias or prefix, matched through exact alias then prefix then trigram similarity with popularity as the tiebreak.

```bash
curl 'http://localhost:8080/v1/anime?q=jjk&limit=5'
```

Submit a guess, the attempt auto starts and anonymous identity comes from `X-Anonymous-Key`.

```bash
curl -X POST -H "X-Anonymous-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"rawGuess":"Code Geass","animeId":50}' \
  http://localhost:8080/v1/puzzles/1/guesses
```

Better Auth's `jwt()` plugin writes EdDSA keys to the `jwks` table, the Go server polls every five minutes and builds a `keyfunc` so any Bearer token verifies without a round trip back to Next.js.

## API Reference

The Go server exposes four scopes of routes.

- Public, `/healthz`, `/v1/anime`, `/v1/anime/{slug}`, `/v1/puzzles/today`
- Anonymous or signed in, `/v1/players/me`, `/v1/puzzles/{id}/guesses`, `/v1/puzzles/{id}/complete`, send either `Authorization: Bearer <jwt>` or `X-Anonymous-Key: <random>`
- Signed in only, `/v1/me`, requires a valid Better Auth JWT
- CLI only, `onepiece-cli ingest` for catalog population

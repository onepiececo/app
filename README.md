# Onepiece

Daily anime guessing games for fans, no clips, no spoilers, just brain damage. Wordle style puzzles built on top of a real anime index pulled from AniList and enriched by Jikan.

- Daily Anime Clue, six progressive clues, one chance per day
- AniList catalog ingestion with a 25 RPM throttle
- Jikan enrichment for MAL rank, members, and synonyms
- Anonymous play out of the box, sign in to keep streaks across devices
- Better Auth with JWT plugin, Go server verifies tokens via JWKS straight from Postgres
- Deterministic puzzle generation per day, regenerable from seed

## Getting Started

```bash
docker compose up -d
cd server && go run ./cmd/onepiece     # boots on :8080
cd web && bun install && bun run dev   # dashboard on localhost:3000
```

Migrations run automatically on server boot. Both services read the same Postgres at `localhost:5432`. The Go server's `.env` and the Next.js `.env.local` are gitignored, copy the `.env.example` files in each folder if you want to override defaults.

## Populating the Catalog

The puzzle generator needs anime. Pull the top 250 most popular non-adult titles from AniList in one shot.

```bash
cd server && go run ./cmd/onepiece-cli ingest anilist --pages=5
```

Then layer Jikan's MAL data on top. This fills `mal_rank`, `mal_members`, and synonym aliases like SnK or FMAB.

```bash
cd server && go run ./cmd/onepiece-cli ingest jikan --batch=50
```

You can also flip `INGEST_ANILIST_ENABLED=true` and `INGEST_JIKAN_ENABLED=true` in `server/.env` to have the long-running server schedule both jobs (24h and 12h cadence respectively).

## How It Works

Visit `/clue` in the web app, the page fetches today's puzzle and shows the first clue. Type an anime in the input, the autocomplete hits the Go server's trigram-backed search and ranks the closest aliases. Submit a guess, the server records it and either reveals the next clue or closes the attempt as won or lost.

Fetch today's puzzle.

```bash
curl http://localhost:8080/v1/puzzles/today?game=clue
```

Search by alias or prefix. The match chain is exact alias, then prefix, then trigram similarity, with popularity as the tiebreak.

```bash
curl 'http://localhost:8080/v1/anime/search?q=jjk&limit=5'
```

Submit a guess. The attempt auto starts, anonymous identity comes from `X-Anonymous-Key`.

```bash
curl -X POST -H "X-Anonymous-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"rawGuess":"Code Geass","animeId":50}' \
  http://localhost:8080/v1/puzzles/1/guess
```

Better Auth's `jwt()` plugin writes its EdDSA keypair to the `jwks` table on first token mint. The Go server polls that table every five minutes and builds a `keyfunc` so any Bearer token from the Next.js side verifies without an extra round trip.

## API Reference

The Go server exposes four scopes of routes.

- Public, `/healthz`, `/v1/anime/search`, `/v1/anime/{slug}`, `/v1/puzzles/today`
- Anonymous or signed in, `/v1/players/me`, `/v1/puzzles/{id}/guess`, `/v1/puzzles/{id}/complete`. Send either `Authorization: Bearer <jwt>` or `X-Anonymous-Key: <random>`.
- Signed in only, `/v1/me`. Requires a valid Better Auth JWT.
- CLI only, `onepiece-cli ingest anilist|jikan` for one shot population.

## Project Structure

```
web/                       Next.js 16 dashboard
  src/
    app/(games)/clue/      Daily Anime Clue page and components
    app/api/auth/[...all]/ Better Auth catch-all
    components/ui/         60+ Base UI primitives
    db/schema.ts           Drizzle types mirroring server migrations
    lib/server-client.ts   Bearer-aware fetch wrapper
  ai/                      Per-component agent docs

server/                    Go HTTP service
  cmd/onepiece/            Server entry, runs migrations, schedules
  cmd/onepiece-cli/        Ingest subcommands
  api/                     Router and handlers (anime, puzzles, players, me, health)
  internal/
    anime/                 Catalog upsert, alias resolver, pg_trgm search
    auth/                  JWKSStore and Bearer verification
    games/                 GameEngine interface plus Daily Anime Clue
    ingest/                AniList, Jikan, source payload bookkeeping
    player/                Anonymous and signed in identity resolver
  store/                   pgx pool and embedded SQL migrations

docker-compose.yml         Single shared Postgres 17
```

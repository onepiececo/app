# onepiece

Two services, one database.

```
app/
  web/      Next.js 16, React 19, Bun, Better Auth, Base UI
  server/   Go HTTP service, runs migrations, verifies Better Auth JWTs
```

## Quick start

```
cp .env.example .env
docker compose up -d
cd server && go run ./cmd/onepiece
cd web && bun install && bun run dev
```

Server boots on `:8080`, applies migrations, watches the Postgres `jwks` table for Better Auth signing keys.

Web boots on `:3000`. Sign up with email and password. The Better Auth `jwt()` plugin mints EdDSA tokens, the server verifies them via JWKS.

See `web/ai/` for component and convention docs.

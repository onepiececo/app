<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

Instructions for coding agents working in this repo.

## Documentation sources

When in doubt, fetch these first — they're the authoritative, AI-friendly indexes for each tool. Prefer `llms.txt` (navigation index) and drill into specific pages as needed.

| Tool | llms.txt / docs |
| --- | --- |
| Next.js 16 | https://nextjs.org/docs/llms.txt, full export: https://nextjs.org/docs/llms-full.txt. MCP server: `next-devtools` (`npx -y next-devtools-mcp@latest`). |
| Better-Auth | https://better-auth.com/llms.txt |
| Drizzle ORM | https://orm.drizzle.team/llms.txt |
| Apsara UI | https://apsara.raystack.org/llms.txt |
| Bun | https://bun.sh/llms.txt |
| React 19 | https://react.dev (no llms.txt; use https://react.dev/reference/react for hooks/APIs) |

If you're adding a dependency not listed here, check `https://<vendor>.com/llms.txt` before falling back to general web search.

## Stack

- **Framework**: Next.js 16 (App Router). Turbopack is the default bundler — do not pass `--turbopack`.
- **Runtime / pkg manager**: Bun.
- **Database**: Postgres 17 via Docker Compose (local). Drizzle ORM with `drizzle-orm/node-postgres`.
- **Auth**: Better-Auth (`better-auth` + `better-auth/next-js`) with the Drizzle adapter (`provider: "pg"`).
- **UI**: [coss ui](https://coss.com/ui) — shadcn-style registry on Base UI + Tailwind CSS v4. Components are *copied* into `src/components/ui/` via `shadcn add`, not imported from an npm package. Theming uses the standard Tailwind `.dark` class on `<html>`, managed by our tiny custom provider (`src/components/theme-provider.tsx`) and pre-hydration `<ThemeScript />`. Docs/migration: https://coss.com/ui/llms.txt, https://coss.com/ui/docs/radix-migration.md.
- **React**: 19.2. React Compiler is **on** via `reactCompiler: true` in `next.config.ts`; no manual `useMemo`/`useCallback` needed for standard cases.

## Commands

```bash
bun install                # install deps
bun run db:up              # start the shared root docker-compose Postgres
bun run db:down            # stop the shared root docker-compose Postgres
bun run dev                # Next dev server (Turbopack + FS cache)
bun run build              # Production build
bun run typecheck          # tsc --noEmit
bun run db:studio          # Drizzle Studio (read-only browsing)
```

The Go server under `../server/` owns migrations. It runs them on startup via `golang-migrate` against the same Postgres `web` connects to. Do not run `drizzle-kit push` against this database, the schema in `src/db/schema.ts` is a hand mirror of what the Go migrations create.

No lint script. `next lint` was removed in Next 16 — use ESLint flat config directly if needed.

## Project layout

```
docker-compose.yml         # Postgres 17
drizzle.config.ts          # dialect: postgresql
next.config.ts             # reactCompiler + turbopack FS cache
src/
  app/
    layout.tsx             # Server Component; imports apsara CSS + Providers
    page.tsx               # Home (Server Component)
    api/auth/[...all]/route.ts  # Better-Auth catch-all handler
  components/
    providers.tsx          # "use client" — root client-side providers
    theme-provider.tsx     # "use client" — custom theme context (theme + setTheme)
    theme-script.tsx       # Server Component — pre-hydration script in <head>
    theme-toggle.tsx       # "use client" — themed button, mounted-guarded
  hooks/
    use-mounted.ts         # "use client" — SSR-safe mount flag
  db/
    index.ts               # drizzle client over pg.Pool
    schema.ts              # Better-Auth tables (user/session/account/verification)
  lib/
    auth.ts                # server-side betterAuth() with drizzleAdapter
    auth-client.ts         # browser createAuthClient()
  styles/
    globals.css            # global tokens-based styling
```

`@/*` resolves to `src/*`.

## Server vs Client components

- Every file under `src/app/` and `src/components/` is a **Server Component** by default. It can `await`, read env vars, query the DB directly.
- Add `"use client"` as the first line only when the file needs React hooks, event handlers, browser APIs (`localStorage`, `window`), or Context providers.
- A Server Component can render a Client Component as a child. A Client Component cannot import a Server Component directly — pass it as `children` instead.
- Props crossing the boundary must be serializable.
- `ThemeProvider` and `ThemeToggle` are client-only. `src/lib/auth.ts` and `src/db/index.ts` are server-only — never import from a `"use client"` file. Use `src/lib/auth-client.ts` in the browser.

## Next.js 16 specifics

- Async Request APIs are mandatory: `await cookies()`, `await headers()`, `await params`, `await searchParams`.
- Middleware is renamed to **proxy**. Use `proxy.ts` (Node runtime only). Do not create `middleware.ts`.
- `experimental.turbopackFileSystemCacheForDev` and `turbopackFileSystemCacheForBuild` are both enabled — dev output lives in `.next/dev`.
- If config adds a `webpack()` key the build fails under Turbopack — migrate to `turbopack` rules or run with `--webpack`.
- `revalidateTag` requires a second `cacheLife` arg (or use `updateTag` for read-your-writes).
- Parallel route slots require an explicit `default.js`.

## Better-Auth

- Server handler mounted at `src/app/api/auth/[...all]/route.ts`. Do not move it.
- `nextCookies()` plugin must stay **last** in the plugins array so Server Actions can set cookies. `jwt()` sits before it so the EdDSA signing keys land in the `jwks` table the Go server reads.
- For protected pages, prefer checking `auth.api.getSession({ headers: await headers() })` inside the page/route itself. Use `proxy.ts` only for optimistic redirects.
- Required env vars: `BETTER_AUTH_SECRET` (≥32 chars), `BETTER_AUTH_URL`. Generate the secret with `openssl rand -base64 32`.
- When you add plugins or extend the auth config, hand mirror the new tables in `src/db/schema.ts` and add a matching SQL migration under `../server/store/migrations/`. The CLI is not part of the workflow here.
- For calling the Go server from React, use `serverFetch` / `serverJSON` from `src/lib/server-client.ts`. It pulls the Bearer token from `/api/auth/token` (the jwt plugin endpoint) automatically.

## Drizzle + Postgres

- DB client is a singleton in `src/db/index.ts` wrapping `pg.Pool` with `DATABASE_URL`.
- Schema lives in `src/db/schema.ts`. It is a hand mirror of the Go server's migrations under `../server/store/migrations/`. When a Go migration adds or changes a table, mirror the change here so Drizzle queries type check.
- Schema changes happen in two steps. First write the SQL migration in `../server/store/migrations/00X_*.up.sql`, then update `src/db/schema.ts` to match. Restart the Go server, it applies pending migrations on boot.
- Do not run `drizzle-kit push`. The Go server owns the truth.
- Postgres runs on `localhost:5432` with user/pass/db all set to `onepiece`. The compose file lives at the repo root (`../docker-compose.yml`) and is shared with the Go server.

## React 19 + React Compiler

This project is on React 19 with the React Compiler enabled
(`next.config.ts` → `reactCompiler: true`). See [`ai/react-19.md`](./ai/react-19.md)
for the full feature surface. The non-negotiable rules:

- **Never write `useMemo` or `useCallback`.** The compiler memoizes
  everything safe to memoize at build time. Manual hooks duplicate that
  work and, in `useMemo`'s case, are unsafe for instance stability — React
  is allowed to re-invoke the factory and orphan singletons (we got
  burned by this with `createTooltipHandle`).
- **For stable instance creation** (handles, stores, AbortControllers —
  anything that must be referentially stable across renders) use a
  lazy ref:
  ```tsx
  const ref = useRef<MyThing | null>(null);
  if (!ref.current) ref.current = createMyThing();
  const thing = ref.current;
  ```
  Or `useState(() => createMyThing())[0]`. Never `useMemo`.
- **`ref` is a regular prop.** No `forwardRef` for new components — accept
  `ref` directly in props. Existing `forwardRef` usages are fine; don't
  rip them out unless touching the file for other reasons.
- **Server Actions and `useActionState` / `useFormStatus`** are first-class.
  Prefer them over hand-rolled form-submission state.
- **`use()` reads promises and contexts.** Inside Suspense boundaries,
  `use(promise)` is the official way to unwrap async data; `use(Context)`
  works in branches where `useContext` doesn't.
- **Document metadata** (`<title>`, `<meta>`, `<link>`) hoists from
  anywhere in the tree — but in the App Router prefer the `metadata`
  export on `page.tsx` / `layout.tsx`.

## Base UI primitives

Most components under `src/components/ui/` wrap [`@base-ui-components/react`](https://base-ui.com)
parts. Base UI's mental model differs from Radix in a few ways that AI
agents trained on shadcn/Radix examples consistently get wrong:

- **`render={<X />}` replaces `asChild`.** Wrap any base-ui Trigger / Close
  / etc. by passing the styled element through `render`, e.g.
  `<TooltipTrigger render={<Button variant="outline" />}>…</TooltipTrigger>`.
  Never use `asChild` — it doesn't exist.
- **Content containers are `*Popup`, not `*Content`.** `DialogPopup`,
  `MenuPopup`, `TooltipPopup`, `ComboboxPopup`, etc. (Accordion uses
  `*Panel`.) Some files re-export `*Popup as *Content` for migration
  ergonomics — prefer the `*Popup` name in new code.
- **Payload-driven popups use a render-function child on the *Root*, not
  the Popup.** When using `createHandle()` to share one popup across many
  detached triggers, the signature is `<Root>{({ payload }) => …}</Root>`.
  Putting the function on `<Popup>` throws "Functions are not valid as a
  React child".
- **Toggle multi-select with the `multiple` boolean, not `type="multiple"`.**
  Applies to Accordion and ToggleGroup. `defaultValue` becomes an array.
- **Menu items use `onClick`, not `onSelect`.**
- **SSR-safe data-driven pickers take an `items` prop.** Select, Combobox,
  and Command render their option list from `items={…}` rather than child
  composition. Children-as-options can hydration-mismatch.
- **Most popup-bearing parts accept `portalProps`** for escape-hatch
  control of `keepMounted`, `container`, etc. — pass through on wrapper
  components rather than reinventing.
- **Animation hooks live on data attributes**: `data-starting-style` and
  `data-ending-style` for enter/exit, `data-side` (`top`/`right`/`bottom`/
  `left`) for direction-aware transforms, `data-instant` for skip-animation
  cases (e.g. provider-grouped tooltips reopening). CSS-only — no Framer
  needed for typical popup transitions.
- **`TooltipProvider` shares timing across a cluster.** Without it, every
  tooltip in a toolbar pays its own 600ms delay tax. See
  [`ai/tooltip.md`](./ai/tooltip.md) for the four supported patterns
  (single / grouped / shared handle / imperative).

When introducing a new base-ui component, check
[base-ui.com](https://base-ui.com) for the correct part names and
data-attribute hooks before guessing — the API surface is consistent
within base-ui but doesn't always match Radix muscle memory.

## Apsara UI

- Import `@raystack/apsara/normalize.css` then `@raystack/apsara/style.css` once in `src/app/layout.tsx`.
- `<html suppressHydrationWarning>` is required because `ThemeProvider` injects a script before hydration.
- Prefer semantic tokens over literals: `var(--rs-color-background-base-primary)`, `var(--rs-space-5)`, `var(--rs-radius-3)`, `var(--rs-shadow-feather)`, etc.
- Icons from `@raystack/apsara/icons`, hooks from `@raystack/apsara/hooks`.
- `ThemeProvider` props of interest: `defaultTheme` (`"light" | "dark" | "system"`), `style` (`"modern" | "traditional"`), `accentColor`, `grayColor`.
- ~65 components available (Button, Flex, Grid, Sidebar, Dialog, DataTable, Tabs, Input, Select, Toast, etc.). Full catalogue at https://apsara.raystack.org.

## Conventions

- **Components are `const` arrow functions.** Only Next.js file-convention exports (`page.tsx`, `layout.tsx`, `route.ts`, `error.tsx`, `loading.tsx`, `not-found.tsx`, `default.tsx`) use `export default function`.
- **Props are a single named `props: ComponentNameProps` arg — don't destructure at the signature.** Access via `props.foo` inside the body. The type lives directly above the component, named `<Component>Props`.
  ```tsx
  type ThemeToggleProps = {
    variant?: "solid" | "outline" | "ghost";
  };

  export const ThemeToggle = (props: ThemeToggleProps) => {
    const variant = props.variant ?? "outline";
    return <Button variant={variant}>…</Button>;
  };
  ```
  This makes call sites, renames, and prop-drilling audits trivially greppable (`props.variant`) and keeps JSDoc / `React.ComponentProps<typeof X>` patterns consistent.
- Any UI that depends on client-only state (theme, window size, localStorage) must gate on `useMounted()` from `@/hooks/use-mounted` to avoid hydration mismatches. Render a neutral placeholder until mounted.
- TypeScript strict. `@/*` alias resolves to `./src/*`.
- Don't add `"use client"` speculatively — it disables Server Component benefits.
- Don't re-export server code from client barrels. Keep `src/lib/auth.ts` and `src/db/index.ts` server-only.
- Don't commit `.env.local`, generated migrations (until stabilized), or `.next/`.
- No emojis in code or commits. No co-author trailers on commits.

## Layout patterns

For three-zone bars where the middle item must stay **true-centered** regardless of the side items' widths (page header with logo / nav / user menu, pagination row with Previous / Status / Next, toolbar with leading / title / trailing actions, etc.), reach for a 3-column grid instead of `flex justify-between`. `justify-between` only spreads items, it doesn't center the middle one — the middle drifts the moment the left and right zones have different widths.

```tsx
<div className="grid w-full grid-cols-[1fr_auto_1fr] items-center">
  <div className="justify-self-start">{leftZone}</div>
  <div>{centerZone}</div>
  <div className="justify-self-end">{rightZone}</div>
</div>
```

The middle column is `auto`, so it sizes to its content. The two `1fr` outer columns absorb equally on either side, anchoring the middle to the geometric center. `justify-self-start` / `justify-self-end` pin the side items to the outer edges so they don't drift in their tracks. This is the same trick `<PaginationContent layout="spread">` uses internally.

## Gotchas

- If `pg` can't connect, check `docker compose ps` — the healthcheck must be passing before `db:push` works.
- If you see `Module not found: fs` from a client import, something server-only leaked into a `"use client"` graph — fix the import, don't alias `fs` away.
- Theme flashes during dev HMR are expected if you forget `suppressHydrationWarning` on `<html>`.
- Apsara 0.56 is pre-1.0 — APIs may shift across minors. TypeScript 6 is new; downgrade to 5.6 if you hit tooling issues.

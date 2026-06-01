# Card

Source: [`src/components/ui/card.tsx`](../../src/components/ui/card.tsx).

Exports `cardVariants`, a slot-based `tailwind-variants` recipe for `Card`,
`CardFrame`, content sections, action rows, dividers, and action buttons.

Two card surfaces — pick one based on emphasis:

- **`Card`** — single-layer card. `border + bg-card` with a subtle
  inset shadow on the top + bottom edges (1px-blur, 6% on top, 4% on
  bottom). Reads as "pressed slightly into the page." The default
  for ~95% of cards.
- **`CardFrame`** — double-layer card. Outer `bg-card` frame with a
  1px border + soft shadow + 4px inner padding wraps an inner
  `bg-muted/72` panel with a 6px-blur inset shadow. Reads as
  "content sunk into a tray." Use for cards that need extra
  emphasis — featured stats, hero promotions, dashboard tiles
  where the inner data should feel weighted.

Both share the same content sub-components (`CardHeader`,
`CardTitle`, `CardDescription`, `CardAction`, `CardPanel`,
`CardFooter`) and an optional sticky-footer pattern (`CardActionRow`
+ `CardActionButton`).

## Parts

- `Card` — single-layer container. `useRender` so you can
  `render={<a … />}` to make the whole card a link.
- `CardFrame` — double-layer container. `innerClassName` lets you
  override the inner panel's classes if needed.
- `CardHeader` — title + description + optional action. `grid` so a
  trailing `CardAction` lands in the right column automatically.
- `CardTitle` — `font-semibold text-base leading-none`.
- `CardDescription` — `text-sm text-muted-foreground`.
- `CardAction` — sits in the trailing column of `CardHeader` (e.g.
  a small icon button or status badge slot).
- `CardPanel` (alias `CardContent`) — the body. Auto-trims top
  padding when there's a `CardHeader` and bottom padding when
  there's a `CardActionRow` so the spacing math collapses.
- `CardFooter` — bottom section for free-form actions (one or two
  buttons). Standard `p-6` padding.
- `CardActionRow` — sticky-bottom action strip (the sub/web pattern).
  `border-t + bg-background/64` strip flush against the bottom edge.
  Auto-injects 1px×4 dividers between children.
- `CardActionButton` — full-width button for `CardActionRow`. Pass
  `destructive` for the red treatment.

## Scenarios

### 1. Plain card with title + description + footer

```tsx
<Card>
  <CardHeader>
    <CardTitle>Pro plan</CardTitle>
    <CardDescription>Unlimited seats · priority support.</CardDescription>
  </CardHeader>
  <CardPanel>
    <div className="flex items-baseline gap-1">
      <span className="font-semibold text-2xl tabular-nums">$12</span>
      <span className="text-sm text-muted-foreground">/mo</span>
    </div>
  </CardPanel>
  <CardFooter>
    <Button size="sm" variant="outline">
      Choose Pro <ArrowRightIcon />
    </Button>
  </CardFooter>
</Card>
```

### 2. Entity tile (the canonical CardFrame pattern)

The most common `CardFrame` use case — a list of resources where each
tile carries an identifier, a status pill, two or three numeric stats,
and inline maintenance actions. This recipe is reused across api keys,
domains, databases, branches, builds, queues, webhooks, cache nodes,
service tokens, OAuth clients, cron jobs, members, invites, incidents,
storage buckets, functions, and endpoints.

The skeleton:

```tsx
<CardFrame>
  <CardHeader>
    <div className="flex items-center gap-2">
      <ResourceIcon className="size-4 opacity-70" />
      <CardTitle className="flex-1 font-mono text-sm">{id}</CardTitle>
      <Badge appearance="soft" variant="success">{status}</Badge>
    </div>
    <CardDescription>{one-line context}</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
      <Stat label="Connections" value="42 / 100" />
      <Stat label="Storage" value="38 GB / 100" />
    </div>
  </CardContent>
  <CardActionRow>
    <CardActionButton><Terminal className="size-3" />Console</CardActionButton>
    <CardActionButton><Square className="size-3" />Pause</CardActionButton>
    <CardActionButton destructive><Trash className="size-3" />Delete</CardActionButton>
  </CardActionRow>
</CardFrame>
```

Where `<Stat label value />` is the trivial helper:

```tsx
const Stat = (props: { label: string; value: string }) => (
  <div>
    <p className="text-muted-foreground text-xs">{props.label}</p>
    <p className="font-medium text-sm tabular-nums">{props.value}</p>
  </div>
);
```

House conventions for the entity tile:

- **Title is `font-mono text-sm`** for technical identifiers
  (`db-prod-1`, `sk_live_…8f21`, `feat/payment-flow`,
  `https://api.acme.app/hooks/billing`). For names that aren't
  identifiers (member email, plan name, incident title), drop the
  `font-mono` and keep the default weight.
- **Optional leading icon** (`size-4 opacity-70`) for resources that
  benefit from visual scanning (Database, Globe, GitBranch, Box,
  KeyRound, Cloud, Code2, Zap, HardDrive). The title sits in
  `flex-1` so the badge stays pinned right.
- **One trailing `Badge`** in the header right column — soft variant,
  status word in lowercase (`live`, `active`, `verified`, `pending`,
  `investigating`, `confidential`, `delivering`, `success`,
  `healthy`, `scoped`, region tags like `us-east-1`).
- **Description is one tight line** — a tagline, runtime, scope, or
  schedule. For schedules / cron expressions use
  `<CardDescription className="font-mono text-xs">`.
- **Stats grid is 2-column**, always `tabular-nums` on values, label
  text muted, value text default. Two stats is the sweet spot; four
  is the upper bound.
- **Action row holds 2–3 `CardActionButton` siblings**. Standard
  pairs: `Edit + Delete`, `Test + Edit + Delete`, `Logs + Restart +
  Stop`, `Copy + Rotate + Revoke`, `Acknowledge + Escalate`,
  `Resend + Cancel`. **Do not** wrap them in a flex container or
  inject other markup — the action row auto-injects dividers between
  direct children.

Concrete examples:

```tsx
// API key
<CardFrame>
  <CardHeader>
    <div className="flex items-center justify-between gap-2">
      <CardTitle className="font-mono text-sm">sk_live_…8f21</CardTitle>
      <Badge appearance="soft" variant="success">live</Badge>
    </div>
    <CardDescription>Production, scoped to read</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
      <Stat label="Created" value="Apr 2, 2025" />
      <Stat label="Last used" value="2 min ago" />
    </div>
  </CardContent>
  <CardActionRow>
    <CardActionButton><Copy className="size-3" />Copy</CardActionButton>
    <CardActionButton><Edit3 className="size-3" />Edit</CardActionButton>
    <CardActionButton destructive><Trash className="size-3" />Revoke</CardActionButton>
  </CardActionRow>
</CardFrame>

// Git branch
<CardFrame>
  <CardHeader>
    <div className="flex items-center gap-2">
      <GitBranch className="size-4 opacity-70" />
      <CardTitle className="flex-1 font-mono text-sm">feat/payment-flow</CardTitle>
      <Badge appearance="soft" variant="info">2 ahead</Badge>
    </div>
    <CardDescription>Last commit 2 hours ago by Riley</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
      <Stat label="Commits" value="14" />
      <Stat label="Behind main" value="0" />
    </div>
  </CardContent>
  <CardActionRow>
    <CardActionButton><GitCommitHorizontal className="size-3" />Open PR</CardActionButton>
    <CardActionButton destructive><Trash className="size-3" />Delete branch</CardActionButton>
  </CardActionRow>
</CardFrame>

// Cron job
<CardFrame>
  <CardHeader>
    <div className="flex items-center justify-between gap-2">
      <CardTitle className="font-mono text-sm">backfill_invoices</CardTitle>
      <Badge appearance="soft" variant="success">active</Badge>
    </div>
    <CardDescription className="font-mono text-xs">0 9 * * MON</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
      <Stat label="Last run" value="Mon 09:00 UTC" />
      <Stat label="Next run" value="in 6 days" />
    </div>
  </CardContent>
  <CardActionRow>
    <CardActionButton><Play className="size-3" />Run now</CardActionButton>
    <CardActionButton><Pause className="size-3" />Pause</CardActionButton>
    <CardActionButton destructive><Trash className="size-3" />Delete</CardActionButton>
  </CardActionRow>
</CardFrame>
```

### 3. Card as a link (whole card clickable)

```tsx
import Link from "next/link";

<Card render={<Link href="/projects/api-gateway-1" />}>
  <CardHeader>
    <CardTitle>api-gateway-1</CardTitle>
    <CardDescription>Edge gateway service</CardDescription>
  </CardHeader>
</Card>
```

### 4. Card with a trailing action in the header

```tsx
<Card>
  <CardHeader>
    <CardTitle>Notifications</CardTitle>
    <CardDescription>Tweak how you hear from us.</CardDescription>
    <CardAction>
      <Button variant="ghost" size="icon-sm">
        <SettingsIcon />
      </Button>
    </CardAction>
  </CardHeader>
  <CardPanel>…</CardPanel>
</Card>
```

`CardAction` lands in the right column of the header grid — title /
description fill the left column.

### 5. Card grid (dashboard tiles)

```tsx
<div className="grid gap-3 sm:grid-cols-3">
  {services.map((s) => (
    <Card key={s.id}>
      <CardHeader>
        <CardTitle>{s.name}</CardTitle>
        <CardDescription>{s.tagline}</CardDescription>
      </CardHeader>
      <CardPanel>
        <div className="flex items-baseline gap-1">
          <span className="font-semibold text-xl tabular-nums">{s.uptime}</span>
          <span className="text-xs text-muted-foreground">uptime</span>
        </div>
      </CardPanel>
    </Card>
  ))}
</div>
```

## Pitfalls

- **`CardActionRow` auto-injects dividers** between its direct
  children. Pass each `CardActionButton` as a sibling — don't wrap
  them in another flex container or the divider injection breaks.
- **`CardPanel` auto-trims top/bottom padding** when paired with
  `CardHeader` / `CardActionRow`. If you skip the header but want
  the trim behavior, render an empty `<div data-slot="card-header" />`
  — or just live with the `pt-6` (it's the right default for a
  bare panel).
- **`CardFrame`'s inner `bg-muted/72`** can clash on pages whose
  parent surface is also `bg-muted` (settings panels). On those
  surfaces, use plain `Card` so the recess isn't fighting the page.
- **`CardFrame` + `CardActionRow` is the entity-tile recipe** — see
  scenario 2 above. The recess emphasizes the stats and the action
  row delivers the maintenance verbs. Skip the pairing only when
  the card has no actions at all (read-only metric panels).
- **The single-layer `Card` border is `1px border-border`** — if
  the parent surface is `bg-card`, the border can blur. Wrap in
  a contrasting parent (`bg-background`) or switch to `CardFrame`
  for guaranteed contrast.

## Rules of thumb

- **Default to `Card`** for ~95% of cases. Pricing tiles,
  settings cards, content panels, list rows — all single-layer.
- **Reach for `CardFrame`** when the card is a focal point on the
  page or carries dense data that needs emphasis (dashboard
  tiles, stat callouts, featured items).
- **Title + description in the header**, content in the panel,
  actions in the footer (or `CardActionRow` for the sticky-strip
  pattern). Don't cram everything into one big `CardPanel`.
- **One `CardAction` per header**, not multiple. For multiple
  actions, use `CardFooter` or `CardActionRow`.
- **`CardActionRow` is for low-emphasis utility actions** (Open,
  Delete, Duplicate). For primary actions (Subscribe, Save), use
  `CardFooter` with a real `Button`.

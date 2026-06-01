# Badge

Source: [`src/components/ui/badge.tsx`](../../src/components/ui/badge.tsx).

Exports `badgeVariants`, a `tailwind-variants` recipe for the shared badge
wrapper classes.

Two appearances on a shared Button design language surface: gradient fill +
1px shadow ring + inset top highlight. **Solid is the default** (primary
emphasis). **Soft** is the secondary modifier — same tones, muted fill,
colored text — for when a page already has a solid badge or for dense lists.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `appearance` | `"solid" \| "soft"` | `"solid"` | Primary emphasis (solid) vs secondary (soft). |
| `variant` | see below | `"default"` | Semantic tone or raw palette color. |

### Variants

**Semantic** — use these when the badge carries meaning:

| Variant | Use for |
| --- | --- |
| `default` | Generic / neutral. Foreground-tinted. |
| `info` | Announcements, pending states, neutral-positive. Sky. |
| `success` | Post-success confirmation — verified, saved, deployed. Emerald. |
| `warning` | Non-blocking caution — review, nearing a limit. Amber. |
| `destructive` | Failed, blocked, high-risk. Rose. |

**Palette** — use the raw color name when the badge is decorative (tags,
categories, user-chosen labels): `zinc`, `red`, `orange`, `amber`, `yellow`,
`lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`,
`violet`, `purple`, `fuchsia`, `pink`, `rose`.

## Scenarios

### 1. Default — neutral status chip

```tsx
<Badge>GMT+3</Badge>
```

### 2. Semantic — solid (primary emphasis)

```tsx
<Badge variant="success">
  <CircleCheck />
  Verified
</Badge>
<Badge variant="warning">
  <Bell />
  Review
</Badge>
<Badge variant="destructive">
  <CircleAlert />
  High Risk
</Badge>
```

### 3. Semantic — soft (secondary emphasis)

```tsx
<Badge appearance="soft" variant="success">Active</Badge>
<Badge appearance="soft" variant="info">Pending</Badge>
```

### 4. Tags / decorative labels

```tsx
<Badge variant="violet">Design</Badge>
<Badge variant="cyan">Frontend</Badge>
<Badge appearance="soft" variant="pink">Marketing</Badge>
```

### 5. Interactive (button / link)

Badge forwards `render`, so it adopts `<button>` / `<a>` semantics:

```tsx
<Badge render={<button type="button" onClick={dismiss} />} variant="info">
  Pending
</Badge>
```

Cursor is automatic when rendered as `button` or `a`.

## Rules of thumb

- **Default to solid.** Reach for soft only when (a) a solid badge already
  sits in the same region and you need a quieter second one, (b) the badge
  is inside a dense list where solid chips would be too loud, or (c) the
  badge decorates text rather than announcing a status.
- **Don't mix tones for the same meaning.** Pick one of `success` / `emerald`
  / `green` for a concept and stick to it per surface.
- **Icon first, label second.** Use `size-3.5` icons (the component targets
  that size by default). No trailing icons.
- **Avoid yellow/lime solid on white backgrounds** — the dark text still
  reads, but the chip can feel loud. Prefer `amber` for warning tones.
- The `default` (neutral) solid uses `--foreground` / `--background` mixing,
  so it automatically adapts to light and dark themes.

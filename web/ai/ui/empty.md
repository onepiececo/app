# Empty

Source: [`src/components/ui/empty.tsx`](../../src/components/ui/empty.tsx).

Slim, opinion-free empty-state primitive. Five components plus the exported
slot recipe `emptyVariants`.
`EmptyMedia` is a **pure positioning slot** — it centers and spaces whatever
you put inside it. There is no built-in icon variant, no `variant="icon"`
prop. Caller decides the visual.

## Parts

- `emptyVariants` — exported `tailwind-variants` slot recipe with `root`, `media`, `title`, `description`, and `actions` slots.
- `Empty` — outer column. `flex flex-col items-center gap-4 px-6 py-12 md:py-16`, centered text.
- `EmptyMedia` — positioning wrapper for the visual element. Drop in an icon, an SVG, a custom decorated block, anything. Adds `pb-2` between the media and the title.
- `EmptyTitle` — single-line headline (`font-heading font-semibold text-lg`).
- `EmptyDescription` — muted helper text. **Always one sentence.** Capped at `max-w-sm`.
- `EmptyActions` — horizontal row of CTAs (`flex flex-wrap gap-2 pt-2`). Wraps on narrow viewports. Convention: secondary on the left, primary on the right.

```tsx
<Empty>
  <EmptyMedia>
    <PulseRings />
  </EmptyMedia>
  <EmptyTitle>No domains added</EmptyTitle>
  <EmptyDescription>
    Add your first domain to start managing routes.
  </EmptyDescription>
  <EmptyActions>
    <Button variant="outline">Learn more</Button>
    <Button>
      <Plus />
      Create domain
    </Button>
  </EmptyActions>
</Empty>
```

Any slot can be omitted. The most minimal is `Empty` + `EmptyTitle` +
`EmptyDescription` (no media, no actions) — fine for inline empty rows.

## Media patterns

Five blessed visuals, picked across rounds 1–10 on `/test`. They are *not*
exported from `empty.tsx` — copy-paste the one you want into your page.
Every pattern wraps a small "focal" badge (a 40px rounded card or circle
holding a lucide icon at `size-4.5`). Swap the icon and the focal shape per
context.

```tsx
const Focal = () => (
  <div className="relative grid size-10 place-items-center rounded-full border border-border bg-card shadow-sm">
    <Globe className="size-4.5 text-foreground/80" />
  </div>
);
```

### 1. Pulse rings

Three concentric rings rippling outward from a circular focal. Geometric,
restrained, broadcasts a centered point. Best default.

```tsx
const PulseRings = () => (
  <div className="relative grid size-24 place-items-center">
    <div className="absolute inset-0 rounded-full border border-border/30" />
    <div className="absolute inset-2 rounded-full border border-border/50" />
    <div className="absolute inset-4 rounded-full border border-border/70" />
    <Focal />
  </div>
);
```

### 2. Layered offsets

Two faint card duplicates fanned at -6° / +6° behind a square-cornered
focal. Reads as "stack of items, none yet". Use when the empty thing
*becomes* a stackable list (notes, files, items).

```tsx
const LayeredOffsets = () => (
  <div className="relative grid size-20 place-items-center">
    <div
      aria-hidden
      className="absolute size-10 -translate-x-3 translate-y-1 rotate-[-6deg] rounded-md border border-border/60 bg-card/60"
    />
    <div
      aria-hidden
      className="absolute size-10 translate-x-3 translate-y-1 rotate-[6deg] rounded-md border border-border/60 bg-card/60"
    />
    <div className="relative grid size-10 place-items-center rounded-md border border-border bg-card shadow-sm">
      <Globe className="size-4.5 text-foreground/80" />
    </div>
  </div>
);
```

### 3. Halftone

Radial dot density forming a soft donut around the focal. Atmospheric,
print-style. Use when you want a quieter, less geometric feel than rings.

```tsx
const Halftone = () => (
  <div
    className="relative grid size-28 place-items-center [mask-image:radial-gradient(circle_at_center,transparent_25%,black_45%,transparent_85%)]"
    style={{
      backgroundImage:
        "radial-gradient(circle, color-mix(in srgb, currentColor 50%, transparent) 1px, transparent 1.4px)",
      backgroundSize: "6px 6px",
    }}
  >
    <Focal />
  </div>
);
```

### 4. Halftone + ring

Halftone donut crossed by one sharp ring outline — texture meets line.
Use when the screen needs a more present empty state (a primary surface,
not a sidebar slot).

```tsx
const HalftoneWithRing = () => (
  <div className="relative grid size-28 place-items-center">
    <div
      className="absolute inset-0 [mask-image:radial-gradient(circle_at_center,transparent_25%,black_45%,transparent_85%)]"
      style={{
        backgroundImage:
          "radial-gradient(circle, color-mix(in srgb, currentColor 50%, transparent) 1px, transparent 1.4px)",
        backgroundSize: "6px 6px",
      }}
    />
    <div className="absolute inset-3 rounded-full border border-border/55" />
    <Focal />
  </div>
);
```

### 5. Concentric halftones

Two halftone donuts at different radii — the rippling-outward DNA of pulse
rings rendered in dot texture. Densest of the five; reserve for hero empty
states (a full-page route, a wide canvas).

```tsx
const ConcentricHalftones = () => (
  <div className="relative grid size-32 place-items-center">
    <div
      className="absolute inset-0 [mask-image:radial-gradient(circle_at_center,transparent_50%,black_60%,transparent_75%)]"
      style={{
        backgroundImage:
          "radial-gradient(circle, color-mix(in srgb, currentColor 40%, transparent) 1px, transparent 1.4px)",
        backgroundSize: "6px 6px",
      }}
    />
    <div
      className="absolute inset-3 [mask-image:radial-gradient(circle_at_center,transparent_30%,black_45%,transparent_65%)]"
      style={{
        backgroundImage:
          "radial-gradient(circle, color-mix(in srgb, currentColor 50%, transparent) 1px, transparent 1.4px)",
        backgroundSize: "6px 6px",
      }}
    />
    <Focal />
  </div>
);
```

## Rules of thumb

- **Description is one sentence, always.** "Add your first domain to start managing routes." not "You have not added any domains yet. Add a domain now."
- **Default to Pulse rings.** It's the most balanced of the five — geometric, restrained, works at 96px.
- **Title is a single line.** If your title runs to two lines you're writing a description.
- **Two buttons max.** Secondary on the left, primary on the right. One button is fine. Zero is fine for read-only empty contexts.
- **Skip `EmptyMedia` for inline empty rows.** A list slot or empty card row inside a larger UI doesn't need a 96px decorated block — title + description + maybe one ghost action is enough.
- **Match the focal shape to the surrounding chrome.** Circular focal for round/pill systems, square focal (`rounded-md`) for card/tile systems. The Layered Offsets pattern looks correct only with a square focal.

### What to avoid (banned across rounds 1–10)

- **No stacked-card icon** with the rotated background cards under a single icon. Cliché, banished. (Layered Offsets is allowed because the cards *are* the visual, not chrome around the icon.)
- **No oversized display title** as a substitute for a media slot. Title stays at `text-lg`.
- **No uppercase eyebrow tags** (`EMPTY`, `NO DATA`) above the title.
- **No watermark glyphs** sitting behind everything as a faint ∅ / 0 / question mark.
- **No hairline ornaments** (line-dot-line dividers, em-dash columns) between title and description.
- **No inline counter chips** (`0` chip beside the title in the same row).
- **No asymmetric arcs / directional ring fragments.** Rings are full circles or they're nothing. Directional empty states feel like errors, not absence.
- **No notched corner brackets / viewfinder L-shapes** around the focal. Reads as a scanner UI, not absence.
- **No crosshairs, sparkle scatter, plus-mark grids, square brackets `[ ]`, curly braces `{ }`, tally marks, triangle stacks, spirals, wireframe cubes, em-dash columns, drop-shadow trails, skeleton-line bars, or zero-bar charts** as media. All explored, all rejected — the visual loses the calm, ambient quality of pulse rings / halftone.
- **No icon variants on `EmptyMedia`.** The slot is positioning only. If a project needs a recurring decorated icon, define a `Focal` helper next to its consumer, don't push it into the primitive.

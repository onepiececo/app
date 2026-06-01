# ScrollArea

Source: [`src/components/ui/scroll-area.tsx`](../../src/components/ui/scroll-area.tsx).
Built on [`@base-ui/react/scroll-area`](https://base-ui.com/react/components/scroll-area).

A custom-scrollbar wrapper around any overflowing region. The native
scrollbar is hidden and replaced with a 1.5px **hover-revealed thumb**
that wears the **Input-family chrome** — tinted gradient fill + 1px ring
(same family as `Input`, `Slider`, `NumberField`, the recessed `Card`
panel). Reads as a member of the same control system rather than an OS
artifact.

The bar is fully transparent when idle and fades in on hover or while
the user is scrolling, then fades back out after 300ms.

Used internally by `Dialog`, `AlertDialog`, `Sheet`, `Drawer`, `Combobox`,
`Command`, `Autocomplete`, and `Sidebar` — promoting the chrome here
upgrades all of them at once.

## Parts

- `ScrollArea` — root + viewport + both scrollbars + corner, all in
  one. Pass children directly. Two boolean props:
  - `scrollFade` — soften the four edges with a mask that scales with
    the actual overflow distance. Use for menu / dialog bodies where
    abruptly cut text feels wrong.
  - `scrollbarGutter` — reserve 10px of viewport padding for the
    scrollbar so the layout doesn't shift when content overflows. Use
    for prose columns and any layout where stable text alignment
    matters.
- `ScrollBar` — exported standalone if you need to compose your own
  layout (`ScrollAreaPrimitive.Root` + `Viewport` + your own children).
  Defaults to `orientation="vertical"`.
- `ScrollAreaPrimitive` — re-export of `@base-ui/react/scroll-area` for
  full access to `Root`, `Viewport`, `Scrollbar`, `Thumb`, `Corner`.

## Scenarios

### 1. Default — vertical list

```tsx
<div className="h-56 overflow-hidden rounded-lg border border-border bg-background">
  <ScrollArea>
    <ul className="flex flex-col py-1">
      {items.map((item) => (
        <li key={item} className="px-3 py-2 text-sm hover:bg-accent">
          {item}
        </li>
      ))}
    </ul>
  </ScrollArea>
</div>
```

The parent must have a fixed height (or other layout that constrains
it). `ScrollArea` is `size-full min-h-0` — it fills whatever container
you give it.

### 2. With `scrollFade` — masked edges

```tsx
<ScrollArea scrollFade>
  …
</ScrollArea>
```

Adds a `mask-t/b/l/r-from-…` mask that fades whichever edge has
content beyond it. The mask scales with `--scroll-area-overflow-y-start`
/ `…-y-end` so it grows in as the user scrolls away from a boundary
and tucks back when the boundary is in view.

Use for menu / popover / drawer bodies where overflow shouldn't feel
sharp.

### 3. With `scrollbarGutter` — reserved space

```tsx
<ScrollArea scrollbarGutter>
  <article className="px-4 py-3">…</article>
</ScrollArea>
```

Adds `pe-2.5` (vertical) / `pb-2.5` (horizontal) to the viewport when
overflow is present, so text and other layout-sensitive content
doesn't shift when the scrollbar appears.

Use for prose columns, settings panels, or any region where the
content should look identical regardless of whether it's overflowing.

### 4. Horizontal — tag rail

```tsx
<div className="h-12 overflow-hidden rounded-lg border border-border">
  <ScrollArea>
    <div className="flex h-full items-center gap-2 px-3">
      {tags.map((tag) => (
        <span key={tag} className="shrink-0 …">{tag}</span>
      ))}
    </div>
  </ScrollArea>
</div>
```

The horizontal scrollbar uses the same hover-revealed Input-chrome
treatment. `shrink-0` on each child keeps the row from compressing.

### 5. Composed — bring your own viewport

```tsx
import { ScrollAreaPrimitive, ScrollBar } from "@/components/ui/scroll-area";

<ScrollAreaPrimitive.Root className="h-56">
  <ScrollAreaPrimitive.Viewport className="h-full">
    {children}
  </ScrollAreaPrimitive.Viewport>
  <ScrollBar orientation="vertical" />
</ScrollAreaPrimitive.Root>
```

Reach for the primitive when you need to add custom data attributes
to the viewport, share a ref, or render only one axis.

## Pitfalls

- **The parent needs a height.** `ScrollArea` is `size-full` — without
  a constrained-height parent (`h-56`, `min-h-0` flex child, fixed
  grid row), there's nothing to overflow against and the scrollbar
  never appears.
- **Wrap in `overflow-hidden rounded-lg`** for rounded containers.
  `ScrollArea` itself doesn't clip — the `rounded-[inherit]` on the
  viewport assumes the parent already does.
- **`scrollFade` masks all four edges.** If you only want vertical
  fade, the mask is harmless on the horizontal axis when there's no
  overflow there (the `--scroll-area-overflow-x-*` vars are 0). But
  if you have horizontal overflow you don't want masked, drop
  `scrollFade` and apply your own `mask-t-*` / `mask-b-*` classes.
- **The thumb chrome is intentionally narrow (1.5px).** Don't widen
  it without coordinating with Input / Slider — the chrome family
  reads as one system. If you need a discoverable always-visible
  scrollbar (e.g. a long settings panel where users might miss the
  hover-reveal), reach for the native scrollbar with `overflow-y-auto`
  on the parent instead.
- **Inner components that use ScrollArea already** (Sheet body,
  Drawer body, Combobox popup, Command list, etc.) don't need to be
  wrapped again. Check the source first.

## Rules of thumb

- **Default to `<ScrollArea>` for any constrained-height region** that
  might overflow — menu lists, popover bodies, sheet contents, list
  rails. The custom thumb is the system's chrome; the native bar
  isn't.
- **Add `scrollFade` for menus, popovers, drawers** where text or list
  items might get cut at the edge.
- **Add `scrollbarGutter` for prose**, forms, and any layout that
  looks different when its scrollbar appears.
- **For full-page scrolling**, don't wrap — let the browser handle it
  with the OS scrollbar. `ScrollArea` is for *inner* scrolling
  regions only.
- **For 2-axis overflow** (large tables, code blocks), the component
  renders both bars and a corner automatically — no extra config.

## Anatomy

```tsx
<ScrollArea.Root>
  <ScrollArea.Viewport>
    <ScrollArea.Content />
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar>
    <ScrollArea.Thumb />
  </ScrollArea.Scrollbar>
  <ScrollArea.Corner />
</ScrollArea.Root>
```

Our `ScrollArea` wrapper assembles `Root` + `Viewport` + both
`Scrollbar`s (vertical + horizontal) + `Corner` in one. `Content` is
optional — children are rendered directly inside `Viewport`. Used as a
shared dependency by `Sheet`, `Drawer`, `Dialog`, `Sidebar`, `Combobox`,
`Command`, `Autocomplete` — restyling the thumb here propagates to all.

## API reference

### Root props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `overflowEdgeThreshold` | `number \| { xStart, xEnd, yStart, yEnd }` | `0` | Pixel threshold before `data-overflow-*-*` data attrs apply. |

Root / Viewport data attributes: `data-has-overflow-x` /
`data-has-overflow-y`, `data-overflow-{x,y}-{start,end}`,
`data-scrolling`. We use `data-has-overflow-y` / `…-x` to apply
`pe-2.5` / `pb-2.5` for `scrollbarGutter`.

### Viewport CSS variables

Drive masks and gutters with these variables (set on the viewport):

- `--scroll-area-overflow-{x,y}-{start,end}` — pixel distance from each
  edge. Used by our `scrollFade` mask. Children must opt in with
  `--scroll-area-overflow-y-start: inherit` to read them.

### Scrollbar props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | We render both. |
| `keepMounted` | `boolean` | `false` | Keeps the bar in the DOM when no overflow. |

Scrollbar data: `data-orientation`, `data-hovering`, `data-scrolling`,
`data-has-overflow-{x,y}`. We key the fade-in opacity off
`data-hovering` / `data-scrolling`.

### Thumb

Renders a `<div>` with `data-orientation`. Sized automatically via
`--scroll-area-thumb-{height,width}`.

### Combining with Tabs

`<Tabs.List render={<ScrollArea.Viewport />}>` lets a tab list be the
scroll viewport directly — useful when the list itself needs the
overflow CSS vars for an edge mask.

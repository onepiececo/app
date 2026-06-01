# PreviewCard

Source: [`src/components/ui/preview-card.tsx`](../../src/components/ui/preview-card.tsx).
Base UI primitive: [Preview Card](https://base-ui.com/react/components/preview-card).

A hover-anchored preview popup for inline links — usernames,
project names, doc references, anything where the user might want
a quick "what is this?" without clicking through. Same
floating-glass chrome as `Menu` / `Popover` / `Toolbar`. Same
origin-aware animation recipe (`scale-[0.92] → 1`, 200ms
`easeOutExpo`, 140ms `easeIn` exit, `data-instant` skip on re-open).

The trigger uses the same underline pattern as Button's `link`
variant — transparent text-decoration at idle, `decoration-foreground`
on hover.

Aliased as `HoverCard` / `HoverCardTrigger` / `HoverCardContent` for
shadcn API parity.

## Anatomy

PreviewCard is base-ui's **hover-to-reveal** primitive (think Twitter handle previews) — distinct from `Popover` (click-to-open) and `Tooltip` (terse hint). It uses the same Portal → Positioner → Popup positioning layer as Popover / Tooltip.

Base-ui parts → project wrappers:

- `PreviewCard.Root` → `PreviewCard` — hover-state container, no DOM.
- `PreviewCard.Trigger` → `PreviewCardTrigger` — inline link (`<a>` by default in idiomatic use; pass `render={<Link />}`).
- `PreviewCard.Portal` → bundled inside `PreviewCardPopup` (passed via `portalProps`).
- `PreviewCard.Backdrop` → *(no wrapper; reach for `PreviewCardPrimitive.Backdrop`)* — rarely needed.
- `PreviewCard.Positioner` → bundled inside `PreviewCardPopup`.
- `PreviewCard.Popup` → `PreviewCardPopup` (alias `HoverCardContent`) — the floating card.
- `PreviewCard.Arrow` → *(no wrapper; use `PreviewCardPrimitive.Arrow`)*.
- `PreviewCard.Viewport` → *(unused by the project wrapper; reach for primitive for animated content swaps)*.

## API reference

**Root** (`PreviewCard`)
- `open` / `defaultOpen` / `onOpenChange`.
- `triggerId` — track the active trigger when multiple share the root.
- `handle` — link to a `createHandle()` for multi-trigger / payload patterns.
- Children may be a render function `({ payload }) => …` when using a handle.

**Trigger** (`PreviewCardTrigger`)
- `delay: number` (default `600` ms) — hover-in dwell before opening.
- `closeDelay: number` (default `300` ms) — hover-out dwell before closing.
- `payload` — value forwarded to Root's render-function children.
- `render={<a href="…" />}` or `render={<Link href="…" />}` — preserve real link semantics; click navigates, hover previews.

**PreviewCardPopup** (wraps Portal + Positioner + Popup)
- Positioner-level: `side` (default `"bottom"`), `align` (default `"center"`), `sideOffset` (default `4`), `alignOffset`, `anchor`, `collisionAvoidance`.
- Portal-level: `portalProps={{ container, keepMounted }}`.

### Data attributes

- `data-popup-open` — on Trigger while card is visible.
- `data-side` — on Popup / Arrow; direction-aware transforms.
- `data-starting-style` / `data-ending-style` — on Popup during enter / exit; drives the scale-and-fade animation.
- `data-instant` — skips the transition on rapid re-open.
- `data-open` / `data-closed` — on Backdrop (visibility state).
- `data-activation-direction` — on Viewport (multi-trigger movement).

## Parts

- `PreviewCard` — root (alias of `PreviewCardPrimitive.Root`).
- `PreviewCardTrigger` — the inline link. Style with the link
  underline pattern (see scenarios).
- `PreviewCardPopup` (alias `HoverCardContent`) — the floating
  card. Wraps Portal + Positioner + Popup internally. Accepts
  `align`, `sideOffset`, `anchor`, `portalProps`. Defaults to
  `align="center"`, `sideOffset={4}`.
- `previewCardVariants` — exported slot recipe for the positioner and
  floating card surface.
- `PreviewCardPrimitive` — re-export of `@base-ui/react/preview-card`.

## Scenarios

### 1. Username link with profile preview

```tsx
const triggerLink =
  "inline-flex items-baseline cursor-pointer text-foreground underline underline-offset-[5px] decoration-[1.5px] decoration-muted-foreground/40 transition-[text-decoration-color] duration-[180ms] hover:decoration-foreground";

<p className="text-sm text-muted-foreground">
  Latest commit by{" "}
  <PreviewCard>
    <PreviewCardTrigger className={triggerLink}>
      @kgrahammatzen
    </PreviewCardTrigger>
    <PreviewCardPopup align="start" sideOffset={6}>
      <div className="flex items-start gap-3">
        <Avatar size="lg">
          <AvatarFallback>KG</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col gap-0.5">
          <p className="font-semibold leading-none text-foreground">Kyle Graham Matzen</p>
          <p className="text-xs text-muted-foreground">@kgrahammatzen</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">
        Building Template, a design-engineering playground.
      </p>
      <Button size="sm" variant="outline" className="self-start">Follow</Button>
    </PreviewCardPopup>
  </PreviewCard>
</p>
```

### 2. Doc / project preview

```tsx
<PreviewCard>
  <PreviewCardTrigger className={triggerLink}>
    Q4 launch plan
  </PreviewCardTrigger>
  <PreviewCardPopup align="start">
    <div className="flex items-center gap-2">
      <FileTextIcon className="size-4 text-muted-foreground" />
      <p className="font-medium leading-none">Q4 launch plan</p>
    </div>
    <p className="text-sm text-muted-foreground line-clamp-3">
      Roadmap for the Q4 marketing-site launch — milestones,
      owners, and success metrics.
    </p>
    <p className="text-xs text-muted-foreground">
      Updated 3 hours ago by <span className="font-medium text-foreground">@kyle</span>
    </p>
  </PreviewCardPopup>
</PreviewCard>
```

### 3. Use Next.js Link as the trigger

```tsx
import Link from "next/link";

<PreviewCard>
  <PreviewCardTrigger render={<Link href="/users/kyle" />}>
    @kyle
  </PreviewCardTrigger>
  <PreviewCardPopup>…</PreviewCardPopup>
</PreviewCard>
```

`render` swaps the underlying element while keeping the trigger's
hover-to-open behavior. Click navigates; hover previews.

### 4. Side / align overrides

```tsx
<PreviewCardPopup side="right" align="start" sideOffset={8}>…</PreviewCardPopup>
```

`side` (`"top"` / `"bottom"` / `"left"` / `"right"`) and `align`
(`"start"` / `"center"` / `"end"`) work identically to Menu /
Popover. The animation origin follows automatically via
`--transform-origin`.

### 5. Custom width

```tsx
<PreviewCardPopup className="w-80">…</PreviewCardPopup>
```

The default is `w-64`. Override via className for wider previews
(richer content) or narrower (tight inline). Cap with explicit
`w-…` rather than letting the popup hug content — uneven widths
across triggers feel sloppy.

## Pitfalls

- **PreviewCard opens on hover with a default delay.** The
  `delay` prop on the Trigger controls it (default ~600ms).
  Don't drop the delay to zero — accidental activations.
- **The trigger is a `<button>` by default.** For real links,
  pass `render={<a href="…" />}` or
  `render={<Link href="…" />}` so click still navigates.
- **Touch users don't see hover** — PreviewCard is a desktop
  affordance. On mobile the trigger acts like a regular link
  (clicking just navigates). Don't put critical content in the
  preview that mobile users need.
- **The popup width defaults to `w-64`** — long content will
  wrap awkwardly. For richer previews bump to `w-72` / `w-80`
  and use `line-clamp-N` on long text.
- **Don't put forms inside a PreviewCard.** Hover popups close
  when the cursor leaves — interactive forms get cancelled
  mid-input. Use `Popover` for forms.

## Rules of thumb

- **Use PreviewCard for inline link metadata** — usernames,
  project names, doc titles, anything the user might want to
  preview without navigating away.
- **Don't use PreviewCard for actions** — that's `Popover` or
  `Menu` territory. Hover-popup ≠ click-popup.
- **The trigger should look like a link** — use the underline
  pattern from `Button`'s `link` variant so users recognize
  it's clickable. Bare text without underline reads as
  non-interactive.
- **Keep preview content scannable** — title + 1–2 sentence
  description + maybe a small action. If it's longer, the user
  should be navigating, not previewing.
- **Aliases** — `HoverCard` / `HoverCardTrigger` / `HoverCardContent`
  are re-exports for shadcn API parity. Prefer `PreviewCard*`
  names in new code.

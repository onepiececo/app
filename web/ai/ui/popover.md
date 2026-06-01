# Popover

Source: [`src/components/ui/popover.tsx`](../../src/components/ui/popover.tsx).
Base UI primitive: [Popover](https://base-ui.com/react/components/popover).

A free-form floating panel anchored to a trigger. Same floating-glass
chrome as `Menu` — no border, `bg-popover`, `rounded-xl`, tight soft
drop shadow, dark-mode 1px ring. Same origin-aware animation as Menu
(scale-from-trigger, custom easeOutExpo, fast easeIn exit, `data-instant`
skip on re-open). Default inner padding is `p-3` (Menu-tight) — enough
breathing room for title + description + interactive controls without
double-padding the popup.

Reach for `Popover` for **arbitrary content** popups (form sections,
info panels, share sheets). Reach for `Menu` for structured **lists of
actions**. They share chrome on purpose so the two read as one family.

## Anatomy

Base-ui parts → project wrappers. Popover shares its positioning layer with `Tooltip` and `Menu` (Portal → Positioner → Popup → Arrow), so the data-attribute hooks below are the same family.

- `Popover.Root` → `Popover` — state container, no DOM.
- `Popover.Trigger` → `PopoverTrigger` — `<button>` that opens the popover.
- `Popover.Backdrop` → *(no wrapper; reach for `PopoverPrimitive.Backdrop`)* — optional `<div>` overlay.
- `Popover.Portal` → bundled inside `PopoverPopup` (passed via `portalProps`).
- `Popover.Positioner` → bundled inside `PopoverPopup` (props lifted to `PopoverPopup`).
- `Popover.Popup` → `PopoverPopup` (also exported as `PopoverContent`) — the floating panel.
- `Popover.Viewport` → bundled inside `PopoverPopup` — enables width/height transitions when content swaps.
- `Popover.Arrow` → *(no wrapper; use `PopoverPrimitive.Arrow` if needed)* — direction-aware pointer.
- `Popover.Title` → `PopoverTitle` — `<h2>` heading.
- `Popover.Description` → `PopoverDescription` — `<p>` body.
- `Popover.Close` → `PopoverClose` — dismiss `<button>`.
- `Popover.createHandle()` → `PopoverCreateHandle` — payload-aware multi-trigger root (use a render-function child on `Popover.Root`, not on Popup).

## API reference

**Root** (`Popover`)
- `open` / `defaultOpen` / `onOpenChange(open, event, reason)`.
- `modal: boolean` — block outside interactions while open.
- `handle: PopoverHandle` — link this root to a `createHandle()` (multi-trigger pattern).
- `actionsRef`, `triggerId` — imperative escape hatches.

**Trigger** (`PopoverTrigger`)
- `openOnHover: boolean`, `delay`, `closeDelay` — hover semantics (Popover stays click-by-default).
- `payload` — value forwarded to Root's render-function children.
- `nativeButton: boolean` — render as a real `<button>` (default true).
- `render={<X />}` — swap the underlying element (Button, Link, etc.).

**PopoverPopup** (wraps Portal + Positioner + Popup + Viewport)
- Positioner-level: `side` (`"top"|"bottom"|"left"|"right"|"inline-start"|"inline-end"`), `align` (`"start"|"center"|"end"`), `sideOffset`, `alignOffset`, `anchor`, `collisionAvoidance`.
- Portal-level: `portalProps={{ container, keepMounted }}`.
- Project-only: `tooltipStyle: boolean` — compact hint chrome.

**Close / Title / Description**: standard `render` / `className` / `style`.

### Data attributes

- `data-popup-open` — on Trigger when open; pair with `data-pressed` for active state.
- `data-side: "top"|"right"|"bottom"|"left"` — on Popup, Arrow, Positioner; drives direction-aware transforms.
- `data-starting-style` / `data-ending-style` — on Popup during enter / exit; used for the project's scale-and-fade animation.
- `data-instant` — on Popup when re-opening fast; CSS skips the transition.
- `data-activation-direction: "left"|"right"|"up"|"down"` — on Viewport; new trigger relative to previous (multi-trigger).
- `data-current` / `data-previous` — on children of Viewport during cross-fade.

## Parts

- `Popover` — root (alias of `PopoverPrimitive.Root`).
- `PopoverTrigger` — opens the popover. Use `render={<Button … />}` to
  adopt button semantics.
- `PopoverPopup` (alias `PopoverContent`) — the floating panel. Wraps
  Portal + Positioner + Popup + Viewport internally. Accepts `side`,
  `align`, `sideOffset`, `alignOffset`, `anchor`, `portalProps`, plus
  `tooltipStyle` for the compact hint variant.
- `PopoverClose` — button that dismisses the popover. Use
  `render={<Button … />}`.
- `PopoverTitle` — `<h2>` heading. Defaults to `text-lg font-semibold`;
  override with className for tighter cases (`text-sm font-semibold`).
- `PopoverDescription` — `<p>` muted body text. Defaults to
  `text-sm text-muted-foreground`.
- `PopoverCreateHandle` — re-export of `PopoverPrimitive.createHandle`
  for the detached-trigger pattern (multiple triggers sharing one root).
- `popoverVariants` — exported slot recipe for `positioner`, `popup`,
  `viewport`, `title`, and `description`. The `tooltipStyle` variant
  tightens popup and viewport chrome for compact clickable hints.
- `PopoverPrimitive` — re-export of `@base-ui/react/popover` for
  custom compositions.

## Scenarios

### 1. Settings panel (the canonical Popover)

```tsx
<Popover>
  <PopoverTrigger render={<Button variant="outline">Notifications</Button>} />
  <PopoverPopup align="start">
    <div className="flex w-72 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <PopoverTitle className="text-sm font-semibold">Notifications</PopoverTitle>
        <PopoverDescription className="text-xs text-muted-foreground">
          Choose how you want to hear from us.
        </PopoverDescription>
      </div>
      <label className="flex items-center justify-between gap-3 text-sm">
        <span>Marketing emails</span>
        <Switch checked={marketing} onCheckedChange={setMarketing} />
      </label>
      <PopoverClose render={<Button variant="ghost" className="self-end">Close</Button>} />
    </div>
  </PopoverPopup>
</Popover>
```

### 2. Quick-info popover (no actions)

```tsx
<Popover>
  <PopoverTrigger render={<Button variant="outline">Quick info</Button>} />
  <PopoverPopup align="start">
    <div className="flex w-64 flex-col gap-1">
      <PopoverTitle className="text-sm font-semibold">Why this matters</PopoverTitle>
      <PopoverDescription className="text-xs text-muted-foreground">
        Anyone with this link can view the file.
      </PopoverDescription>
    </div>
  </PopoverPopup>
</Popover>
```

### 3. Compact hint (`tooltipStyle`)

```tsx
<Popover>
  <PopoverTrigger render={<Button variant="outline">Compact</Button>} />
  <PopoverPopup align="start" tooltipStyle>
    Press <kbd className="font-sans font-medium">⌘K</kbd> to open the
    command bar.
  </PopoverPopup>
</Popover>
```

`tooltipStyle` swaps `rounded-xl` → `rounded-md`, `text-sm` → `text-xs`,
and tightens viewport padding to `py-1 [--viewport-inline-padding:8px]`
— the popup behaves like a Tooltip but stays clickable / focusable.

### 4. Custom side / align

```tsx
<PopoverPopup side="right" align="start" sideOffset={8}>
  …
</PopoverPopup>
```

`side` (`"top"` / `"bottom"` / `"left"` / `"right"` / `"inline-end"` /
`"inline-start"`) and `align` (`"start"` / `"center"` / `"end"`) work
identically to Menu / Tooltip. The animation origin follows automatically
via `--transform-origin`.

### 5. Detached triggers (createHandle)

```tsx
const sharePopover = PopoverCreateHandle<{ id: string }>();

// Many triggers
<Button onClick={() => sharePopover.open("trigger-1")}>Share row 1</Button>
<Button onClick={() => sharePopover.open("trigger-2")}>Share row 2</Button>

// One root with payload-aware content
<Popover handle={sharePopover}>
  <PopoverPopup align="start">
    {({ payload }) => (
      <div>Sharing {payload.id}</div>
    )}
  </PopoverPopup>
</Popover>
```

Detached triggers share a single popover root — useful for tables /
lists where every row would otherwise mount its own root.

### 6. Wrapping a Calendar

`PopoverPopup` includes a `has-data-[slot=calendar]:p-2` rule on the
viewport, so calendars render with `p-2` instead of the default `p-3`.
Just nest a `Calendar` inside:

```tsx
<PopoverPopup align="start">
  <Calendar />
</PopoverPopup>
```

## Animation

Identical to `Menu`'s round-6 winner — see
[`menu.md`](./menu.md#animation-principles) for the seven principles
documented. Summary:

- `transform-origin: var(--transform-origin)` — popup grows from the
  trigger corner.
- `scale: 0.92 → 1` on enter, `1 → 0.95` on exit.
- 200ms enter (`cubic-bezier(0.16, 1, 0.3, 1)`) / 140ms exit
  (`cubic-bezier(0.4, 0, 1, 1)`).
- `data-instant:transition-none` so re-opens skip the animation.

Plus the Popover-specific `transition-[width,height,...]` so
`PopoverViewport` content swaps animate the popup size between states
(used by multi-step popovers — e.g. a wizard inside a single popup).

## Pitfalls

- **`PopoverPopup` is a wrapper for Portal + Positioner + Popup +
  Viewport, not just `Popup`.** Don't try to render `Portal` /
  `Positioner` separately — they're already wired. To escape, drop
  down to `PopoverPrimitive`.
- **`tooltipStyle` does not make the popover behave like a Tooltip.**
  It only restyles. If you need hover-open + skip-delay + escape-key
  semantics, use `Tooltip` instead.
- **The trigger is a `<button>` by default.** Use `render={<a … />}`
  or `render={<Link … />}` if the trigger should navigate as a fallback
  for no-JS, but most popovers are pure UI affordances.
- **`PopoverViewport` swaps content based on a stable key inside.**
  For multi-step popovers, render different children based on local
  state — the Viewport handles cross-fading and width/height
  transitions automatically. See base-ui docs for the
  `data-current` / `data-previous` / `data-activation-direction`
  hooks if you need direction-aware animations.

## Rules of thumb

- **Use Popover for free-form content (forms, sections, info)**, Menu
  for structured action lists. They share chrome — the difference is
  the affordance the popup represents.
- **Always set `align`** if the trigger is at the edge of the
  viewport — default is `"center"` which can clip on the trailing
  side. `align="start"` is correct for ~80% of cases.
- **Title + Description live above interactive content.** Don't bury
  the title under switches; users expect "what is this" before
  "what can I do".
- **Cap width with explicit `w-…`** classes inside the children
  (e.g. `w-72`, `w-96`). The popup hugs content otherwise, which
  produces uneven popups across triggers.
- **Use `tooltipStyle` only for ⌘K-style hints** — anything that needs
  a heading / description / actions belongs in a regular popover or
  a Dialog.

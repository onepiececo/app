# Tooltip

Source: [`src/components/ui/tooltip.tsx`](../../src/components/ui/tooltip.tsx).
Base UI primitive: [Tooltip](https://base-ui.com/react/components/tooltip) — `@base-ui/react/tooltip`.

## Anatomy

```
Tooltip.Provider           // optional — shared timing across a cluster
└── Tooltip.Root           // one trigger+popup pair (or one popup + handle)
    ├── Tooltip.Trigger    // hover/focus target (use render={…})
    └── Tooltip.Portal
        └── Tooltip.Positioner   // floats relative to trigger / anchor
            └── Tooltip.Popup    // the bubble
                └── Tooltip.Arrow  // optional pointer
```

Our `TooltipPopup` is a convenience wrapper that bundles `Portal` +
`Positioner` + `Popup` with the styled surface and slide animation
pre-applied.

## API reference

### `Tooltip.Provider`

| Prop | Default | Notes |
| --- | --- | --- |
| `delay` | — | Initial hover delay (ms). |
| `closeDelay` | — | Hover-out grace period (ms). |
| `timeout` | `400` | Window where adjacent tooltips open instantly (sets `data-instant`). |

### `Tooltip.Root`

| Prop | Default | Notes |
| --- | --- | --- |
| `open` / `defaultOpen` / `onOpenChange` | — | Controlled / uncontrolled state. |
| `triggerId` | — | Active trigger in controlled mode (handle pattern). |
| `trackCursorAxis` | `'none'` | `'x'` / `'y'` / `'both'` to follow the cursor. |
| `disableHoverablePopup` | `false` | Close while hovering popup content. |
| `handle` | — | `TooltipHandle` from `TooltipCreateHandle()` for shared/imperative patterns. |

When `handle` is set, the Root accepts a render-function child:
`<Tooltip.Root handle={h}>{({ payload }) => <Popup>…</Popup>}</Tooltip.Root>`.
The function lives on **Root**, not Popup.

### `Tooltip.Trigger`

| Prop | Default | Notes |
| --- | --- | --- |
| `delay` | `600` | Open delay (ms). Our wrapper defaults to `300`. |
| `closeDelay` | `0` | Close delay (ms). |
| `closeOnClick` | `true` | |
| `disabled` | — | |
| `id` | — | Required for `handle.open(id)` (Pattern 4). |
| `payload` | — | Passed to the handle's render function (Pattern 3). |
| `render` | — | **Use this instead of `asChild`.** |

### `Tooltip.Positioner`

`side` (`'top'` default), `sideOffset`, `align` (`'center'` default),
`alignOffset`, `anchor`, `collisionPadding`, `sticky`.

### Data attributes

- `data-side` — `top` / `right` / `bottom` / `left` (drives slide direction).
- `data-starting-style` / `data-ending-style` — enter/exit phases.
- `data-instant` — set during the `Provider.timeout` window; skip animations.
- `data-popup-open` — present on the trigger while open.

Default tooltips use the theme-matched popover surface. Pass
`appearance="inverse"` for the high-contrast `bg-foreground text-background`
surface when the default does not pop enough against a busy background.
Both appearances use side-aware slide entry plus scale + opacity via
Base UI's `data-side` / `data-starting-style` hooks.

## Parts

- `Tooltip` — Root. Groups one trigger + popup pair (or, with a `handle`,
  one popup + many detached triggers).
- `TooltipTrigger` — the element the user hovers / focuses. Pass any
  element via `render`.
- `TooltipPopup` — the bubble. Bundles `Portal` + `Positioner` + `Popup`,
  with the inverse-panel styling and slide animation pre-applied. Accepts
  `side`, `sideOffset`, `align`, `anchor`, `portalProps`.
- `TooltipKbd` — small inverse-friendly `<kbd>` chip for shortcut hints
  inside the popup. Tuned to read on the `bg-foreground` surface.
- `tooltipVariants` — exported slot recipe for `positioner`, `popup`,
  and `kbd`, with `appearance: "default" | "inverse"`.
- `TooltipProvider` — opt-in wrapper that shares timing across a cluster of
  tooltips (see Pattern 2).
- `TooltipCreateHandle` — factory for a `TooltipHandle` that lets one Root
  serve many detached Triggers (see Patterns 3 & 4).

## Patterns

### 1. Single — one tooltip per trigger (default)

The everyday case. One `Tooltip` wraps one `TooltipTrigger` and one
`TooltipPopup`. Default open delay is 600ms (per base-ui).

```tsx
<Tooltip>
  <TooltipTrigger render={<Button variant="outline" size="sm">Copy</Button>} />
  <TooltipPopup>Copy to clipboard</TooltipPopup>
</Tooltip>

<Tooltip>
  <TooltipTrigger render={<Button variant="outline" size="sm">Save</Button>} />
  <TooltipPopup>
    <span className="flex items-center gap-2">
      Save changes
      <TooltipKbd>⌘S</TooltipKbd>
    </span>
  </TooltipPopup>
</Tooltip>
```

### 2. Grouped — `TooltipProvider`

Wrap a cluster (toolbar, menubar, icon-button strip) in
`TooltipProvider`. The first hover waits the normal delay; while the user
moves between neighbors within the provider's `timeout` (400ms default),
adjacent tooltips open instantly. This is the pattern that makes a
toolbar feel native.

```tsx
<TooltipProvider delay={500} closeDelay={120}>
  <div className="inline-flex items-center gap-1 rounded-lg border bg-background p-1">
    <Tooltip>
      <TooltipTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Bold"><BoldIcon /></Button>} />
      <TooltipPopup>Bold <TooltipKbd>⌘B</TooltipKbd></TooltipPopup>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Italic"><ItalicIcon /></Button>} />
      <TooltipPopup>Italic <TooltipKbd>⌘I</TooltipKbd></TooltipPopup>
    </Tooltip>
    {/* …more triggers */}
  </div>
</TooltipProvider>
```

`TooltipProvider` props:

- `delay` — initial hover delay before the first tooltip opens.
- `closeDelay` — hover-out grace period.
- `timeout` (default 400ms) — how long after closing one tooltip the next
  one opens instantly.

### 3. Shared handle — one popup, many triggers

Use `TooltipCreateHandle()` when you'd otherwise mount a separate
`Tooltip` Root for every row of a list or table. One Root + one Popup
serves *N* detached Triggers; the Popup's children can be a render
function that receives the active trigger's `payload`.

The render-function child belongs to the **Root** (`Tooltip` /
`TooltipPrimitive.Root`), not the Popup. Its argument is `{ payload }`.

```tsx
type RowPayload = { name: string; tip: string; status: "ok" | "warn" };

// Lazy-init via ref — DON'T use useMemo. React may re-invoke a useMemo
// factory and orphan the registered triggers, leaving handle.open() unable
// to find them. Ref-based init is the only stable pattern.
const handleRef = useRef<TooltipHandle<RowPayload> | null>(null);
if (!handleRef.current) handleRef.current = TooltipCreateHandle<RowPayload>();
const handle = handleRef.current;

return (
  <>
    {/* One Root + one Popup, mounted once. */}
    <TooltipPrimitive.Root handle={handle}>
      {({ payload }) => (
        <TooltipPopup side="right" sideOffset={10}>
          {payload ? <span>{payload.tip}</span> : null}
        </TooltipPopup>
      )}
    </TooltipPrimitive.Root>

    {/* Many detached Triggers. */}
    <ul>
      {rows.map((row) => (
        <li key={row.name}>
          <TooltipTrigger
            handle={handle}
            payload={row}
            render={<Button variant="ghost" size="sm">{row.name}</Button>}
          />
        </li>
      ))}
    </ul>
  </>
);
```

Why bother: every extra `Tooltip` Root mounts its own portal,
positioner, and event listeners. With 200+ rows that adds up.

### 4. Imperative open

Same handle, but driven by code instead of hover. Useful for guided
tours, validation flashes, or "did you know" hints. Each Trigger needs an
explicit `id` so the handle can address it.

```tsx
// See Pattern 3 — same lazy-ref pattern, never useMemo.
const handleRef = useRef<TooltipHandle<{ tip: string }> | null>(null);
if (!handleRef.current) handleRef.current = TooltipCreateHandle();
const handle = handleRef.current;

<TooltipPrimitive.Root handle={handle}>
  {({ payload }) => (
    <TooltipPopup side="bottom" sideOffset={8}>
      {payload?.tip ?? null}
    </TooltipPopup>
  )}
</TooltipPrimitive.Root>

<TooltipTrigger
  id="onboarding-target"
  handle={handle}
  payload={{ tip: "Click here to start the tour" }}
  render={<Button variant="outline" size="sm">Onboarding target</Button>}
/>

<Button onClick={() => handle.open("onboarding-target")}>Show hint</Button>
<Button variant="ghost" onClick={() => handle.close()}>Hide</Button>
```

Call `handle.open(triggerId)` / `handle.close()` from event handlers or
effects — never during render.

## Rules of thumb

- **One tooltip per affordance, max.** Don't stack a tooltip on something
  that already has visible label text.
- **Always provide an `aria-label`** on icon-only triggers — the tooltip
  is for sighted users; screen readers need the accessible name on the
  trigger itself.
- **Group icon-button strips with `TooltipProvider`.** Without it, every
  hop across the toolbar pays the 600ms delay tax and the cluster feels
  laggy.
- **Reach for the handle pattern at scale.** Tables, virtualized lists,
  trees with many rows. Below ~20 triggers the boilerplate isn't worth
  it — use single tooltips.
- **Keep tooltip text terse.** One line, no punctuation at the end. If
  it needs more, you want a [`Popover`](../../src/components/ui/popover.tsx).
- **Shortcut hints go inside `TooltipKbd`** — it's tuned to the inverse
  surface so the chip stays legible.
- **Default `side="top"`** is right almost always. Use `side="right"` for
  list rows so the popup doesn't collide with the next row.
- **Never create a handle with `useMemo`.** React may re-invoke the factory
  and orphan registered triggers, causing `handle.open(triggerId)` to throw
  `No trigger found with id "…"`. Use the lazy-ref pattern above.

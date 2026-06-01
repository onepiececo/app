# Slider

Source: [`src/components/ui/slider.tsx`](../../src/components/ui/slider.tsx).
Base UI primitive: [Slider](https://base-ui.com/react/components/slider).

Two slider wrappers built on Base UI. Both use the current control chrome
and share the same primary active-fill treatment as `Progress`.

- **`Slider`** — classic track + thumb. Single value or range, optional
  masked step dots, flexible value-label position, and `surface`
  (`"standard" | "soft"`) for standard or quieter track chrome.
- **`SliderPill`** — compact pill container (`h-8 sm:h-7`) with the value
  inside on the right, label above, a 1px vertical handle line, optional
  `pips` variant for discrete enumerations, and clipped value text so the
  value remains legible when the active fill passes underneath.

When neither covers the design, drop down to the re-exported
`SliderPrimitive` (`@base-ui/react/slider`) and compose your own. The
pitfalls section below documents the non-obvious ones.

## Anatomy

Base UI's primitive is a tree of composable parts. Our wrappers pre-wire
the common shape:

```
SliderPrimitive.Root
├── SliderPrimitive.Label        (optional — we use plain text)
├── SliderPrimitive.Value        (optional — we render our own)
└── SliderPrimitive.Control
    └── SliderPrimitive.Track
        ├── SliderPrimitive.Indicator
        └── SliderPrimitive.Thumb   (×N for multi-thumb / range)
```

**Multi-thumb / range** — pass an array to `value` / `defaultValue` and
render one `Thumb` per value with a unique `index` prop. Our `Slider`
auto-detects this when `value` is `[start, end]`.

**Orientation** — `Root` accepts `orientation="vertical"`; the built-in
`Slider` and `SliderPill` are horizontal-only. For vertical, drop down
to `SliderPrimitive` (see "Composing your own" below).

## Parts

- `Slider` — chunky-track variant. Single value or `[start, end]` range.
- `SliderPill` — pill container with integrated label/value.
  - `variant="scrubber"` (default) — smooth fill, no markers.
  - `variant="pips"` — discrete pip dots. Pips on the filled side are
    masked away, the active pip is hidden, and the last pip is hidden so
    it does not sit under the value text.
- `SliderPrimitive` — re-export of `@base-ui/react/slider` for custom
  compositions.

## API reference (Base UI)

### `SliderPrimitive.Root` props

| Prop | Type | Default |
| --- | --- | --- |
| `value` / `defaultValue` | `number \| number[]` | — |
| `onValueChange` | `(value, eventDetails) => void` | — |
| `min` / `max` / `step` | `number` | `0` / `100` / `1` |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |
| `disabled` | `boolean` | `false` |
| `name` | `string` | — |
| `minStepsBetweenValues` | `number` | — |
| `thumbCollisionBehavior` | `"push" \| "swap" \| "none"` | `"push"` |

### `SliderPrimitive.Thumb` props

| Prop | Type | Default |
| --- | --- | --- |
| `index` | `number` | — (required for multi-thumb) |
| `aria-label` / `getAriaLabel` | `string` / `(index) => string` | — |
| `getAriaValueText` | `(value, index) => string` | — |
| `disabled` | `boolean` | `false` |

### Data attributes (on every part)

- `data-orientation` — `"horizontal" \| "vertical"`.
- `data-dragging` — present on Root (and mirrored to Thumbs) while
  *any* thumb is being dragged. For per-thumb visuals in range mode use
  CSS `:active` instead.
- `data-disabled`, `data-focused`, `data-dirty`, `data-touched`.
- `data-valid` / `data-invalid` — only when nested in a `Field.Root`.

## `Slider` props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number \| [number, number]` | — | Pass an array to enable range mode (two thumbs). |
| `onChange` | `(value) => void` | — | Receives the same shape as `value`. |
| `min` / `max` / `step` | `number` | `0` / `100` / `1` | `min` may be negative (pan, EQ, offsets). |
| `minStepsBetweenValues` | `number` | — | Range mode only. Forwards to base-ui. ~5 keeps thumbs ~16px apart at default widths so they don't visually overlap. Combined with the internal `thumbCollisionBehavior="none"` so thumbs *stop* at each other instead of pushing through. |
| `showSteps` | `boolean` | `false` | Render small dots at every step, masked behind the fill. Decoration only — `step` does the snapping. |
| `showValue` | `boolean` | `true` | Show the value label. Set false for sliders inside `Field` where the value lives elsewhere. |
| `valuePosition` | `"left" \| "right" \| "top" \| "bottom" \| "tooltip"` | `"left"` | `top` / `bottom` render label-left, value-right (`justify-between`, no colon) above/below the slider — **prefer these** so digit-count changes don't reflow the track. `left` / `right` keep an inline `Label: value` next to the slider (slider shrinks as the value grows). `tooltip` floats above the thumb on hover/focus/drag (no inline label rendered). |
| `formatValue` | `(v: number) => string` | `String` | Format the value for display. Right place for `%`, currency, sign prefix, units. |
| `label` | `string` | — | Optional label. Required for any slider that needs context (almost all of them). |
| `surface` | `"standard" \| "soft"` | `"standard"` | `standard` uses the primary active fill and stronger track ring. `soft` keeps the quieter track chrome but still uses the same active fill color as standard sliders. |
| `disabled` | `boolean` | `false` | |

## `SliderPill` props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number` | — | Single value only (use `Slider` for range). |
| `onChange` | `(value: number) => void` | — | |
| `min` / `max` / `step` | `number` | `0` / `100` / `1` | For `pips`, the count is `(max − min) / step + 1`. |
| `variant` | `"scrubber" \| "pips"` | `"scrubber"` | `scrubber` is a smooth fill with a 1px handle line. `pips` shows discrete dots between min/max — keep ≤ 8 stops. |
| `label` | `string` | — | Rendered as a small muted line *above* the pill. The label never sits inside the pill, so it can't collide with the handle or the value text. |
| `formatValue` | `(v: number) => string` | `String` | Often used for `%`, currency, or discrete labels (`["Off", "Low", "Medium", "High", "Ultra"][v]`). |
| `surface` | `"standard" \| "soft"` | `"standard"` | Controls the pill track shell. Active fill still matches the standard primary slider fill. |
| `disabled` | `boolean` | `false` | |

## Scenarios

### 1. Basic — single value (recommended layout)

```tsx
const [volume, setVolume] = useState(40);
<Slider
  value={volume}
  onChange={(v) => setVolume(v as number)}
  valuePosition="top"
  label="Volume"
  formatValue={(v) => `${v}%`}
/>
```

`Volume` sits on the left of the row above the track, the formatted value
sits on the right. The track stays a constant width regardless of how many
digits the value has. **Default to this layout.**

### 2. Range — two thumbs

```tsx
const [price, setPrice] = useState<[number, number]>([25, 75]);
<Slider
  value={price}
  onChange={(v) => setPrice(v as [number, number])}
  valuePosition="top"
  label="Price"
  formatValue={(v) => `$${v}`}
  minStepsBetweenValues={5}
/>
```

The two values render as `25 — 75` on the right side of the top row.
`minStepsBetweenValues={5}` keeps the thumbs ~16px apart at default
slider widths so they don't visually overlap (base-ui's
`thumbCollisionBehavior` is set to `"none"` internally so thumbs stop at
each other instead of pushing through).

### 3. Step dots

```tsx
<Slider
  value={steps}
  onChange={(v) => setSteps(v as number)}
  step={10}
  showSteps
  surface="soft"
  valuePosition="top"
  label="Steps"
/>
```

A CSS mask (`linear-gradient`) hides the dots on the filled side so the
slider reads as one continuous shape — no double-rendering, no occlusion
hacks. Works for range mode too (mask cuts both edges).

### 4. Tooltip value

```tsx
<Slider value={opacity} onChange={(v) => setOpacity(v as number)} valuePosition="tooltip" formatValue={(v) => `${v}%`} />
```

The value floats above the thumb on hover, focus, and drag. No inline
label is rendered.

### 5. Pill — scrubber (continuous)

```tsx
<SliderPill label="Volume" value={vol} onChange={setVol} formatValue={(v) => `${v}%`} />
```

Drag-anywhere. The handle line shifts colour with hover / focus / drag.
The value text is rendered in two clipped layers: muted over the unfilled
track and primary-foreground over the active fill.

### 6. Pill — pips (discrete enumeration)

```tsx
const QUALITY = ["Off", "Low", "Medium", "High", "Ultra"] as const;

<SliderPill
  variant="pips"
  label="Quality"
  value={quality}
  onChange={setQuality}
  min={0}
  max={4}
  surface="soft"
  formatValue={(v) => QUALITY[v]}
/>
```

Pips on the filled side are masked away. The active pip and last pip are
rendered invisible so they never fight the active fill or the value text.

### 7. Disabled

```tsx
<Slider value={50} onChange={() => {}} disabled valuePosition="top" label="Locked" />
<SliderPill label="Volume" value={40} onChange={() => {}} disabled />
```

Drops `pointer-events`, dims to 64% opacity.

### 8. Negative range — pan / EQ / offset

```tsx
const formatPan = (v: number) => (v === 0 ? "0" : v > 0 ? `+${v}` : `${v}`);

<Slider
  value={pan}
  onChange={(v) => setPan(v as number)}
  min={-50}
  max={50}
  valuePosition="top"
  label="Pan"
  formatValue={formatPan}
/>
```

`min` / `max` accept negative values. `formatValue` is the right place
to add a sign prefix or unit suffix.

### 9. Don't use a slider for binary toggles

If `min=0 max=1` is the only thing you can think of, reach for `Switch`
instead. A drag gesture is the wrong affordance for boolean state and
implies a spectrum that doesn't exist.

## Composing your own

Reach for `SliderPrimitive` directly when neither built-in fits — for
example a vertical slider, a non-circular thumb, a layered timeline, or
a slider sitting inside a different surface family. The minimal anatomy:

```tsx
<SliderPrimitive.Root
  value={[v]}
  onValueChange={(next) => setV(Array.isArray(next) ? next[0] : next)}
  min={0}
  max={100}
>
  <SliderPrimitive.Control className="relative flex h-6 w-full touch-none items-center">
    <SliderPrimitive.Track className="relative h-4 w-full grow overflow-hidden rounded-full bg-muted">
      <SliderPrimitive.Indicator className="h-full rounded-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="size-5 rounded-full bg-background outline-none ring-1 ring-border shadow active:scale-110" />
  </SliderPrimitive.Control>
</SliderPrimitive.Root>
```

Production `Slider` extends this with the current standard/soft track
surfaces, primary active fill, thumb hover/active scale, and focus halo.
Cross-reference the source for the exact shadow strings.

## Pitfalls (read before composing)

These are the things that cost us hours during the rounds. Save yourself
the pain.

- **`onValueChange` fires a `number` for single-thumb sliders, not a
  one-element array.** Range sliders fire an array. Always normalise:
  ```ts
  const next = Array.isArray(v) ? v[0] : v;
  ```
  Blindly destructuring `[v]` as if it were always an array silently
  drops every callback for single-thumb sliders.
- **`Track` always renders `position: relative` from base-ui's inline
  style** — you cannot make it `absolute` via className alone. If you
  need an overlay layout, wrap Track in a positioned `<div>`, or follow
  the `SliderPill` pattern (Track is the only flex child of Control,
  takes `h-full w-full`, label/value are absolute overlays).
- **`Indicator` uses `height: inherit`.** That means Track must have an
  explicit height (`h-4`, `h-full`, etc.). If Track only has its
  height implied by `inset-0`, the inherited value resolves to `auto`
  and the fill collapses to zero. **Symptom: invisible fill.**
- **Default thumb alignment is `center`.** Thumb sits at
  `insetInlineStart: {percent}%; translate: -50% -50%` and clips half-off
  at min and max. For pill-style containers with `overflow-hidden`,
  that's fine (the clip is invisible). For the chunky-track style, the
  Thumb is a sibling of Track inside Control so it can hang out without
  being clipped. **Don't reach for `thumbAlignment="edge"`** — it
  introduces a measurement-driven `--position` CSS variable that is
  fragile and makes the `Indicator` break in unrelated ways.
- **Label/value text sitting on top of pips needs handling.** Either
  occlude with `bg-background` (loses the fill behind the text), or
  hide the edge pips with `opacity-0` so they don't collide with the
  text. `SliderPill` does the latter.
- **Don't use two `Track` elements per `Root`.** Base-ui only wires up
  the first Track's children; the second Track's Thumb / Indicator
  silently fails. Put both `Indicator` and `Thumb` inside a single
  `Track`.
- **`data-dragging` lives on the shared Root state**, so it's mirrored
  onto every `Thumb` when *any* thumb is being dragged. For per-thumb
  hover/drag visuals in range mode, use the CSS `:active` pseudo-class
  (`active:scale-110`) — that only fires on the element being clicked.
  `data-dragging` is still the right hook for things that should react
  to drag globally (e.g. a tooltip showing both range values).

## Rules of thumb

- **Default to `Slider`** for true continuous values where the user
  needs to see the value separately (a label or external readout).
  **Default to `SliderPill`** when the slider lives in a settings
  surface and the value should be self-contained inside the chip.
- **Both `Slider` (`valuePosition="top"`) and `SliderPill`** put the label
  on its own line above the track, on purpose. Inline labels cause the
  track to reflow as the value's digit count changes (40 → 100 → -50)
  and let the handle visually collide with the text. Don't try to put
  the label back inside the pill.
- **For `Slider`, prefer `valuePosition="top"`** over `"left"` / `"right"`.
  The inline positions push the track around as the value's digit count
  changes (40 → 100 → -50). The stacked positions keep the track at a
  constant width, value floats on its own row.
- **Use `pips` only for small discrete sets** (≤ 8 stops). Past that
  the dots become noise and the masked active state is hard to read.
- **`valuePosition="tooltip"` is for surfaces where you don't have
  room for any label** — e.g. a very narrow column or a media
  scrubber. It floats outside the Control, so the parent must allow
  overflow (don't put it in an `overflow-hidden` card without padding).
- **`showSteps` is decoration**, not a substitute for `step`. Setting
  `step` snaps the value; `showSteps` only renders the dots.

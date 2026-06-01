# NumberField

Source: [`src/components/ui/number-field.tsx`](../../src/components/ui/number-field.tsx).
Base UI primitive: [Number Field](https://base-ui.com/react/components/number-field).

A numeric input with **ghost − / + steppers placed outside the input** (Linear /
Notion quantity-control feel) plus an optional **drag-to-scrub area**. The
input shell uses the same secondary surface as `Input` / `Slider` / `Menu`, so
a `NumberField` sits inside a form alongside other controls without any
visual seam. Locale + currency / percent formatting is built in via
`Intl.NumberFormatOptions`.

## Anatomy

Base-ui parts → project wrappers:

- `NumberField.Root` → `NumberField` — manages state, formatting, keyboard.
- `NumberField.Group` → `NumberFieldGroup` — wraps the input + steppers shell.
- `NumberField.Input` → `NumberFieldInput` — the native `<input>`.
- `NumberField.Increment` → `NumberFieldIncrement` — step-up button.
- `NumberField.Decrement` → `NumberFieldDecrement` — step-down button.
- `NumberField.ScrubArea` → `NumberFieldScrubArea` — drag-to-scrub region.
- `NumberField.ScrubAreaCursor` → rendered inside `NumberFieldScrubArea` with `CursorGrowIcon`.
- *(project-only)* `NumberFieldRow` — `<div>` flex row holding decrement / group / increment.

## API reference

**Root** (`NumberField`)
- `value` / `defaultValue: number | null` — controlled / uncontrolled value. `null` = empty.
- `onValueChange(value, event)` / `onValueCommitted(value, event)` — change vs. commit.
- `min`, `max`, `step`, `smallStep` (default `0.1`, Alt/Meta), `largeStep` (default `10`, Shift).
- `format: Intl.NumberFormatOptions` — currency / percent / unit / compact / locale separators.
- `locale: string` — override locale for `format`.
- `allowWheelScrub: boolean` — enable mouse-wheel adjustment.
- `allowOutOfRange: boolean` — permit values outside `[min, max]`.
- `disabled`, `readOnly`, `required`, `name`, `id`.

**ScrubArea**
- `direction: "horizontal" | "vertical"` (default `"horizontal"`).
- `pixelSensitivity: number` (default `2`) — pixels per `step`.
- `teleportDistance: number` — wrap cursor at the given distance.

**Increment / Decrement / Input / Group**: `className`, `style`, `render` for swap-element.

### Data attributes

Applied across parts for state-based styling:
- `data-disabled`, `data-readonly`, `data-required`
- `data-valid`, `data-invalid`, `data-dirty`, `data-touched`, `data-filled`
- `data-focused` — on Group / Input
- `data-scrubbing` — on Root / ScrubArea while a scrub is active

## Parts

- `NumberField` — root. Accepts every base-ui prop (`value` / `defaultValue` /
  `min` / `max` / `step` / `smallStep` / `largeStep` / `format` / `locale` /
  `disabled` / `readOnly` / `onValueChange` / `onValueCommitted` etc.).
  Generates a stable `id` and shares it via `NumberFieldContext` so the
  optional scrub area can wire its `<label htmlFor>` automatically.
- `NumberFieldRow` — convenience `<div>` wrapper that lays the
  decrement / group / increment trio in a `flex items-center gap-1.5` row.
  Use it 99% of the time; skip it only if you need a custom layout.
- `NumberFieldGroup` — the input shell. Carries the secondary surface
  chrome (tinted bg + 1px ring + top inset highlight + dark-mode gradient
  + focus halo). Wrap the `NumberFieldInput` in this.
- `NumberFieldInput` — the native `<input>`. Center-aligned, `font-medium`,
  `tabular-nums`.
- `NumberFieldDecrement` / `NumberFieldIncrement` — ghost icon buttons
  (`size-9`, `rounded-md`, `hover:bg-foreground/8`, `active:scale-[0.97]`,
  focus ring). Default to a lucide `MinusIcon` / `PlusIcon`; pass children
  to override.
- `NumberFieldScrubArea` — optional drag-to-scrub handle. Pass `label="…"`
  for the canonical "label-as-scrub-handle" pattern (cursor turns into
  `ew-resize`, dragging changes the value, custom grow cursor renders).
  Renders a `Label htmlFor={fieldId}` automatically using the context.
- `CursorGrowIcon` — the SVG cursor used by `NumberFieldScrubArea`.
- `NumberFieldPrimitive` — re-export of `@base-ui/react/number-field` for
  custom compositions.

## Scenarios

### 1. Basic — uncontrolled

```tsx
<NumberField defaultValue={42}>
  <Label>Quantity</Label>
  <NumberFieldRow>
    <NumberFieldDecrement />
    <NumberFieldGroup>
      <NumberFieldInput />
    </NumberFieldGroup>
    <NumberFieldIncrement />
  </NumberFieldRow>
</NumberField>
```

### 2. Controlled with min / max

```tsx
const [seats, setSeats] = useState<number | null>(2);

<NumberField min={0} max={10} value={seats} onValueChange={setSeats}>
  <Label>Seats (0–10)</Label>
  <NumberFieldRow>
    <NumberFieldDecrement />
    <NumberFieldGroup>
      <NumberFieldInput />
    </NumberFieldGroup>
    <NumberFieldIncrement />
  </NumberFieldRow>
</NumberField>
```

`onValueChange` receives `number | null`. The Decrement / Increment buttons
auto-disable at the bounds.

### 3. Currency formatting

```tsx
<NumberField defaultValue={9.99} step={0.01} format={{ style: "currency", currency: "USD" }}>
  <Label>Price</Label>
  <NumberFieldRow>
    <NumberFieldDecrement />
    <NumberFieldGroup>
      <NumberFieldInput />
    </NumberFieldGroup>
    <NumberFieldIncrement />
  </NumberFieldRow>
</NumberField>
```

`format` is `Intl.NumberFormatOptions` — pass `style: "percent"`,
`unit: "kilometer-per-hour"`, `notation: "compact"` etc. Combine with
`locale` for non-English formatting.

### 4. With a drag-to-scrub label

```tsx
<NumberField defaultValue={50}>
  <NumberFieldScrubArea label="Drag-scrub" />
  <NumberFieldRow>
    <NumberFieldDecrement />
    <NumberFieldGroup>
      <NumberFieldInput />
    </NumberFieldGroup>
    <NumberFieldIncrement />
  </NumberFieldRow>
</NumberField>
```

The scrub area replaces a regular `<Label>`. Hover the label, drag
horizontally, the value changes — Pointer Lock kicks in (except on Safari)
and a custom grow cursor follows the drag.

### 5. Keyboard / wheel modifiers

Out of the box, the user gets:
- `↑` / `↓` — `±step` (default 1)
- `Shift + ↑` / `↓` — `±largeStep` (default 10)
- `Alt + ↑` / `↓` (or Meta on macOS) — `±smallStep` (default 0.1)
- `Page Up` / `Page Down` — `±largeStep`
- `Home` / `End` — clamp to `min` / `max`

Pass `allowWheelScrub` on the root to enable mouse-wheel adjustment.

### 6. Disabled / read-only

```tsx
<NumberField defaultValue={42} disabled>…</NumberField>
<NumberField defaultValue={42} readOnly>…</NumberField>
```

`disabled` drops `pointer-events` and dims to 64% opacity on the row.
`readOnly` keeps the input focusable but blocks edits / stepper clicks.

## Pitfalls

- **`onValueChange` fires `number | null`.** When the user clears the
  input, base-ui sends `null` (not `0` or `undefined`). Type your state
  accordingly.
- **The buttons are siblings of the group, not children.** This is
  variant-C-by-design — placing them inside the group breaks the focus
  halo and changes the visual emphasis. If you need an inside layout for
  a specific surface, drop down to `NumberFieldPrimitive` and compose by
  hand.
- **`NumberFieldScrubArea` requires `NumberField` ancestry.** It pulls
  the field id from `NumberFieldContext` to associate its label. Throws
  with a clear error if used outside.
- **`format` is `Intl.NumberFormatOptions`, not a string.** Use
  `{ style: "percent" }`, not `"percent"`.
- **`step` accepts `"any"`** to disable snapping entirely (free-form
  decimals).

## Rules of thumb

- **Default to NumberField for any single numeric value** with bounded
  input — quantities, prices, percentages, durations. Reach for `Slider`
  / `SliderPill` instead when the user's intuition is range-based
  (volume, opacity, panning) rather than precise.
- **Always pair with a `Label`** — either a regular `<Label>` above the
  row, or `NumberFieldScrubArea label="…"`. A bare number input is
  ambiguous.
- **Prefer `format` over manual string formatting.** It handles locale
  separators, currency symbols, percent conversion, and round-tripping
  on `onValueChange` automatically.
- **Use `value` + `onValueChange` for forms that need real-time
  validation**; use `defaultValue` + `onValueCommitted` if you only
  care about the final value (less re-renders).

# Meter

Source: [`src/components/ui/meter.tsx`](../../src/components/ui/meter.tsx).
Base UI primitive: [Meter](https://base-ui.com/react/components/meter).

A horizontal bar for **passive measurement** — storage used, seats
remaining, plan limit, battery level. Visually identical track to
`Progress` and `Slider` (chunky 18px, tinted Input-family chrome) but
with a **subtle `foreground/20` fill** instead of the primary
gradient — so the bar reads as "this is data" rather than "this is
something happening."

If the bar represents **active progress** (uploading, processing),
use `Progress` instead. The two share the same track shape so they
sit alongside each other in dashboards without breaking visual
rhythm; the fill color tells you which one is which.

## Anatomy

Five composable parts, all wrapping base-ui:

| Wrapper | Base UI part | Element |
| --- | --- | --- |
| `Meter` | `Meter.Root` | `<div>` (groups parts, exposes a11y value) |
| `MeterLabel` | `Meter.Label` | `<span>` |
| `MeterTrack` | `Meter.Track` | `<div>` (the rail) |
| `MeterIndicator` | `Meter.Indicator` | `<div>` (the fill) |
| `MeterValue` | `Meter.Value` | `<span>` (formatted text) |

`MeterPrimitive` re-exports `@base-ui/react/meter`.

`meterVariants` is exported as a slot recipe with `root`, `label`,
`track`, `indicator`, and `value` slots. Because Base UI Meter parts
support function-style `className`, the wrappers preserve that support
through `mergeBaseUiClassName`.

## API reference

`Meter` (Root) props:

- `value: number` *(required)* — current value.
- `min: number` — default `0`.
- `max: number` — default `100`.
- `format: Intl.NumberFormatOptions` — formatting passed to
  `Intl.NumberFormat`. `{ style: "percent" }`, `{ style: "currency",
  currency: "USD" }`, `{ style: "unit", unit: "gigabyte" }`.
- `locale: Intl.LocalesArgument` — non-English formatting.
- `aria-valuetext: string` — screen-reader value override.
- `getAriaValueText: (formattedValue, value) => string` — function form.
- `render` / `className` / `style` accept `(state) => …`.

`MeterValue` `children` is a render function:
`(formattedValue: string, value: number) => ReactNode`. Without
children, base-ui renders the formatted value directly.

`MeterLabel`, `MeterTrack`, `MeterIndicator`, `MeterValue` all
accept `render` / `className` / `style`.

No special data attributes — measurement is static.

## Parts

- `Meter` — root. Renders a default `MeterTrack` + `MeterIndicator`
  if no children are passed. Forwards every base-ui Root prop:
  - `value` (required) — current value.
  - `min` / `max` — defaults `0` / `100`.
  - `format` — `Intl.NumberFormatOptions`. Pass
    `{ style: "percent" }` for a `%` value, `{ style: "currency",
    currency: "USD" }` for currency, `{ style: "unit", unit:
    "kilobyte" }` for units. The formatted result lands in
    `MeterValue`.
  - `locale` — `Intl.LocalesArgument` for non-English formatting.
  - `aria-valuetext` — string override for the screen-reader value.
  - `getAriaValueText: (formattedValue, value) => string` —
    function override for the screen-reader value (e.g. "9.2 of
    10 gigabytes used").
- `MeterLabel` — `<span>` label for the bar (e.g. "Storage used").
- `MeterTrack` — the 18px tinted Input-family chrome (rounded-full,
  inset 1px ring, top inset highlight, dark-mode gradient).
- `MeterIndicator` — the fill (`bg-foreground/20`, dark-mode `/30`).
- `MeterValue` — the formatted value (`text-muted-foreground tabular-nums`).
  Children must be a render function `(formattedValue, value) => ReactNode`
  if you override the default. Without children, base-ui renders the
  formatted value directly (using the Root's `format` / `locale`).
- `meterVariants` — exported slot recipe for composing the same meter
  styles in custom quota layouts.
- `MeterPrimitive` — re-export of `@base-ui/react/meter`.

## Scenarios

### 1. Default — value out of 100

```tsx
<Meter value={62}>
  <div className="flex items-center justify-between">
    <MeterLabel>Storage used</MeterLabel>
    <MeterValue />
  </div>
  <MeterTrack>
    <MeterIndicator />
  </MeterTrack>
</Meter>
```

`MeterValue` defaults to the percentage (`62%`).

### 2. Custom-formatted value

```tsx
<Meter value={92} max={100}>
  <div className="flex items-center justify-between">
    <MeterLabel>Plan limit</MeterLabel>
    <MeterValue className="text-foreground">{() => "9.2 / 10 GB"}</MeterValue>
  </div>
  <MeterTrack>
    <MeterIndicator />
  </MeterTrack>
</Meter>
```

Pass children to override the auto-formatted percent. Bump to
`text-foreground` if the value is the focus of the row.

### 3. Inverse direction (lower is better)

```tsx
<Meter value={28}>
  <div className="flex items-center justify-between">
    <MeterLabel>Seats remaining</MeterLabel>
    <MeterValue>{() => "14 / 50"}</MeterValue>
  </div>
  <MeterTrack>
    <MeterIndicator />
  </MeterTrack>
</Meter>
```

The fill grows left-to-right regardless — the *meaning* of "high"
vs "low" is up to you. Pair with copy that makes it explicit.

### 4. Default chrome (no children — auto layout)

```tsx
<Meter value={62} />
```

Renders a bare track with the indicator. Use when you need the bar
without a label / value (a stat-row sparkline, a progress-style
indicator without a number).

### 5. With min / max

```tsx
<Meter value={3.2} min={0} max={5}>
  <MeterTrack><MeterIndicator /></MeterTrack>
</Meter>
```

`min` / `max` change how `MeterValue`'s default percent is computed
and how `MeterIndicator` sizes itself.

### 6. Built-in Intl formatting (preferred over render-function children)

```tsx
<Meter value={9.2} max={10} format={{ style: "unit", unit: "gigabyte", maximumFractionDigits: 1 }}>
  <div className="flex items-center justify-between">
    <MeterLabel>Storage used</MeterLabel>
    <MeterValue />
  </div>
  <MeterTrack><MeterIndicator /></MeterTrack>
</Meter>
```

`format` flows into `Intl.NumberFormat` and produces `"9.2 GB"`
without you needing to template strings. Pair with `locale` for
non-English. Reach for the render-function children only when the
display format isn't expressible in `Intl.NumberFormatOptions`
(e.g. fractions like `14 / 50`).

### 7. Custom screen-reader value

```tsx
<Meter
  value={28}
  max={50}
  getAriaValueText={(_formatted, value) => `${value} of 50 seats remaining`}
>
  …
</Meter>
```

`getAriaValueText` lets you write a more useful sentence for
assistive tech than "28 percent" — recommended whenever the bar
represents inverse / fractional / domain-specific values.

## Pitfalls

- **Use `Meter` for measurement, `Progress` for action.** They share
  the same track shape on purpose — the fill color is the signal.
  Don't recolor a Meter to primary, or a Progress to foreground —
  it breaks the at-a-glance distinction.
- **`MeterValue` children must be a render function**, not a string
  — base-ui passes the formatted value + raw value as args:
  `<MeterValue>{(formatted, value) => `${value} GB`}</MeterValue>`.
  For pure custom strings just ignore the args:
  `<MeterValue>{() => "9.2 / 10 GB"}</MeterValue>`.
- **Prefer `format` on `Meter` over render-function children.** The
  built-in `Intl.NumberFormatOptions` covers `%`, currency, units,
  compact notation — and you get correct localization for free.
  Render-function children are the escape hatch.
- **No animation by default**. The fill `transition-all duration-500`
  smooths value changes if your data updates over time, but if the
  value is static (rendered once), nothing animates.
- **Always pair with a label.** A bare Meter is just a "62% of
  something" — the label tells the user *what* the something is.

## Rules of thumb

- **Meter** for storage, quota, capacity, level, score — anything
  static or slowly-changing that the user reads.
- **Progress** for upload, processing, save, sync — anything the
  app is *doing right now*.
- **Group Meter rows in a dashboard** to scan a quota panel at a
  glance.
- **Use the `text-foreground` value class** when the number is the
  primary thing the user cares about (`9.2 / 10 GB used`); leave it
  muted when the bar itself communicates the answer (`62%`).

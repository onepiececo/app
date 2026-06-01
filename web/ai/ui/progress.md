# Progress

Source: [`src/components/ui/progress.tsx`](../../src/components/ui/progress.tsx).
Base UI primitive: [Progress](https://base-ui.com/react/components/progress).

Determinate progress bar for **active brand actions** (upload,
processing, save). Visually identical 18px chunky track to `Meter`
and `Slider` (tinted Input-family chrome) but with a primary
gradient fill — the bar reads as "this is something happening" vs
Meter's subtle foreground fill which reads as "this is data."

Ships two variants sharing the same primary-gradient fill on the
shared track.

## Variants

| Variant | Use for |
| --- | --- |
| `default` | Determinate progress where the value itself conveys motion — upload %, file counts, step progress. Static gradient fill, no animation. |
| `striped` | Ongoing work that's still moving — background syncs, long imports, anything where a static bar would read as "stuck". Same fill with an animated diagonal-stripe overlay. |

## Parts

- `Progress` — root. Accepts `value` (0–100) and `variant`.
- `ProgressLabel` — optional label row.
- `ProgressTrack` — the tinted recessed background.
- `ProgressIndicator` — the primary-gradient fill. Takes `variant`.
- `ProgressValue` — renders the current value (tabular-nums).

The convenience form `<Progress value={v} variant="..." />` renders a
`ProgressTrack` + `ProgressIndicator` with the right variant for you.

## Scenarios

### 1. Determinate — file upload

```tsx
<div className="flex flex-col gap-2">
  <div className="flex items-center justify-between text-sm">
    <span className="text-muted-foreground">Uploading</span>
    <span className="font-medium tabular-nums">{value}%</span>
  </div>
  <Progress value={value} />
</div>
```

### 2. Ongoing work — syncing

Use `striped` when the bar value won't change for a while but you want the UI
to feel alive.

```tsx
<Progress value={62} variant="striped" />
```

### 3. Compose manually

If you need a different layout, build the parts directly.

```tsx
<Progress value={value}>
  <div className="flex items-center justify-between text-sm">
    <ProgressLabel>Import</ProgressLabel>
    <ProgressValue />
  </div>
  <ProgressTrack>
    <ProgressIndicator variant="striped" />
  </ProgressTrack>
</Progress>
```

## Rules of thumb

- Default to `variant="default"`. Switch to `striped` only when the value is
  genuinely mid-update for more than a second or two.
- For indeterminate work (no % available), use the `Spinner` component, not
  a striped Progress at 100%.
- Keep label + value on their own row above the bar. Don't overlay text on
  the bar — it fights with the fill color across themes.

## Anatomy

```tsx
<Progress.Root>
  <Progress.Label />
  <Progress.Track>
    <Progress.Indicator />
  </Progress.Track>
  <Progress.Value />
</Progress.Root>
```

Our wrapper maps `Progress` → `Root`, `ProgressLabel` → `Label`,
`ProgressTrack` → `Track`, `ProgressIndicator` → `Indicator`,
`ProgressValue` → `Value`.

## API reference

### Root props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | `number \| null` | `null` | `null` = indeterminate. We use 0–100 for determinate. |
| `min` / `max` | `number` | `0` / `100` | Override if your scale isn't percent. |
| `format` | `Intl.NumberFormatOptions` | — | Controls how `Progress.Value` formats text. |
| `locale` | `Intl.LocalesArgument` | runtime | For `Intl.NumberFormat`. |
| `getAriaValueText` | `(formatted, value) => string` | — | Custom screen-reader text. |

### Value props

- `children`: `(formattedValue, value) => ReactNode` — render-prop for
  custom value display. Default renders the formatted number.

### Status / data attributes

All parts expose the same status attributes derived from `value`:

- `data-progressing` — value is between min and max.
- `data-complete` — value reached max.
- `data-indeterminate` — value is `null`.

`Progress.Status` type: `'indeterminate' | 'progressing' | 'complete'`.

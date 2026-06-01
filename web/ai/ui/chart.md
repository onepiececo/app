# Chart

Source: [`src/components/ui/chart.tsx`](../../src/components/ui/chart.tsx).
Built on [recharts](https://recharts.org) 2.15.4. Adapted from the
shadcn-ui chart wrapper.

Exports `chartVariants`, a slot-based `tailwind-variants` recipe for the
container, tooltip, tooltip indicators, and legend parts.

A thin set of primitives that take any recharts chart and:

- Provide a context (`ChartConfig`) mapping each data series key to a
  `label`, optional `icon`, and a CSS color (or per-theme color pair).
- Inject a `<style>` block that exposes those colors as
  `--color-<key>` CSS variables scoped to that chart instance.
  Inside the chart, write `fill="var(--color-desktop)"` instead of
  passing literal hex strings.
- Wrap the chart in `<ResponsiveContainer>` so it fills its parent.
- Theme recharts internals (axis ticks, grid lines, cursor, tooltip
  cursor, polar grid, radial bar background, tooltip dot stroke)
  via Tailwind selectors so you don't have to override `stroke="#ccc"`
  one element at a time.
- Provide drop-in `ChartTooltipContent` and `ChartLegendContent`
  renderers that read from the `ChartConfig` so labels + indicator
  colors stay in sync with the rest of the UI.

You stay on the recharts API for the chart itself (`<BarChart>`,
`<Bar>`, `<XAxis>`, etc.). The wrapper handles theming, tokens, and
tooltip chrome.

## Why recharts 2 (not 3)

We're pinned to **recharts 2.15.4**, not 3.x. recharts 3 changed the
default `<Tooltip>` `isAnimationActive` to `'auto'` and started
CSS-transitioning the tooltip wrapper's `transform` between cursor
positions. On charts that have many small hit targets (donut wedges,
narrow bars), this reads as the tooltip "sliding from the previous
position" or "snapping to the corner" on each move, which looks
broken. Disabling animation makes the tooltip feel dead, so the cleaner
fix is to stay on v2 — same API otherwise, every shadcn / evilcharts
example targets it, and the tooltip behavior matches expectations
without ceremony.

If you ever want to upgrade to v3, you'd need to either ship
`isAnimationActive={false}` on every `<ChartTooltip>` or use a function
content prop that re-mounts on each position change. Both feel worse
than just staying on v2.

## Parts

- `ChartContainer` — the outer wrapper. Takes `config` and any
  recharts chart as `children`. Renders the `<ResponsiveContainer>`
  internally and wires the `--color-*` CSS variables for that chart's
  scope. Default `aspect-video` size — override with `className` for
  donut/pie variants (e.g. `mx-auto aspect-square h-65 w-65`).
- `ChartTooltip` — re-export of `recharts.Tooltip`. Pass `cursor={…}`
  and `content={<ChartTooltipContent .../>}`.
- `ChartTooltipContent` — themed tooltip body. Reads `ChartConfig`
  from context, renders an indicator (`dot`, `line`, or `dashed`),
  the series label, and the formatted value. Props:
  - `hideLabel` — drop the top label (the X-axis category). Useful
    when the indicator already conveys the row.
  - `hideIndicator` — drop the colored swatch.
  - `indicator` — `"dot" | "line" | "dashed"`.
  - `nameKey` / `labelKey` — override which property of the payload
    item gets used as the series key (useful for pie charts where
    `dataKey="visitors"` but each wedge's `name` is the browser).
  - `formatter` / `labelFormatter` — custom render functions for
    rows / the label.
- `ChartLegend` — re-export of `recharts.Legend`. Pair with
  `ChartLegendContent`.
- `ChartLegendContent` — themed legend rendered as a horizontal
  flex row with colored swatches and the config's labels.
- `ChartStyle` — internal. Emits the `--color-*` variables. You don't
  call this directly, `ChartContainer` does.
- `chartVariants` — exported slot recipe for the wrapper, tooltip rows,
  indicators, and legend items.

## ChartConfig shape

```ts
type ChartConfig = {
  [key: string]: {
    label?: ReactNode;
    icon?: ComponentType;
  } & (
    | { color?: string;      theme?: never }
    | { color?: never;       theme: { light: string; dark: string } }
  );
};
```

- The keys match the **`dataKey`** values in your chart series
  (`<Bar dataKey="desktop" />` ↔ `config.desktop`).
- `color` is a CSS value — usually `"var(--chart-1)"` from globals,
  but any color works (`"#3b82f6"`, `"oklch(...)"`).
- Use `theme: { light, dark }` instead of `color` when you want the
  series to render different colors in each theme. `ChartStyle`
  emits both at once and the `.dark` selector picks the right one.
- Series with no `color` and no `theme` (like `visitors: { label: "Visitors" }`
  in the donut config) just contribute their label; their wedge color
  comes from the data row's `fill` field instead.

## Tokens

`globals.css` ships `--chart-1` through `--chart-5`. They flip per
theme — orange/teal/cyan/amber-amber in light, blue/emerald/amber/
purple/rose in dark. Always reach for these first; don't hard-code
hex values inside chart configs unless you need a deliberately
out-of-system color (a brand red for "danger", a literal Chrome
yellow for browser breakdowns, etc.).

## Scenarios

### 1. Single-series bar

```tsx
const config = {
  desktop: { label: "Sessions", color: "var(--chart-2)" },
} satisfies ChartConfig;

<Card>
  <CardHeader>
    <CardTitle>Sessions per month</CardTitle>
  </CardHeader>
  <CardContent>
    <ChartContainer config={config}>
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip
          cursor={{ fill: "color-mix(in srgb, var(--foreground) 5%, transparent)" }}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  </CardContent>
</Card>
```

### 2. Stacked bars (rounded ends)

`radius` is per-corner. Stacks read cleanly when only the bottom
layer rounds the bottom and only the top layer rounds the top:

```tsx
<Bar dataKey="mobile"  stackId="a" fill="var(--color-mobile)"  radius={[0, 0, 4, 4]} />
<Bar dataKey="tablet"  stackId="a" fill="var(--color-tablet)"  />
<Bar dataKey="desktop" stackId="a" fill="var(--color-desktop)" radius={[4, 4, 0, 0]} />
```

### 3. Stacked area with soft gradient fills

Define a `<linearGradient>` per series in `<defs>`, then reference it
as `fill="url(#grad-X)"`. Keep the stroke solid so the boundary is
crisp.

```tsx
<defs>
  <linearGradient id="grad-desktop" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stopColor="var(--color-desktop)" stopOpacity={0.55} />
    <stop offset="100%" stopColor="var(--color-desktop)" stopOpacity={0.05} />
  </linearGradient>
</defs>
<Area
  dataKey="desktop"
  type="monotone"
  fill="url(#grad-desktop)"
  stroke="var(--color-desktop)"
  stackId="a"
  strokeWidth={1.5}
/>
```

### 4. Single-color line with dots

```tsx
<Line
  dataKey="visits"
  type="monotone"
  stroke="var(--color-visits)"
  strokeWidth={2}
  dot={{
    r: 3,
    fill: "var(--color-visits)",
    stroke: "var(--background)",
    strokeWidth: 2,
  }}
  activeDot={{
    r: 5,
    fill: "var(--color-visits)",
    stroke: "var(--background)",
    strokeWidth: 2,
  }}
/>
```

The dot's `stroke="var(--background)"` is the trick that makes the
dot read as "punched out of the line" in both themes.

### 5. Donut with center label

The pie/donut needs explicit dimensions on `ChartContainer` — the
default `aspect-video` won't constrain width and ResponsiveContainer
will fall over (`width(-1) height(-1)` warning). Use a fixed square:

```tsx
<ChartContainer
  config={pieConfig}
  className="mx-auto aspect-square h-65 w-65"
>
  <PieChart>
    <ChartTooltip
      cursor={false}
      content={<ChartTooltipContent nameKey="visitors" hideLabel />}
    />
    <Pie
      data={browserData}
      dataKey="visitors"
      nameKey="browser"
      innerRadius={70}
      outerRadius={110}
      paddingAngle={2}
      cornerRadius={4}
      strokeWidth={0}
    />
    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground">
      <tspan x="50%" dy="-0.4em" className="font-mono font-semibold text-2xl tabular-nums">
        {total.toLocaleString()}
      </tspan>
      <tspan x="50%" dy="1.5em" className="fill-muted-foreground text-xs">
        visitors
      </tspan>
    </text>
  </PieChart>
</ChartContainer>
```

The `<text>` inside `<PieChart>` becomes the center label. Use SVG
text with `tspan`s rather than HTML to position cleanly inside the
chart's coordinate space.

For the pie data, each row carries its own `fill: "var(--color-chrome)"`
so wedges pick up the per-key color from `ChartConfig`.

### 6. Per-theme series colors

```tsx
const config = {
  revenue: {
    label: "Revenue",
    theme: {
      light: "oklch(0.55 0.20 145)",
      dark:  "oklch(0.75 0.18 145)",
    },
  },
} satisfies ChartConfig;
```

Reach for this when a single `var(--chart-N)` doesn't read well in
both themes — e.g. a brand color that's too bright on light bg.

## Pitfalls

- **Don't use recharts 3.** See "Why recharts 2" above. The
  `package.json` is pinned to `^2.15.4` — do not bump it.
- **`ChartContainer` defaults to `aspect-video`.** That works for
  bar / area / line. Pie + donut need a square — pass an explicit
  `className="mx-auto aspect-square h-[X]px w-[X]px"`. Don't leave it
  `aspect-video` and hope for the best; ResponsiveContainer will
  collapse to a width(-1) error.
- **The `--color-X` variable is scoped to that chart instance.** If
  you have two charts on the same page, both can use `--color-desktop`
  with different actual colors (each chart's `ChartConfig` resolves
  independently). The selector is `[data-chart=chart-<id>]`.
- **Tooltip `content` accepts a JSX element, not a function.** Pass
  `content={<ChartTooltipContent .../>}` so recharts can clone it
  with `active` / `payload` / `label`. The function form works in v3
  but is unnecessary on v2.
- **`accessibilityLayer` is a recharts 2.10+ prop on chart roots.**
  Always pass it on `<BarChart>` / `<LineChart>` / `<AreaChart>` —
  it adds keyboard navigation and screen-reader announcements at zero
  visual cost.
- **`CartesianGrid vertical={false}` + `strokeDasharray="3 3"`** is
  the "clean horizontal grid only" recipe. Skip it on dense bar
  charts where the grid competes with the bars.
- **Don't render a chart inside a Server Component directly.** The
  whole module is `"use client"` (recharts uses refs + effects). Use
  the chart from a client component or wrap it.
- **`text-xs` on the container** — `ChartContainer` sets `text-xs`
  globally so axis ticks pick it up. Don't override unless you mean
  to scale axis text too.

## Rules of thumb

- **5 chart types covers ~90% of dashboards**: stacked bar, single
  bar, stacked area, line, and donut. Build one of each before
  reaching for radar / radial / scatter / treemap.
- **Always wrap a chart in a `Card`** with title + description above
  and the `<ChartContainer>` inside `<CardContent>`. The card frame
  and padding give the chart room to breathe; bare charts on a page
  read as unfinished.
- **Trend badge in the title** — pair the title with a small `Badge
  variant="success"` (or `destructive` for drops) showing the
  period-over-period delta. Cards without a trend feel less
  insightful than they should.
- **Hide the Y-axis on small / sparkline-style charts.** The tooltip
  already shows the exact value; the Y-axis just steals horizontal
  space.
- **For bar charts use `radius={[4, 4, 0, 0]}`** (top corners only).
  Fully-rounded bars look like pills, not bars.
- **For line charts use `type="monotone"` or `type="bump"`**. Avoid
  `type="linear"` (jagged) and `type="step"` (only for genuinely
  step-shaped data like staffing levels).
- **Pies sized at 260×260 with 70/110 inner/outer radius** is the
  default donut size that reads at every density. Smaller (200×200)
  if you have multiple pies side-by-side; larger (320×320) only when
  the pie is the page's main thing.
- **Tooltip `cursor={false}` for pies** (no axis to draw it on).
  Bars get `cursor={{ fill: "color-mix(in srgb, var(--foreground) 5%, transparent)" }}`
  for a subtle hover band; lines get a 1px vertical stroke.

# Calendar

Source: [`src/components/ui/calendar.tsx`](../../src/components/ui/calendar.tsx).
Built on [`react-day-picker`](https://daypicker.dev/).

Exports `calendarVariants`, a slot-based `tailwind-variants` recipe for the
DayPicker classNames contract (`root`, buttons, day states, dropdowns, nav,
month layout, today marker, etc.).

A styled wrapper around `DayPicker` with the system's chrome:
- `bg-accent` hover on each day cell
- `bg-primary` + `text-primary-foreground` for selected days
- 3px primary-colored dot below the cell to mark today (flips to
  `bg-background` when the cell is also selected, so it stays visible
  against the primary fill)
- Outside-month days fade to `text-muted-foreground/72`
- Range mode: start / end use the `bg-primary` fill; middle uses
  `bg-accent` and squared corners so the range reads as one
  continuous bar
- Cells are `40px` (mobile) / `36px` (sm+) by default
- Lucide chevrons for nav, with caption + nav row absolutely
  positioned so the month name centers cleanly

## Parts

- `Calendar` — the only export. Forwards all `react-day-picker` props
  (mode, selected, onSelect, defaultMonth, disabled, etc.) and merges
  user `className` / `classNames` / `components` with the styled
  defaults.
- `calendarVariants` — exported slot recipe for the default DayPicker
  class names. Prefer overriding through `className` / `classNames` at the
  call site; update the recipe when changing the system default.

## Modes

| Mode | `selected` shape | Use for |
| --- | --- | --- |
| `"single"` (default) | `Date \| undefined` | Date picker, single-day selection |
| `"multiple"` | `Date[]` | Multi-day selection (mark availability) |
| `"range"` | `{ from?: Date; to?: Date }` | Date range (booking, filter, etc.) |

See the [react-day-picker docs](https://daypicker.dev/api) for the
full prop surface — everything passes through.

## Scenarios

### 1. Inline single-date picker

```tsx
const [date, setDate] = useState<Date | undefined>(new Date());

<Calendar mode="single" selected={date} onSelect={setDate} />
```

### 2. Inline range picker

```tsx
const [range, setRange] = useState<DateRange | undefined>({
  from: new Date(),
  to: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
});

<Calendar mode="range" selected={range} onSelect={setRange} />
```

The range fill: start + end use the primary color, middle days use
`bg-accent` with squared corners so the run reads as a single bar.

### 3. Date picker (Popover-anchored)

```tsx
<Popover>
  <PopoverTrigger
    render={
      <Button variant="outline" className="w-56 justify-start font-normal">
        <CalendarIcon aria-hidden />
        {date ? formatDate(date) : "Pick a date"}
      </Button>
    }
  />
  <PopoverPopup align="start">
    <Calendar mode="single" selected={date} onSelect={setDate} />
  </PopoverPopup>
</Popover>
```

`PopoverPopup` already has a `has-data-[slot=calendar]` rule that
tightens the inner viewport padding to `p-2` (vs the default `p-3`),
so the calendar sits flush inside the popup.

### 4. Disabled past dates

```tsx
<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  disabled={{ before: new Date() }}
/>
```

`disabled` accepts a Date, an array, a matcher object, or a
function — see react-day-picker's matcher API.

### 5. Multi-month layout

```tsx
<Calendar
  mode="range"
  numberOfMonths={2}
  selected={range}
  onSelect={setRange}
/>
```

Renders two month grids side-by-side on `sm+`, stacked on mobile.
Useful for travel / booking range pickers.

### 6. With month / year dropdowns

```tsx
<Calendar
  mode="single"
  captionLayout="dropdown"
  selected={date}
  onSelect={setDate}
  fromYear={2020}
  toYear={2030}
/>
```

Switches the caption from chevron-only navigation to two `<select>`
dropdowns (month + year) inside an Input-shaped frame.

## Pitfalls

- **The component is large.** Each Calendar render recomputes 6×7 day
  cells. For lists of date pickers (e.g. a row per booking), prefer
  `defaultMonth` over `month` so the calendar isn't fully controlled.
- **Today is a `*:after:` pseudo-element**, not an indicator div.
  The 3px dot comes from a `:after` on the day's inner button. If
  you customize the day button via `components.DayButton`, restore
  the `*:after:…` rules or the today marker disappears.
- **Range mode middle uses `bg-accent`**, end / start use `bg-primary`.
  The `range-middle` / `range-start` / `range-end` class names are
  applied to the `data-day` element; the day button selects them
  via `in-[.range-middle]:` etc.
- **Don't restyle just one part of a range** — selected days reuse
  the same chrome rules across modes. Tweaking start without end
  produces visual inconsistency.

## Rules of thumb

- **Use Calendar inline** when the picker is a primary surface
  (event scheduler, booking page, dashboard date filter that's
  always visible).
- **Use Calendar inside a Popover** for date inputs in forms — the
  Popover's `has-data-[slot=calendar]:p-2` rule tightens spacing
  automatically.
- **Single mode** for "what date?", **range mode** for "from / to",
  **multiple mode** for "mark all the days that apply".
- **Cap `disabled` past / future dates** for booking / appointment
  flows so users can't pick invalid options.
- **Use `numberOfMonths={2}`** for range pickers when the typical
  range spans more than ~10 days. One-month range pickers force
  users to flip back and forth across the boundary.
- **Lock the month range** with `fromYear` / `toYear` (or
  `fromMonth` / `toMonth`) when the valid window is bounded —
  prevents users from navigating to 2099.

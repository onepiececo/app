# DatePicker

Source: [`src/components/ui/date-picker.tsx`](../../src/components/ui/date-picker.tsx).
Composition built on [`Popover`](./popover.md), [`Calendar`](./calendar.md),
[`Button`](./button.md), and [`Select`](./select.md) (the last only when
`captionLayout="dropdown"` is used).

A single `DatePicker` component covering both single-date and date-range
selection. The date popover is anchored to a `Button`-shaped trigger that
shows the formatted value (or a placeholder); the popover holds a
`Calendar`. When `captionLayout="dropdown"` is set, the month/year captions
inside the calendar automatically use our `Select` instead of native
`<select>` elements (the wiring is internal — no adapter export needed).

Exports `datePickerVariants`, a slot-based `tailwind-variants` recipe for the
trigger and popover body layout.

## Basic shape

```tsx
import { DatePicker } from "@/components/ui/date-picker";

const [date, setDate] = useState<Date>();

<DatePicker value={date} onValueChange={setDate} />
```

That's the entire baseline: outline-button trigger, `Pick a date`
placeholder, `PPP` (`April 26th, 2026`) format, popover anchored to the
trigger.

## Props

```ts
type DatePickerProps =
  & {
      placeholder?: ReactNode;       // default: "Pick a date" or "Pick a date range"
      formatStr?: string;            // date-fns format. default: "PPP" (single) | "LLL dd, y" (range)
      triggerClassName?: string;     // default trigger is w-65 outline button — override here
      triggerVariant?: ButtonVariant;// default: "outline"
      open?: boolean;                // controlled popover state
      onOpenChange?: (open) => void;
      closeOnSelect?: boolean;       // close popover on selection (range closes when both ends chosen)
      beforeCalendar?: ReactNode;    // content rendered to the left of the Calendar (preset rails, etc.)
      popupAlign?: "start" | "center" | "end";   // default: "start"
      popupClassName?: string;
      defaultMonth?: Date;           // default: derived from value
      month?: Date;                  // controlled month
      onMonthChange?: (m: Date) => void;
      captionLayout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years";
      startMonth?: Date;             // year-bracketing for dropdown captionLayout
      endMonth?: Date;
      components?: CalendarComponents; // override Calendar internals
      id?: string;                   // applied to the trigger (for Field association)
      disabled?: boolean;
    }
  & ( /* mode discriminated */
      | { mode?: "single"; value?: Date;      onValueChange?: (v?: Date) => void }
      | { mode:  "range";  value?: DateRange; onValueChange?: (v?: DateRange) => void; numberOfMonths?: number /* default 2 */ }
    );
```

`mode` discriminates the value type — TypeScript narrows `value` /
`onValueChange` based on whether you pass `mode="range"`. Default is
`"single"`.

## Examples

### A · Single date

```tsx
const [date, setDate] = useState<Date>();
<DatePicker value={date} onValueChange={setDate} />
```

### B · Date range

```tsx
const [range, setRange] = useState<DateRange>();
<DatePicker
  mode="range"
  value={range}
  onValueChange={setRange}
  triggerClassName="w-[300px]"
/>
```

`numberOfMonths` defaults to `2` for range pickers; override if you want a
single month panel.

### C · Dropdown caption (DOB-style)

```tsx
const [date, setDate] = useState<Date>();
<Field>
  <FieldLabel>Date of birth</FieldLabel>
  <DatePicker
    value={date}
    onValueChange={setDate}
    placeholder="Select date"
    defaultMonth={date ?? new Date(2000, 0)}
    captionLayout="dropdown"
    startMonth={new Date(1925, 0)}
    endMonth={new Date()}
  />
</Field>
```

Setting `captionLayout="dropdown"` (or `dropdown-months` / `dropdown-years`)
automatically wires our `Select` into the calendar's caption — no extra
prop, no adapter to import. The triggers display the month/year **labels**
(`Apr` / `2026`), not the underlying numeric values that react-day-picker
hands the dropdown internally. Bracket the year range with `startMonth` /
`endMonth` so the year list isn't infinite.

### D · With presets

```tsx
const today = new Date();
const [date, setDate] = useState<Date>(today);
const [month, setMonth] = useState(today);

const apply = (days: number) => {
  const next = addDays(today, days);
  setDate(next);
  setMonth(next);
};

<DatePicker
  value={date}
  onValueChange={setDate}
  month={month}
  onMonthChange={setMonth}
  beforeCalendar={
    <div className="flex flex-col gap-0.5 border-border max-sm:order-1 max-sm:border-t sm:border-e sm:pe-2">
      {PRESETS.map((p) => (
        <Button
          key={p.label}
          size="sm"
          variant="ghost"
          className="justify-start font-normal"
          onClick={() => apply(p.days)}
        >
          {p.label}
        </Button>
      ))}
    </div>
  }
/>
```

`beforeCalendar` renders to the left of the Calendar (stacking on top on
mobile). Control `month` / `onMonthChange` so the calendar scrolls to the
preset's date, otherwise it stays on whatever month was visible.

### E · Close on select

```tsx
const [date, setDate] = useState<Date>();
<DatePicker value={date} onValueChange={setDate} closeOnSelect />
```

Internally manages the popover's open state. For range mode `closeOnSelect`
waits until **both** `from` and `to` are chosen before closing — picking
just `from` keeps the popover open so you can pick `to` next.

## Pitfalls

- **`mode` is type-discriminated.** `<DatePicker value={someDate}>` is
  inferred as single mode and won't accept a `DateRange`. Pass
  `mode="range"` explicitly to switch — TypeScript will then require the
  `value` to be `DateRange | undefined`.
- **`captionLayout="dropdown"` requires `startMonth` and `endMonth`** for
  any year-spanning use case. Without them the year `Select` is empty.
- **`beforeCalendar` doesn't shift the trigger label.** It only renders
  inside the popup. The trigger button always shows the formatted value
  or placeholder.
- **`defaultMonth` vs `month`.** `defaultMonth` initializes the visible
  month; `month` (with `onMonthChange`) controls it. The presets example
  needs `month` so `apply()` can scroll the calendar to the preset's
  month.
- **`closeOnSelect` for range** does **not** close after just the start
  date — the popover only closes once both ends of the range are picked.
  If you need open-state behavior beyond that, drop `closeOnSelect` and
  control `open` / `onOpenChange` yourself.
- **The trigger is always our `Button`.** If you need a non-Button
  trigger (Input, custom chrome) — compose `Popover` + `Calendar` +
  whatever yourself; this primitive opinionates on the Button trigger.

## Rules of thumb

- **Default (`mode="single"`)** is the right answer for ~80% of cases.
  Reach for `mode="range"` when the value is genuinely a span (booking,
  reporting period, vacation request).
- **Wrap in `<Field>` + `<FieldLabel>`** whenever the picker sits inside
  a form — it inherits the field's id wiring + error attributes via
  `id={...}`.
- **For DOB / historical dates** always use `captionLayout="dropdown"` +
  `startMonth` / `endMonth`. Scrolling year-by-year through a
  no-dropdown calendar is unusable past a few years back.
- **Use `closeOnSelect`** for "set this and move on" patterns (filter
  pickers, single-field forms). Skip it when users are likely to pick
  multiple dates in succession or change their mind.
- **`triggerClassName="w-full"`** when the picker sits inside a form
  field — inherits the field width instead of the default 260px.
- **Pass `formatStr`** when the default `PPP` ("April 26th, 2026") feels
  too long; common alternatives: `"yyyy-MM-dd"` (ISO),
  `"LLL dd, y"` ("Apr 26, 2026"), `"MMM d"` ("Apr 26").

# RadioGroup

Source: [`src/components/ui/radio-group.tsx`](../../src/components/ui/radio-group.tsx).
Built on
[`@base-ui/react/radio-group`](https://base-ui.com/react/components/radio-group)
+ [`@base-ui/react/radio`](https://base-ui.com/react/components/radio).

A round 4.5×4.5 (mobile) / 4×4 (sm+) radio with the same Button design
language as `Checkbox` and `Switch`: subtle bezel + ring when unchecked,
primary fill + bevels + ring + small white dot when checked, focus halo,
dark-mode gradient. Single-selection across a group.

## Parts

- `RadioGroup` — wrapper that manages the selected value. `flex flex-col
  gap-3` baseline.
- `Radio` — a single radio control inside the group. Pass `value` to
  identify it.
- `RadioGroupItem` — alias of `Radio` for shadcn-style API parity.
- `RadioGroupPrimitive` — re-export of `@base-ui/react/radio-group`.
- `RadioPrimitive` — re-export of `@base-ui/react/radio`.

## Scenarios

### 1. Basic — pick one

```tsx
<RadioGroup defaultValue="starter">
  <div className="flex items-center gap-2">
    <Radio value="starter" id="r-starter" />
    <Label htmlFor="r-starter" className="font-normal">Starter</Label>
  </div>
  <div className="flex items-center gap-2">
    <Radio value="pro" id="r-pro" />
    <Label htmlFor="r-pro" className="font-normal">Pro</Label>
  </div>
  <div className="flex items-center gap-2">
    <Radio value="team" id="r-team" />
    <Label htmlFor="r-team" className="font-normal">Team</Label>
  </div>
</RadioGroup>
```

### 2. Controlled

```tsx
const [plan, setPlan] = useState("starter");

<RadioGroup value={plan} onValueChange={setPlan}>
  …
</RadioGroup>
```

### 3. With descriptions (card-style row)

```tsx
<RadioGroup defaultValue="pro" className="gap-2">
  {plans.map((plan) => (
    <Label
      key={plan.id}
      htmlFor={`plan-${plan.id}`}
      className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 has-data-checked:border-ring"
    >
      <Radio value={plan.id} id={`plan-${plan.id}`} className="mt-1" />
      <span className="flex flex-col">
        <span className="font-medium">{plan.name}</span>
        <span className="text-xs text-muted-foreground">{plan.tagline}</span>
      </span>
      <span className="ml-auto font-medium tabular-nums">{plan.price}</span>
    </Label>
  ))}
</RadioGroup>
```

`has-data-checked:border-ring` highlights the row whose radio is
selected. Click anywhere on the label-row to select.

### 4. Disabled item

```tsx
<RadioGroup defaultValue="day">
  <Radio value="day" />
  <Radio value="week" />
  <Radio value="month" disabled />
</RadioGroup>
```

### 5. Inline

```tsx
<RadioGroup defaultValue="day" className="flex flex-row gap-4">
  <Radio value="day" />
  <Radio value="week" />
  <Radio value="month" />
</RadioGroup>
```

The default `flex-col gap-3` becomes `flex-row gap-4` for an inline row.

## Pitfalls

- **Radio without RadioGroup is undefined behavior.** base-ui's Radio
  needs the group's context to coordinate selection. Always wrap.
- **Use `value` on each Radio**, not `name` — the group passes the
  shared name down.
- **`onValueChange` fires the new selected value** (unlike Checkbox's
  `onCheckedChange` which fires per-item). Track one piece of state,
  not an array.
- **For mutually-exclusive options ≤ 4 with short labels, prefer
  `ToggleGroup type="single"`** — the segmented look is easier to scan
  than vertical radios. Switch back to RadioGroup when descriptions
  matter or there are 5+ choices.

## Rules of thumb

- **Use RadioGroup for one-of-N exclusive choices** with text labels
  (plans, billing cycle, sort direction).
- **2–3 short choices** → consider `ToggleGroup` (segmented control)
  instead — it's denser and easier to scan inline.
- **Many choices (6+)** → consider `Select` or `Combobox` —
  RadioGroup's vertical stack starts to feel heavy.
- **Always pair with a `Label`** for each radio.
- **For card-style picker rows** (with prices / descriptions), wrap
  the whole row in a `Label` and use `has-data-checked:` to style the
  selected card.

## Anatomy

```tsx
<RadioGroup>
  <Radio.Root>
    <Radio.Indicator />
  </Radio.Root>
</RadioGroup>
```

Our `Radio` wrapper renders `Radio.Root` + `Radio.Indicator` together
(the inner dot is mounted with `keepMounted` for animation). `RadioGroup`
maps to `RadioGroupPrimitive`.

## API reference

### RadioGroup props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `name` | `string` | — | Form field name (one input is submitted with the selected value). |
| `value` / `defaultValue` | `Value` | — | Controlled / uncontrolled selection. |
| `onValueChange` | `(value, eventDetails) => void` | — | Fires the new value, not an event. |
| `disabled` | `boolean` | `false` | Disables the whole group. |
| `readOnly` | `boolean` | `false` | Allows focus but not selection change. |
| `required` | `boolean` | `false` | Form-validation flag. |
| `form` | `string` | — | Associate with a form rendered elsewhere. |
| `inputRef` | `Ref<HTMLInputElement>` | — | Access the hidden input. |

Group data: `data-disabled` when disabled. Inside `Field.Root` it also
exposes `data-touched`, `data-dirty`, `data-valid`, `data-filled`,
`data-focused`.

### Radio.Root props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` (required) | `Value` | — | Identifier within the group. |
| `disabled` / `readOnly` / `required` | `boolean` | — | Per-item overrides. |
| `nativeButton` | `boolean` | `false` | Set `true` when `render`ing a real `<button>` (e.g. sibling-label pattern). |
| `inputRef` | `Ref<HTMLInputElement>` | — | Access the hidden input. |

Item data: `data-checked` / `data-unchecked`, `data-disabled`,
`data-readonly`, `data-required`. Inside `Field.Root`: also
`data-valid`, `data-invalid`, `data-dirty`, `data-touched`,
`data-filled`, `data-focused`.

### Radio.Indicator

`keepMounted` keeps the dot in the DOM so we can animate
`opacity`/`scale` between states. Carries `data-starting-style` /
`data-ending-style` for entry/exit transitions.

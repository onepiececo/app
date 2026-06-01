# Select

Source: [`src/components/ui/select.tsx`](../../src/components/ui/select.tsx).
Built on [`@base-ui/react/select`](https://base-ui.com/react/components/select).

A native-feeling dropdown picker. Styling lives in one slot-based
`selectVariants` recipe so the trigger, popup, list, item, labels,
separator, and scroll arrows stay coordinated without borrowing another
primitive's styling contract. The popup is anchored to the trigger with
origin-aware scale animation, scroll-up / scroll-down arrows for overflow,
and a check indicator on the right of the selected item.

Use `Select` for **one-of-N** selection from a known list (≤ ~30
options). Reach for `Combobox` when the list is long enough to need
filtering, or when the user might type a value that isn't in the list.

## Parts

- `Select` — the root (alias of `SelectPrimitive.Root`).
- `SelectTrigger` — the styled `<button>` that opens the popup.
  Accepts `size` (`"sm" | "default" | "lg"`).
- `SelectButton` — alternate trigger built on `useRender` for
  composing custom trigger elements (e.g. inside an `InputGroup`).
- `SelectValue` — renders the selected item's text. Use as the
  `<SelectTrigger>`'s child for the default trigger layout.
- `SelectPopup` (alias `SelectContent`) — the dropdown panel. Wraps
  Portal + Positioner + Popup + List. Includes
  `SelectScrollUpArrow` / `SelectScrollDownArrow` for overflow.
- `SelectItem` — a row in the list. Pass `value`. Right-aligned check
  indicator when selected.
- `SelectGroup` + `SelectGroupLabel` — sectioning for long lists.
- `SelectLabel` — accessible label rendered above the trigger.
- `SelectSeparator` — hairline divider between items / groups.
- `SelectPrimitive` — re-export of `@base-ui/react/select` for
  custom compositions.

## Scenarios

### 1. Basic

```tsx
<div className="flex flex-col gap-2">
  <Select defaultValue="starter">
    <SelectLabel id="plan-select-label">Plan</SelectLabel>
    <SelectTrigger aria-labelledby="plan-select-label" className="w-60">
      <SelectValue placeholder="Choose a plan">
        {(value) => (typeof value === "string" ? planLabels[value] : null)}
      </SelectValue>
    </SelectTrigger>
    <SelectPopup>
      <SelectGroup>
        <SelectGroupLabel>Personal</SelectGroupLabel>
        <SelectItem value="starter">Starter, free</SelectItem>
        <SelectItem value="pro">Pro, $12/mo</SelectItem>
      </SelectGroup>
      <SelectSeparator />
      <SelectGroup>
        <SelectGroupLabel>Teams</SelectGroupLabel>
        <SelectItem value="team">Team, $40/mo</SelectItem>
        <SelectItem value="business">Business, $99/mo</SelectItem>
        <SelectItem disabled value="enterprise">Enterprise, custom</SelectItem>
      </SelectGroup>
    </SelectPopup>
  </Select>
</div>
```

When options are rendered as children and the trigger must show a custom
label immediately, pass a render function to `SelectValue` (or use the
primitive's `items` API). Otherwise Base UI may briefly render the raw
value before item text has registered.

### 2. Controlled

```tsx
const [plan, setPlan] = useState("starter");

<Select value={plan} onValueChange={setPlan}>
  <SelectTrigger><SelectValue /></SelectTrigger>
  <SelectPopup>…</SelectPopup>
</Select>
```

### 3. Sizes

```tsx
<SelectTrigger size="sm">…</SelectTrigger>
<SelectTrigger>…</SelectTrigger>           {/* default */}
<SelectTrigger size="lg">…</SelectTrigger>
```

### 4. Placeholder

```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Choose a plan…" />
  </SelectTrigger>
  <SelectPopup>…</SelectPopup>
</Select>
```

`SelectValue` automatically dims the placeholder text via
`data-placeholder:text-muted-foreground`.

### 5. Grouped items

```tsx
<SelectPopup>
  <SelectGroup>
    <SelectGroupLabel>Personal</SelectGroupLabel>
    <SelectItem value="free">Free</SelectItem>
    <SelectItem value="starter">Starter</SelectItem>
  </SelectGroup>
  <SelectSeparator />
  <SelectGroup>
    <SelectGroupLabel>Team</SelectGroupLabel>
    <SelectItem value="team">Team</SelectItem>
    <SelectItem value="enterprise">Enterprise</SelectItem>
  </SelectGroup>
</SelectPopup>
```

### 6. Inside Field (validation)

```tsx
<Field>
  <FieldLabel>Plan</FieldLabel>
  <Select required>
    <SelectTrigger><SelectValue placeholder="Choose…" /></SelectTrigger>
    <SelectPopup>…</SelectPopup>
  </Select>
  <FieldError match="valueMissing">Pick a plan to continue.</FieldError>
</Field>
```

### 7. Custom trigger via `SelectButton`

```tsx
<Select defaultValue="starter">
  <SelectButton render={<Button variant="outline" />}>
    <SelectValue />
  </SelectButton>
  <SelectPopup>…</SelectPopup>
</Select>
```

`SelectButton` adapts to whatever element is passed to `render` —
useful for putting a Select inside an `InputGroup` or styling the
trigger like a real `Button`.

## Pitfalls

- **`alignItemWithTrigger={false}`** is the default in our
  `SelectPopup` — popup opens *below* the trigger, not over the
  selected item like a native macOS select. The native-pop-over-the-
  selected-item pattern doesn't match the rest of our popup family
  (Menu / Combobox / Popover all open below).
- **`SelectItem`'s `value` is required**. Don't omit it expecting
  the children to be the value — base-ui won't infer.
- **For dynamic / SSR-rendered options, pass `items` as data via
  the primitive**:
  ```tsx
  <SelectPrimitive.Root items={options}>…</SelectPrimitive.Root>
  ```
  Children-as-options can hydration-mismatch with mismatched item
  arrays.
- **`onValueChange` fires the value, not an event.** No need to dig
  into `e.target.value`.

## Rules of thumb

- **≤ ~30 options** → `Select`.
- **Long list, user may type / search** → `Combobox`.
- **Mutually-exclusive ≤ 4 short options** → `ToggleGroup type="single"`.
- **Use `defaultValue` + uncontrolled** for read-only forms or when
  the value doesn't need to participate in real-time logic. Use
  `value` + `onValueChange` for forms with cross-field validation.
- **Always pair with `SelectLabel`** above the trigger, or wire an
  external label with `aria-labelledby`.
- **Group + label** when there are 8+ items with natural categories;
  ungrouped lists past 8 items get hard to scan.
- **The trigger is full-width by default; clamp with
  `className="w-56"`** (or similar) when sitting inline next to other
  controls.

## Anatomy

```tsx
<Select.Root>
  <Select.Label />
  <Select.Trigger>
    <Select.Value />
    <Select.Icon />
  </Select.Trigger>
  <Select.Portal>
    <Select.Backdrop />
    <Select.Positioner>
      <Select.Popup>
        <Select.ScrollUpArrow />
        <Select.Arrow />
        <Select.List>
          <Select.Item>
            <Select.ItemText />
            <Select.ItemIndicator />
          </Select.Item>
          <Select.Separator />
          <Select.Group>
            <Select.GroupLabel />
          </Select.Group>
        </Select.List>
        <Select.ScrollDownArrow />
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
```

Our `SelectPopup` wraps `Portal` + `Positioner` + `Popup` + `List` and
includes both scroll arrows. `SelectItem` already renders `ItemText` +
`ItemIndicator`.

## API reference

### Root props (most useful)

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` / `defaultValue` | `Value \| Value[] \| null` | — | Array when `multiple`. |
| `onValueChange` | `(value, eventDetails) => void` | — | Fires the value, not an event. |
| `open` / `defaultOpen` / `onOpenChange` | — | — | Controlled popup. |
| `items` | `Record<string, ReactNode> \| { label, value }[] \| Group[]` | — | **SSR-safe data-driven options.** When set, `Select.Value` renders the matching label automatically. |
| `multiple` | `boolean` | `false` | Multi-select mode. |
| `modal` | `boolean` | `true` | When `true` locks page scroll while open. |
| `disabled` / `readOnly` / `required` | `boolean` | `false` | Form flags. |
| `name` / `form` / `inputRef` | — | — | Hidden input for form submission. |
| `isItemEqualToValue` | `(itemValue, value) => boolean` | `Object.is` | Use when item values are objects. |
| `itemToStringLabel` / `itemToStringValue` | `(itemValue) => string` | — | Object items: how to stringify for display / form value. `{ label, value }` shape is detected automatically. |
| `actionsRef` | `Ref<{ unmount }>` | — | Defer unmount for external animation libs. |

`onOpenChange` reasons include `trigger-press`, `outside-press`,
`escape-key`, `item-press`, `focus-out`, `list-navigation`,
`window-resize`, `cancel-open`.

### Trigger

Renders a `<button>` (`nativeButton` defaults to `true`). Data attrs:
`data-popup-open`, `data-pressed`, `data-placeholder` (when no value),
plus the field set when wrapped in `Field.Root`.

### Value

- `placeholder`: shown when no value is selected.
- `children`: `(value) => ReactNode` for custom display.
- Carries `data-placeholder` — our default styling dims it via
  `data-placeholder:text-muted-foreground`.

### Positioner

| Prop | Default | Notes |
| --- | --- | --- |
| `alignItemWithTrigger` | `true` (base-ui) — **`false` in `SelectPopup`** | We disable the macOS-style overlay so the popup opens *below* the trigger like Menu / Combobox. |
| `side` / `sideOffset` / `align` / `alignOffset` | `bottom` / `0` / `center` / `0` | We default to `side="bottom"`, `sideOffset={4}`, `align="start"`. |
| `anchor` | trigger | Override to anchor against another element. |
| `collisionAvoidance` / `collisionBoundary` / `collisionPadding` | — | Standard floating-ui knobs. |
| `sticky` | `false` | Keep popup visible after anchor scrolls offscreen. |

CSS vars exposed on the positioner: `--anchor-width`,
`--anchor-height`, `--available-height`, `--available-width`,
`--transform-origin`. We use `min-w-(--anchor-width)` and
`max-h-(--available-height)` on the popup, plus
`origin-(--transform-origin)` for the scale animation.

Data attrs: `data-side`, `data-align`, `data-open`, `data-closed`,
`data-anchor-hidden`.

### Popup

Animation hooks: `data-starting-style` (entering) /
`data-ending-style` (leaving). We scale 0.95 → 1 with
`origin-(--transform-origin)`.

### Item

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` (required) | `any` | `null` | Identifier — base-ui won't infer from children. |
| `label` | `string` | — | Override the keyboard-typeahead text. |
| `disabled` | `boolean` | `false` | — |

Item data: `data-selected`, `data-highlighted` (keyboard / pointer
highlight — not the same as CSS `:hover` when
`highlightItemOnHover={false}`), `data-disabled`.

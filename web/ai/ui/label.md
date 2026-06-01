# Label

Source: [`src/components/ui/label.tsx`](../../src/components/ui/label.tsx).

A single styled `<label>` for every form control. `font-medium`,
`text-base/4.5` on mobile (16px / 18px line-height) → `text-sm/4` on
`sm+` (14px / 16px). Inline-flex with `gap-2` so leading icons or
required-asterisks lay out cleanly. Built on `useRender` so it can be
swapped to a `<span>` / `<legend>` / etc. via `render`.

## Parts

- `Label` — the only export. Props are HTML `<label>` props, plus
  `render` for swapping the element.
- `labelVariants` — exported recipe for the label typography and inline
  layout.

## Scenarios

### 1. Standard label + input

```tsx
<div className="flex flex-col gap-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
</div>
```

### 2. Inline with checkbox / switch / radio

```tsx
<div className="flex items-center gap-2">
  <Switch id="notif" />
  <Label htmlFor="notif" className="font-normal">Send notifications</Label>
</div>
```

Override `font-medium` → `font-normal` when the label sits next to a
toggle / checkbox — the toggle is the heavyweight, label is supporting.

### 3. With a required asterisk

```tsx
<Label htmlFor="name">
  Name
  <span aria-hidden className="text-destructive-foreground">*</span>
</Label>
```

The `gap-2` baseline keeps the asterisk visually attached without
needing extra wrapper spans.

### 4. Inside a Field

```tsx
<Field>
  <FieldLabel>Email</FieldLabel>
  <Input type="email" />
</Field>
```

`FieldLabel` uses the same label typography and auto-wires `htmlFor` to
the field's input id. Prefer this inside any structured form.

### 5. As a card-row wrapper (RadioGroup, Checkbox card pattern)

```tsx
<Label htmlFor="plan-pro" className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 has-data-checked:border-ring">
  <Radio value="pro" id="plan-pro" className="mt-1" />
  <span className="flex flex-col">
    <span className="font-medium">Pro</span>
    <span className="text-xs text-muted-foreground">Best for teams of 1–5</span>
  </span>
</Label>
```

The Label becomes the entire click target for a card-style radio /
checkbox row. `has-data-checked:border-ring` highlights the selected
card.

### 6. As a `<legend>` for fieldsets

```tsx
<Fieldset>
  <Label render={<legend />}>Billing details</Label>
  …
</Fieldset>
```

## Pitfalls

- **`htmlFor` is mandatory** for non-wrapping labels (e.g. label is a
  sibling of the input). Without it the click-to-focus / screen-reader
  association is broken.
- **The default font weight is `medium`** to match the design system —
  drop to `font-normal` for inline labels next to checkboxes / radios /
  switches where the control is the heavyweight.
- **Don't nest a Label inside another Label.** The card-row pattern
  uses Label as the wrapper *with* an interactive control inside; that
  works because the Label is the wrapping click target. Two stacked
  Labels for the same input is a markup error.

## Rules of thumb

- **Use Label for every form control** — Input, Select, Combobox,
  RadioGroup items, Checkbox items, Switch, NumberField, Slider.
- **Inside a `Field`, prefer `FieldLabel`** so id wiring is automatic.
- **`font-medium` for stacked labels above inputs**, `font-normal` for
  inline labels next to toggles.
- **Click target matters.** Wrap small controls (checkbox, switch,
  radio) in a Label so the user can click anywhere on the row.

# Input

Source: [`src/components/ui/input.tsx`](../../src/components/ui/input.tsx).
Base UI primitive: [Input](https://base-ui.com/react/components/input).

Text inputs with a shared-surface design system: plain `Input`,
`InputGroup` (for leading/trailing addons, inline prefixes, inline
menus, keyboard shortcuts), and exported variant recipes
(`inputSurfaceVariants`, `inputInnerVariants`, `inputGroupVariants`) so any custom
input-shaped layout — inset label, overlapping-label fieldset, etc. —
can share the exact same chrome.

The surface is intentionally quieter than secondary buttons: white in
light mode, subtle white-on-dark in dark mode, a shadow-based 1px ring,
and shared focus / invalid / disabled chrome. Input sits in the same
control family as Select trigger, Combobox, and Textarea without reading
as a button.

`inputSurfaceVariants` is the **shared recipe** powering Input,
Textarea, Select trigger, Combobox chip — anything input-shaped.
Reuse it for new input-shaped surfaces; don't hand-roll the chrome.

## Anatomy

Base UI's `Input` is a single part — a native `<input>` wired into
`Field`. Project wrappers compose extras around it:

- `Input` → `@base-ui/react/input` (single part)
- `InputGroup` → project wrapper `<div>` owning the surface
- `InputGroupAddon` → project addon slot (`inline-start` / `inline-end` / `block-start` / `block-end`)
- `InputGroupText` → project muted prefix/suffix `<span>`

## Parts

- `Input` — root control. Takes `size` (`sm` / `default` / `lg` /
  `number`), `unstyled` (strip the wrapper chrome — use when nested
  inside an `InputGroup` or similar), `nativeInput` (render raw
  `<input>` instead of `InputPrimitive` — required when passed via
  `render` to an Autocomplete / Combobox primitive).
- `InputGroup` — wrapper for composed layouts. Owns the border / focus
  chrome; inner controls use `<Input unstyled />`.
- `InputGroupAddon` — positioned slot inside a group. `align` picks the
  edge (`inline-start` / `inline-end` / `block-start` / `block-end`).
- `InputGroupText` — muted inline text (e.g. `https://`, `$`, `USD`).
- `inputSurfaceVariants(…)` — exported `tailwind-variants` recipe returning the shared surface
  classes. `layout: "inline" | "block"`. Consume this when building a
  custom input-shaped layout that needs the same focus/invalid/disabled
  chrome as everything else.
- `inputInnerVariants(…)` — exported recipe for the inner `<input>`
  element itself (height, horizontal padding, placeholder color).
  `size: "sm" | "default" | "lg"`.
- `inputGroupVariants(…)` — exported slot recipe for InputGroup `root`,
  `addon`, and `text` parts. `align` applies to the addon slot.
- `InputPrimitive` — re-export of `@base-ui/react/input`.

## API reference

`Input` props (base-ui forwards):

- `value` / `defaultValue: string | number | string[]`
- `onValueChange: (value: string, eventDetails) => void` — controlled
  callback. Auto-format here, not on inner `<input>`.
- `disabled` / `readOnly` / `required`, plus all native `<input>` attrs.
- `render: ReactElement | (props, state) => ReactElement` — custom element.
- `className` is a string applied to the outer control wrapper. Use
  `InputPrimitive` directly when you need Base UI state-function
  `className` on the native input.
- `style` forwards to the inner Base UI input.

Key data attributes (set by `Field` and surfaced on the input):

- `data-disabled` — control is disabled.
- `data-valid` / `data-invalid` — Field validation state.
- `data-dirty` — value has changed from initial.
- `data-touched` — user has interacted (blur fired).
- `data-filled` — has a non-empty value.
- `data-focused` — currently focused.

`inputSurfaceVariants` reads these via Tailwind selectors so focus,
invalid, and disabled chrome happen automatically when Field is in play.

## Scenarios

Patterns below all live on `/test` as visual references.

### 1. Label + input (Field wiring)

`Input` integrates with `Field` automatically — label-for wiring,
description/error IDs, state data-attrs all flow through. See
[`field.md`](./field.md) for the Field API.

```tsx
<Field>
  <FieldLabel>Email</FieldLabel>
  <Input type="email" placeholder="kyle@template.com" />
</Field>
```

### 2. Help text

```tsx
<Field>
  <FieldLabel>Email</FieldLabel>
  <Input type="email" placeholder="kyle@template.com" />
  <FieldDescription>We'll only use this for spam.</FieldDescription>
</Field>
```

### 3. Validation error

```tsx
<Field>
  <FieldLabel>Email</FieldLabel>
  <Input
    type="email"
    defaultValue="kylegrahammatzen"
    aria-invalid="true"
    aria-describedby="email-error"
  />
  <p id="email-error" className="text-xs text-destructive-foreground">
    Not a valid email address.
  </p>
</Field>
```

For real form validation flows, drive `aria-invalid` from Field's
`validate` prop — see [`field.md`](./field.md).

### 4. Disabled

```tsx
<Input type="email" disabled defaultValue="kyle@template.com" />
```

### 5. Hidden label (aria-label only)

Accessible without a visible `<label>`. Use for search inputs, toolbars,
etc. Don't use if a visible label would fit.

```tsx
<Input type="email" aria-label="Email" placeholder="kyle@template.com" />
```

### 6. Corner hint

```tsx
<Field>
  <div className="flex w-full items-center justify-between">
    <FieldLabel>Email</FieldLabel>
    <span className="text-xs text-muted-foreground">Optional</span>
  </div>
  <Input type="email" placeholder="kyle@template.com" />
</Field>
```

### 7. Leading / trailing icon

```tsx
<InputGroup>
  <InputGroupAddon align="inline-start">
    <MailIcon />
  </InputGroupAddon>
  <Input unstyled type="email" placeholder="kyle@template.com" />
</InputGroup>
```

For trailing icon + tooltip, wrap the trigger button in a `<span>` so
the addon's `has-[>button]:-me-2` rule (which pulls external buttons
flush with the edge) doesn't kick in for icon triggers:

```tsx
<InputGroupAddon align="inline-end">
  <span className="inline-flex">
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label="Account number format"
            className="inline-flex cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <HelpCircleIcon className="size-4" />
          </button>
        }
      />
      <TooltipPopup>Enter your 9-digit account number</TooltipPopup>
    </Tooltip>
  </span>
</InputGroupAddon>
```

### 8. Inline prefix / suffix

`InputGroupText` is muted neutral text; drop it in an
`InputGroupAddon` for prefixes like `https://`, `$`, `USD`.

```tsx
{/* Prefix */}
<InputGroup>
  <InputGroupAddon align="inline-start">
    <InputGroupText>https://</InputGroupText>
  </InputGroupAddon>
  <Input unstyled placeholder="template.com" />
</InputGroup>

{/* Prefix + suffix */}
<InputGroup>
  <InputGroupAddon align="inline-start"><InputGroupText>$</InputGroupText></InputGroupAddon>
  <Input unstyled placeholder="0.00" />
  <InputGroupAddon align="inline-end"><InputGroupText>USD</InputGroupText></InputGroupAddon>
</InputGroup>
```

### 9. Inline menu

Inline `Select` inside an addon. Pass `align="start"` when the menu is
leading (country code) and `align="end"` when trailing (currency) so
the popup anchors to the correct edge.

```tsx
<InputGroup>
  <InputGroupAddon align="inline-start">
    <InlineSelect value="US" options={["US", "CA", "EU"]} align="start" />
  </InputGroupAddon>
  <Input unstyled placeholder="123-456-7890" />
</InputGroup>
```

The `InlineSelect` helper strips the default Select trigger chrome so
the surrounding InputGroup owns the border/focus ring. Keep that helper
near the consumer or promote it to a small local component; `/test` is
only a scratchpad and should not be treated as source documentation.

### 10. Keyboard shortcut

```tsx
<InputGroup>
  <InputGroupAddon align="inline-start"><SearchIcon /></InputGroupAddon>
  <Input unstyled placeholder="Search…" />
  <InputGroupAddon align="inline-end"><Kbd>⌘K</Kbd></InputGroupAddon>
</InputGroup>
```

### 11. External prefix (shared border)

Separate tile for the prefix with a distinct background. `InputGroup`
still owns the outer border; the addon gets `bg-muted/40` for visual
separation.

```tsx
<InputGroup>
  <InputGroupAddon align="inline-start" className="bg-muted/40">
    <InputGroupText>https://</InputGroupText>
  </InputGroupAddon>
  <Input unstyled placeholder="template.com" />
</InputGroup>
```

### 12. Input + trailing button (shared border)

Two sibling elements sharing a border via `-me-px` + `focus-within:z-10`
on an `isolate` stacking context (Tailwind v4 shared-border pattern).
Button can be any variant — `secondary` is the canonical pairing since
it uses the same tinted palette as Input.

```tsx
<div className="flex w-full isolate">
  <InputGroup className="-me-px rounded-e-none focus-within:z-10">
    <InputGroupAddon align="inline-start"><UsersIcon /></InputGroupAddon>
    <Input unstyled placeholder="Nathan" />
  </InputGroup>
  <Button variant="secondary" className="shrink-0 rounded-s-none">
    Sort
  </Button>
</div>
```

### 13. Shared borders (stacked fields)

Multi-field group (e.g. card number / MM-YY / CVC) with merged edges.
`isolate` + `-space-y-px` / `-space-x-px` collapses borders;
`focus-within:z-10` raises the focused field above its neighbours.

```tsx
<fieldset className="flex flex-col gap-2">
  <legend className="mb-1 text-sm font-medium text-foreground">
    Card details
  </legend>
  <div className="isolate flex flex-col -space-y-px">
    <Input aria-label="Card number" placeholder="Card number" className="rounded-b-none focus-within:z-10" />
    <div className="flex -space-x-px">
      <Input
        aria-label="Expiration date"
        placeholder="MM/YY"
        value={expiration}
        onValueChange={(v) => setExpiration(formatCardExpiration(v))}
        inputMode="numeric"
        autoComplete="cc-exp"
        maxLength={5}
        className="flex-1 rounded-t-none rounded-br-none focus-within:z-10"
      />
      <Input
        aria-label="CVC"
        placeholder="CVC"
        inputMode="numeric"
        autoComplete="cc-csc"
        maxLength={4}
        className="flex-1 rounded-t-none rounded-bl-none focus-within:z-10"
      />
    </div>
  </div>
</fieldset>
```

Auto-formatting MM/YY — the placeholder shows `MM/YY`; as the user types
the slash auto-appends after the month and the value is normalised to
`MM/YY`:

```ts
function formatCardExpiration(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length === 0) return "";
  if (digits.length === 1) return digits;
  if (digits.length === 2) return `${digits}/`;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}
```

### 14. Inset label

Label sits inside the bordered box above the input. Use `InputPrimitive`
+ `inputSurfaceVariants({ layout: "block" })` — the wrapper owns the
chrome, the primitive gets stripped-down padding so the placeholder
aligns with the label.

```tsx
<label
  className={cn(
    inputSurfaceVariants({ layout: "block" }),
    "px-3 pt-1.5 pb-1.5 focus-within:z-10",
  )}
>
  <span className="block text-xs font-medium text-foreground">Name</span>
  <InputPrimitive
    placeholder="Kyle Matzen"
    className="block w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/72"
  />
</label>
```

Stack multiple inset labels with `isolate -space-y-px` + rounding
overrides (`rounded-b-none` on the top row, `rounded-t-none` on the
bottom), and `focus-within:z-10` to raise the focused row.

### 15. Overlapping label

Native `<fieldset>` + `<legend>` — the browser handles the notch where
the legend overlaps the top border.

```tsx
<fieldset
  className={cn(
    inputSurfaceVariants({ layout: "block" }),
    "px-3 pt-0 pb-2",
  )}
>
  <legend className="px-1 text-xs font-medium text-foreground">
    Name
  </legend>
  <InputPrimitive
    placeholder="Kyle Matzen"
    className="block w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/72"
  />
</fieldset>
```

### 16. Error with trailing icon

```tsx
<Field>
  <FieldLabel>Email</FieldLabel>
  <InputGroup>
    <Input
      unstyled
      type="email"
      defaultValue="kylegrahammatzen"
      aria-invalid="true"
      aria-describedby="email-err"
      className="text-destructive-foreground placeholder:text-destructive-foreground/64"
    />
    <InputGroupAddon align="inline-end">
      <CircleAlertIcon className="text-destructive-foreground" />
    </InputGroupAddon>
  </InputGroup>
  <p id="email-err" className="text-xs text-destructive-foreground">
    Not a valid email address.
  </p>
</Field>
```

The group's surface auto-tints red when any descendant input has
`aria-invalid` — the dual `has-[input[aria-invalid]]` / self
`aria-invalid` selectors in `inputSurfaceVariants` cover both cases.

## `inputSurfaceVariants` — reuse for any input-shaped surface

The variant takes one option — `layout: "inline" | "block"`. Both
selectors forms (wrapper-with-input-inside AND button-as-control) are
baked in, so the same class works for:

- Input / InputGroup / Textarea wrappers (uses
  `has-[input:focus-visible,textarea:focus-visible]:`)
- Select trigger / Combobox chips (uses `focus-visible:` /
  `data-pressed:` on self)
- Custom inset-label / overlapping-label layouts (block layout)

Adding a new input-shaped control? Wrap in a div with
`inputSurfaceVariants({ layout: "inline" })` and you're done.

## Rules of thumb

- **Always put `Input` inside `Field` when it has a label or
  description.** Field auto-wires label-for, aria-describedby,
  validation IDs. Only skip Field for genuinely label-less cases
  (search bars inside toolbars, etc.) where you supply `aria-label`.
- **Use `<Input unstyled />` inside `InputGroup`** — never double-wrap
  chrome. The group owns the border and focus ring; the control stays
  transparent.
- **`nativeInput` for Autocomplete / Combobox `render` props.** Those
  primitives wrap the rendered element; passing `InputPrimitive`
  double-wraps and breaks the control.
- **`isolate` on any shared-border container.** Needed for
  `focus-within:z-10` to raise the focused field above neighbours — the
  shared-border trick relies on stacking contexts.
- **Don't hardcode the Input's shadow / colors in a one-off wrapper.**
  Use `inputSurfaceVariants` so custom layouts get focus / invalid /
  disabled states for free.
- **Auto-format at the `onValueChange` boundary**, not in the inner
  `<input>`. The formatter is a pure function of current value → new
  value; React owns the state.

# Fieldset

Source: [`src/components/ui/fieldset.tsx`](../../src/components/ui/fieldset.tsx).
Base UI primitive: [Fieldset](https://base-ui.com/react/components/fieldset).

## Anatomy

```tsx
<Fieldset>             {/* Fieldset.Root — renders <fieldset> */}
  <FieldsetLegend />   {/* Fieldset.Legend — renders <div> styled as legend */}
  {/* Fields, Switches, etc. */}
</Fieldset>
```

A semantic `<fieldset>` wrapper with a Base UI legend part for grouping
related form `Field`s under one heading. The legend is `font-semibold
text-foreground`; the fieldset itself is unstyled (no border, no
padding) so you control the layout with the parent's flex/grid.

Legend styling is exposed through the exported `fieldsetVariants` slot
recipe. The root is intentionally unstyled; pass `className` directly to
`Fieldset` for spacing or layout.

Use `Fieldset` whenever a form has more than one logical group of
inputs (account info + billing info, profile + security, etc.).
The native `<fieldset>` element gives screen readers proper
grouping semantics — `Field`s inside become "the X group / the Y
group" instead of an undifferentiated list.

## Parts

- `Fieldset` — root `<fieldset>`. Pass children inside.
- `FieldsetLegend` — legend part heading. `font-semibold text-foreground`.
- `FieldsetPrimitive` — re-export of `@base-ui/react/fieldset`.
- `fieldsetVariants` — exported `tailwind-variants` recipe with the `legend` slot.

## Scenarios

### 1. Two fieldsets in one form

```tsx
<Form>
  <Fieldset>
    <FieldsetLegend>Account</FieldsetLegend>
    <div className="mt-4 flex flex-col gap-4">
      <Field>
        <FieldLabel>Email</FieldLabel>
        <Input type="email" />
      </Field>
      <Field>
        <FieldLabel>Password</FieldLabel>
        <Input type="password" />
      </Field>
    </div>
  </Fieldset>

  <Fieldset className="mt-8">
    <FieldsetLegend>Billing</FieldsetLegend>
    <div className="mt-4 flex flex-col gap-4">
      <Field>
        <FieldLabel>Card number</FieldLabel>
        <Input />
      </Field>
      <Field>
        <FieldLabel>Billing zip</FieldLabel>
        <Input />
      </Field>
    </div>
  </Fieldset>
</Form>
```

### 2. With a description below the legend

```tsx
<Fieldset>
  <FieldsetLegend>Notifications</FieldsetLegend>
  <p className="mt-1 text-sm text-muted-foreground">
    Choose how you'd like to hear from us.
  </p>
  <div className="mt-4 flex flex-col gap-3">
    <label className="flex items-center justify-between gap-3 text-sm">
      <span>Marketing emails</span>
      <Switch defaultChecked />
    </label>
    <label className="flex items-center justify-between gap-3 text-sm">
      <span>Security alerts</span>
      <Switch />
    </label>
  </div>
</Fieldset>
```

### 3. Disabled (entire group disabled at once)

```tsx
<Fieldset disabled>
  <FieldsetLegend>Read-only profile</FieldsetLegend>
  <div className="mt-4 flex flex-col gap-4">
    <Field>
      <FieldLabel>Name</FieldLabel>
      <Input defaultValue="Kyle" />
    </Field>
    <Field>
      <FieldLabel>Handle</FieldLabel>
      <Input defaultValue="@kyle" />
    </Field>
  </div>
</Fieldset>
```

Native `<fieldset disabled>` cascades to all inputs — every
`Field` inside automatically picks up the disabled state.

## Pitfalls

- **`<fieldset>` has weird default styling** in some browsers (a
  border + padding). Our wrapper resets that — but if you nest a
  raw `<fieldset>` inside, you'll get the browser default unless
  you reset.
- **`<legend>` doesn't participate in flex/grid layout** in older
  browsers. Wrap the legend's siblings in a separate `<div>` (as
  in the scenarios above) instead of trying to use the fieldset
  itself as a flex container.
- **Don't nest fieldsets**. Native semantics get confused, and
  screen readers announce "group within group" awkwardly.
- **Use `Field` for individual input wiring**, `Fieldset` for
  grouping multiple Fields. They serve different purposes —
  Field wires label/description/error to one input, Fieldset
  groups several Fields under one heading.

## Rules of thumb

- **More than 4 Fields in a form** → split into Fieldsets. The
  legend headings give the form structure.
- **Fewer than 4 Fields** → skip Fieldset, just stack Fields. A
  bare 2-field login form doesn't need grouping ceremony.
- **Settings pages** → one Fieldset per section (Account, Billing,
  Notifications, Danger Zone). Legend headings = section titles.
- **Wizard / multi-step forms** → one Fieldset per step.

## API reference

### `Fieldset` (Fieldset.Root)
- Renders `<fieldset>`. `disabled?: boolean` cascades to all native inputs inside.
- `className` / `style` accept `(state) => …` callback receiving `{ disabled }`.
- `render?` for custom element composition.

### `FieldsetLegend` (Fieldset.Legend)
- Accessible label auto-associated with the fieldset. Renders a `<div>` (not native `<legend>`) so flex/grid layouts behave predictably.
- `className` / `style` accept `(state) => …` callback receiving `{ disabled }`.
- `render?` for custom element composition.

No data-attributes beyond `[data-disabled]` on both parts when the
fieldset is disabled.

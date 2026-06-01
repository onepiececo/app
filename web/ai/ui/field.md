# Field

Source: [`src/components/ui/field.tsx`](../../src/components/ui/field.tsx).
Base UI primitive: [Field](https://base-ui.com/react/components/field).

## Anatomy

```tsx
<Field>                {/* Field.Root — flex column, gap-2 */}
  <FieldLabel />       {/* Field.Label — auto htmlFor */}
  <Input />            {/* any base-ui control, or FieldControl render={...} */}
  <FieldDescription /> {/* Field.Description — auto aria-describedby */}
  <FieldError />       {/* Field.Error — gated by `match` */}
  <FieldItem />        {/* Field.Item — wrap individual checkbox/radio rows */}
</Field>
```

`FieldValidity` (Field.Validity) is a render-prop component: receives the
current `ValidityState` + value for custom validity UIs.

The styled anatomy is exposed as `fieldVariants`, a slot-based
tailwind-variants recipe with `root`, `label`, `item`, `description`, and
`error` slots.

Form-field wiring primitive. Groups a label, control, description, and
error into one unit and handles the boring but critical accessibility
plumbing (`htmlFor`, `aria-describedby`, `aria-invalid`,
validation-driven state) automatically.

Every labeled input in this repo should live inside a `Field`.

## Parts

- `Field` — root. Renders a `<div>`. Takes `validate` (sync or async
  function returning `string | string[] | null`), `validationMode`
  (`"onSubmit"` default / `"onBlur"` / `"onChange"`), and a `name`
  prop that flows down to the control.
- `FieldLabel` — `<label>` auto-associated with the control inside.
  Picks up `data-disabled` from the field state.
- `FieldDescription` — muted help text (`<p>`). Automatically wired via
  `aria-describedby` on the control.
- `FieldError` — validation error output (`<div>`). Uses a `match`
  prop to gate visibility:
  - `match="valueMissing"` / `"patternMismatch"` / `"customError"` /
    etc. — any native `ValidityState` key
  - `match={true}` — always visible (useful for showing a custom
    message that's already been resolved)
  - `match={false}` / omit — hidden unless the associated
    `ValidityState` key is true
- `FieldItem` — wrapper for grouped controls (checkbox groups, radio
  groups). Renders a `<div>`.
- `FieldControl` — re-export of `FieldPrimitive.Control`. Used when you
  want Field's auto-wiring but don't have a ready-made `Input` /
  `Select` / `Checkbox` to drop in; accepts a `render` prop.
- `FieldValidity` — re-export of the render-prop component; yields the
  current `ValidityState` and value for custom validity UIs.
- `fieldVariants` — exported slot recipe for composing the same styles in
  adjacent primitives or docs examples.
- `FieldPrimitive` — re-export of `@base-ui/react/field`.

## Composition

Field.Root's children are position-free — label above, description
below, error in either position — all work. The control can be a
base-ui component (Input, Checkbox, Select, Switch, Radio, etc.) OR a
raw `FieldControl` with a `render` prop. base-ui components
auto-register with Field; raw `<input>` elements don't.

```tsx
<Field>
  <FieldLabel>Email</FieldLabel>
  <Input type="email" required placeholder="you@example.com" />
  <FieldDescription>We'll email verification links here.</FieldDescription>
</Field>
```

## Scenarios

### 1. Required field, native validation

```tsx
<Field>
  <FieldLabel>Email</FieldLabel>
  <Input type="email" required />
  <FieldError match="valueMissing">Email is required.</FieldError>
  <FieldError match="typeMismatch">That doesn't look like an email.</FieldError>
</Field>
```

`match` keys map directly to the native `ValidityState` —
`valueMissing`, `typeMismatch`, `patternMismatch`, `rangeUnderflow`,
`rangeOverflow`, `tooLong`, `tooShort`, `stepMismatch`, `badInput`,
`customError`.

### 2. Custom validation (sync)

```tsx
<Field
  validate={(value) => {
    if (typeof value !== "string") return null;
    if (value.trim().length < 3) return "Must be at least 3 characters.";
    return null;
  }}
>
  <FieldLabel>Username</FieldLabel>
  <Input />
  <FieldError />  {/* no match — shows the returned string as-is */}
</Field>
```

### 3. Custom validation (async)

```tsx
<Field
  validate={async (value) => {
    if (typeof value !== "string") return null;
    const res = await fetch(`/api/handles/${encodeURIComponent(value)}`);
    if (res.status === 409) return "That handle is taken.";
    return null;
  }}
>
  <FieldLabel>Handle</FieldLabel>
  <Input />
  <FieldError />
</Field>
```

Async validation **does not block submit** by default — base-ui's docs
call this out. Pair with server-side re-validation or an
`onSubmit`-driven controlled state for submit gating.

### 4. Validation mode

Default mode is `"onSubmit"` (validate at submit, then re-validate on
change). Pick a different mode if the UX calls for it:

```tsx
<Field validationMode="onBlur" validate={...}>…</Field>
<Field validationMode="onChange" validate={...}>…</Field>
```

`"onBlur"` is the usual right default for username / email fields —
gives the user space to type without nagging, then validates when they
move on.

### 5. Description + error

Both can coexist; `aria-describedby` points at description while
`aria-invalid` + the Error region carry the error.

```tsx
<Field required>
  <FieldLabel>Password</FieldLabel>
  <Input type="password" minLength={8} />
  <FieldDescription>At least 8 characters.</FieldDescription>
  <FieldError match="tooShort">Must be at least 8 characters.</FieldError>
  <FieldError match="valueMissing">Password is required.</FieldError>
</Field>
```

### 6. Group of controls (checkbox / radio)

Use `FieldItem` inside a `CheckboxGroup` / `RadioGroup` so each
checkable child gets its own label association:

```tsx
<Field>
  <FieldLabel>Notifications</FieldLabel>
  <CheckboxGroup>
    <FieldItem>
      <Checkbox name="email" />
      <FieldLabel>Email</FieldLabel>
    </FieldItem>
    <FieldItem>
      <Checkbox name="push" />
      <FieldLabel>Push</FieldLabel>
    </FieldItem>
  </CheckboxGroup>
</Field>
```

### 7. Hidden label

If the field is visually label-less (toolbar search, inline filter),
*don't skip Field* — keep the wrapper and use `sr-only` on the label so
screen readers still get the text. The last-resort fallback is a raw
`Input` with `aria-label`, but that disables Field's wiring.

```tsx
<Field>
  <FieldLabel className="sr-only">Search</FieldLabel>
  <Input type="search" placeholder="Search…" />
</Field>
```

### 8. Rendering a non-base-ui control

If you need Field's auto-wiring with a custom control (third-party
input, canvas-backed editor, etc.), use `FieldControl` with `render`:

```tsx
<Field>
  <FieldLabel>Color</FieldLabel>
  <FieldControl render={<HexColorInput />} />
  <FieldError match="customError">Invalid hex color.</FieldError>
</Field>
```

## State attributes

All base-ui parts inside Field receive the same state, exposed both as
data-attrs on the DOM and via the state callback on `className` /
`style`:

| Attr | Meaning |
| --- | --- |
| `data-disabled` | Field is disabled |
| `data-valid` | Passes validation |
| `data-invalid` | Fails validation |
| `data-touched` | User has interacted with the control |
| `data-dirty` | Value differs from initial |
| `data-filled` | Value is non-empty |
| `data-focused` | Control is focused |

The Input surface's `aria-invalid` styling (red ring) reads from the
*native* `aria-invalid`, which base-ui mirrors from `data-invalid`
automatically. So validation → red ring → error message is one chain,
no manual wiring.

## Rules of thumb

- **Every labeled input uses Field.** One rule, no exceptions. Even for
  simple one-field forms — the cost is nothing and the a11y dividend
  is always positive.
- **Pick a `validationMode` per field, not per form.** Email and
  username are `onBlur`; password is `onSubmit`; live filters are
  `onChange`.
- **Multiple `<FieldError match="...">` siblings > a switch statement.**
  Base-ui only renders the one whose match key is currently failing.
- **`FieldError` without `match`** is the catch-all; it shows whatever
  the `validate` function returned.
- **Async validation is best-effort.** It won't block submit, so always
  re-validate server-side.
- **Don't put raw `<input>` inside Field** — it won't register with
  Field's context and you lose all the wiring. Use our `Input` (base-ui)
  or `FieldControl render={...}`.

## API reference

### `Field` (Field.Root)
- `name?: string` — flows down to the control for form submission.
- `validate?: (value, formValues) => string | string[] | null | Promise<…>` — custom validation.
- `validationMode?: "onSubmit" | "onBlur" | "onChange"` (default `"onSubmit"`).
- `validationDebounceTime?: number` — debounce ms for `onChange` mode.
- `disabled?: boolean` (default `false`).
- `dirty?` / `touched?` / `invalid?` — controlled state overrides.
- `actionsRef?: { current: { validate(): void } }` — imperative validate.

### `FieldLabel` (Field.Label)
- Renders `<label>` (or via `nativeLabel={false}` a non-label element with `aria-labelledby`).

### `FieldControl` (Field.Control)
- `defaultValue?` / `onValueChange?` — when controlling a raw control via `render`.
- Use only when you don't have a base-ui control to drop in.

### `FieldDescription` (Field.Description)
Renders `<p>`. Auto-wired to control via `aria-describedby`.

### `FieldError` (Field.Error)
- `match?: boolean | keyof ValidityState | ((state, value) => boolean)` — gates visibility. Native keys: `valueMissing`, `typeMismatch`, `patternMismatch`, `rangeUnderflow`, `rangeOverflow`, `tooLong`, `tooShort`, `stepMismatch`, `badInput`, `customError`. Omit `match` for catch-all (renders the validate-returned string).
- Data adds `[data-starting-style]` / `[data-ending-style]` for enter/exit transitions.

### `FieldItem` (Field.Item)
- `disabled?: boolean` — wraps a checkbox / radio row so each checkable child gets its own label association.

### `FieldValidity` (Field.Validity)
- `children: (state: { validity: ValidityState; value: unknown; …}) => ReactNode` — render-prop for custom validity output.

### Data attributes
All Field parts (and base-ui controls inside) carry: `[data-disabled]`,
`[data-valid]`, `[data-invalid]`, `[data-touched]`, `[data-dirty]`,
`[data-filled]`, `[data-focused]`. See the State attributes table above
for usage.

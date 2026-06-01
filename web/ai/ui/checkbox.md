# Checkbox

Source: [`src/components/ui/checkbox.tsx`](../../src/components/ui/checkbox.tsx).
Built on [`@base-ui/react/checkbox`](https://base-ui.com/react/components/checkbox)
+ [`@base-ui/react/checkbox-group`](https://base-ui.com/react/components/checkbox-group).

A 4.5×4.5 (mobile) / 4×4 (sm+) checkbox with the same Button design
language as `Radio` and `Switch`: subtle bezel + ring when unchecked,
primary fill + bevels + ring when checked, focus halo, dark-mode
gradient. Indeterminate state renders a horizontal bar instead of the
checkmark. `CheckboxGroup` lives in the same file for grouping multiple
checkboxes with a shared name / value.

## Anatomy

Checkbox: two parts. The project flattens both into a single `Checkbox`
component — the indicator is rendered (and `keepMounted`) internally and
swaps Lucide `CheckIcon` / `MinusIcon` based on `state.indeterminate`.
Styling is centralized in the exported slot recipe `checkboxVariants` with
`root`, `indicator`, `icon`, and `group` slots.

| Base UI | Project wrapper | Notes |
| --- | --- | --- |
| `Checkbox.Root` | `Checkbox` | The box + ring + bevel chrome. |
| `Checkbox.Indicator` | (internal, `keepMounted`) | Renders the Lucide check / horizontal bar. |
| `CheckboxGroup` | `CheckboxGroup` | Controlled multi-value wrapper (`value`, `onValueChange`, `allValues`). |

## Parts

- `Checkbox` — the control. Renders the box, the indicator (checkmark
  or indeterminate bar), all states.
- `CheckboxGroup` — wrapper for managing several checkboxes as one
  controlled value. `flex flex-col items-start gap-3` baseline.
- `checkboxVariants` — exported `tailwind-variants` slot recipe for the
  root, internal indicator/icon, and group wrapper styles.
- `CheckboxPrimitive` — re-export of `@base-ui/react/checkbox`.
- `CheckboxGroupPrimitive` — re-export of `@base-ui/react/checkbox-group`.

## API reference

### Checkbox (Root) props

| Prop | Type | Description |
| --- | --- | --- |
| `checked` | `boolean \| "indeterminate"` | Controlled value. Pass the literal `"indeterminate"` for the bar state. |
| `defaultChecked` | `boolean` | Uncontrolled initial value. |
| `onCheckedChange` | `(checked: boolean \| "indeterminate", details) => void` | Fires on toggle. |
| `indeterminate` | `boolean` | Force the mixed state independently of `checked`. |
| `name` | `string` | Form field name. Inside a `CheckboxGroup`, also acts as the group's value key. |
| `value` | `string` | Submitted value when checked. |
| `uncheckedValue` | `string` | Submitted value when unchecked. |
| `parent` | `boolean` | Marks this as the parent of a `CheckboxGroup` (toggles all children, derives indeterminate from them). |
| `disabled` / `readOnly` / `required` | `boolean` | Standard form flags. |
| `inputRef` | `Ref<HTMLInputElement>` | Access the hidden form input. |
| `render` | `ReactElement \| (props, state) => ReactElement` | Swap the underlying element. |

### Checkbox.Indicator props

| Prop | Type | Description |
| --- | --- | --- |
| `keepMounted` | `boolean` | Keep in DOM when unchecked (the project's wrapper sets this so transitions work both ways). |
| `render` | `ReactElement \| (props, state) => ReactElement` | Receives `state.indeterminate` — used to swap the icon. |

### CheckboxGroup props

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `string[]` | Controlled list of checked `name`s. |
| `defaultValue` | `string[]` | Uncontrolled initial list. |
| `onValueChange` | `(value: string[], details) => void` | Fires when any child toggles. |
| `allValues` | `string[]` | Required when using a `parent` checkbox — lists every child name so parent can compute all-on / all-off / indeterminate. |
| `disabled` | `boolean` | Cascades to all children. |

### Data attributes (on Root and Indicator)

`data-checked`, `data-unchecked`, `data-indeterminate`, `data-disabled`,
`data-readonly`, `data-required`, `data-valid`, `data-invalid`,
`data-dirty`, `data-touched`, `data-filled`, `data-focused`. The project
chrome keys off `data-checked` / `data-indeterminate` / `aria-invalid`
for the primary fill, ring, and invalid states. Indicator additionally
exposes `data-starting-style` / `data-ending-style` for enter/exit
animation hooks.

### When to reach for CheckboxGroup

- Multiple checkboxes whose values feed into one form field as an array.
- Parent/children patterns (Select-all toggling many leaf rows). Pass
  `parent` to the parent checkbox and `allValues` to the group.
- Independent yes/no checkboxes don't need a group — just use
  individual `Checkbox`es with their own `checked`/`onCheckedChange`.

## Scenarios

### 1. Standalone

```tsx
<div className="flex items-center gap-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms" className="font-normal">I agree to the terms</Label>
</div>
```

### 2. Default-checked + disabled

```tsx
<Checkbox defaultChecked />
<Checkbox defaultChecked disabled />
```

### 3. Controlled

```tsx
const [checked, setChecked] = useState(false);

<Checkbox checked={checked} onCheckedChange={setChecked} />
```

### 4. Indeterminate (parent toggling many children)

```tsx
<Checkbox checked={someChecked && !allChecked ? "indeterminate" : allChecked} onCheckedChange={…} />
```

The component swaps the checkmark SVG for a horizontal bar when the
state is `"indeterminate"`.

### 5. Group

```tsx
const [permissions, setPermissions] = useState<string[]>(["read"]);

<CheckboxGroup value={permissions} onValueChange={setPermissions} aria-label="Permissions">
  <label className="flex items-center gap-2"><Checkbox name="permissions" value="read" /> Read</label>
  <label className="flex items-center gap-2"><Checkbox name="permissions" value="write" /> Write</label>
  <label className="flex items-center gap-2"><Checkbox name="permissions" value="admin" /> Admin</label>
</CheckboxGroup>
```

### 6. Inside a Field (with label / description / error)

```tsx
<Field>
  <FieldLabel className="flex items-center gap-2 font-normal">
    <Checkbox name="newsletter" />
    Send me product updates
  </FieldLabel>
  <FieldDescription>One email a week. No spam.</FieldDescription>
</Field>
```

## Pitfalls

- **Indeterminate is `checked="indeterminate"`, not a separate prop.**
  Pass the literal string when you want the bar. Switching to / from
  this state animates correctly because the indicator is `keepMounted`.
- **The square is 18px on touch (`size-4.5`) and 16px on desktop
  (`sm:size-4`).** Don't override the size unless you're shipping a
  really tight density — the touch target is intentional.
- **Use `Label` component for the text, not `<label>`** — the styled
  `Label` stays in sync with the design system (cursor, color,
  disabled).
- **`onCheckedChange` fires `boolean | "indeterminate"`.** Type your
  state accordingly if you support indeterminate.

## Rules of thumb

- **Use Checkbox for many independent yes/no toggles** in a list
  (notifications, permissions, filter facets). For a single yes/no
  setting in a settings panel, use `Switch` — the affordance reads
  as "applies immediately."
- **Group checkboxes with `CheckboxGroup`** when the values feed
  into one form field (e.g. multi-select tags submitted as an array).
  Independent checkboxes don't need a group.
- **Always pair with a `Label`** — bare checkboxes have no obvious
  meaning, and the label doubles the click target.
- **Disable, don't hide**, when an option is temporarily unavailable —
  the row stays visible at 64% opacity so the user knows it exists.

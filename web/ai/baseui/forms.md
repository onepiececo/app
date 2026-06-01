# Base UI Forms

Source: <https://base-ui.com/react/handbook/forms.md>.

Base UI controls integrate with forms through native form behavior,
constraint validation, labels, hidden inputs, and field state attributes.

## Rules

- Use `name` on controls that should submit a value.
- Use the primitive's own label part when it has one, such as `Select.Label` or `Combobox.Label`.
- If there is no visible label, set `aria-label` on the actual interactive control.
- Wrap controls in a relatively positioned container when native validation bubbles need to point to hidden inputs.
- Use `Form` with `Field` when field validity must aggregate at the form level.
- Do not rely on `File` objects crossing the server boundary; submit or upload them explicitly.

## Field State

Field-aware controls can expose:

- `data-valid`
- `data-invalid`
- `data-dirty`
- `data-touched`
- `data-filled`
- `data-focused`

Use these attributes for invalid, focused, and dirty styling. Keep error UI
in `FieldError` where possible.

## Submit Handling

Base UI `Form` can be used with normal `onSubmit`, Base UI's
`onFormSubmit`, or React/Next Server Actions through the `action` prop.
For Server Actions in React 19, pair the form with `useActionState` and
surface pending state through the submit button.

## Labels

Trigger-based controls are not always labelable through a surrounding
`FieldLabel` alone. Check the primitive's label API before assuming a label
is wired correctly.

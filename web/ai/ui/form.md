# Form

Source: [`src/components/ui/form.tsx`](../../src/components/ui/form.tsx).
Base UI primitive: [Form](https://base-ui.com/react/components/form).

A `<form>` element with base-ui's accessibility wiring — collects
validation state from every `Field` inside and surfaces it on
submit. **Always use `Form` instead of a raw `<form>`** when the
form has any `Field` components in it. Otherwise the field-level
error / dirty / touched / valid state never propagates to the form
root, and submit-time validation breaks.

`Form` is the *root* — `Field` (see [`field.md`](./field.md)) is
the per-input wrapper. Form aggregates Field state; Field reports
it. You always need both for full validation flow.

## Anatomy

Single-part on the base-ui side. This wrapper intentionally does not add
a recipe; pass `className` directly to `Form` when a layout needs spacing.
It composes with Field:

```
<Form>                            // base: Form (renders <form>)
  <Field>                         // base: Field.Root
    <FieldLabel />                // base: Field.Label
    <Input />                     // base: Field.Control or Input
    <FieldError />                // base: Field.Error
  </Field>
</Form>
```

## Parts

- `Form` — wraps `@base-ui/react/form`. Renders `<form>`.
- `FormPrimitive` — re-export of `@base-ui/react/form`.

## API reference

`Form` props (forwarded to base-ui `Form`):

- `errors: Record<string, string | string[]>` — externally-supplied
  validation errors (server / action result). Keyed by `Field` `name`.
- `onFormSubmit: (values, eventDetails) => void` — submit callback
  with parsed form values; `preventDefault` is automatic.
- `validationMode: "onSubmit" | "onBlur" | "onChange"` — when Field
  validators run. Default `"onSubmit"`.
- `actionsRef: RefObject<{ validate: (name?: string) => void }>` —
  imperatively trigger validation on all (or one) Field.
- Standard `<form>` props (`action`, `onSubmit`, `noValidate`, etc.)
  pass through.

`Field` is documented in [`field.md`](./field.md) — it owns
`data-valid` / `data-invalid` / `data-dirty` / `data-touched` /
`data-filled` / `data-focused` data attributes consumed by every
input-shaped control.

## Scenarios

### 1. Basic form with submit handler

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

function ProfileForm() {
  const [errors, setErrors] = useState<Record<string, string | string[]>>({});

  return (
    <Form
      errors={errors}
      onSubmit={async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const result = await updateProfile(formData);
        if (!result.ok) setErrors(result.errors);
      }}
      className="flex flex-col gap-4"
    >
      <Field name="name">
        <FieldLabel>Name</FieldLabel>
        <Input />
        <FieldError />
      </Field>
      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <Input type="email" required />
        <FieldDescription>We'll only use this for spam.</FieldDescription>
        <FieldError />
      </Field>
      <Button type="submit">Save</Button>
    </Form>
  );
}
```

The `errors` prop accepts a record of field names to error strings
(or arrays of strings). The `name` prop on each `Field` connects to
the matching error key.

### 2. With Fieldset grouping

```tsx
<Form>
  <Fieldset>
    <FieldsetLegend>Account</FieldsetLegend>
    <div className="mt-4 flex flex-col gap-4">
      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <Input type="email" />
        <FieldError />
      </Field>
    </div>
  </Fieldset>

  <Fieldset className="mt-8">
    <FieldsetLegend>Profile</FieldsetLegend>
    <div className="mt-4 flex flex-col gap-4">
      <Field name="bio">
        <FieldLabel>Bio</FieldLabel>
        <Textarea />
      </Field>
    </div>
  </Fieldset>

  <Button type="submit" className="mt-8">Save</Button>
</Form>
```

Fieldsets give the form structure; the Form root still tracks
validation state across all groups.

### 3. Server-side validation errors

```tsx
async function action(formData: FormData) {
  "use server";
  const result = await schema.safeParseAsync(Object.fromEntries(formData));
  if (!result.success) {
    return {
      errors: Object.fromEntries(
        Object.entries(result.error.flatten().fieldErrors).map(([k, v]) => [k, v ?? []]),
      ),
    };
  }
  await updateProfile(result.data);
  return { ok: true };
}
```

Wire the server action's returned errors back to the `Form`'s
`errors` prop via `useActionState` or your form library of choice.

### 4. With `useActionState` (Next.js Server Actions)

```tsx
"use client";

import { useActionState } from "react";

const initialState = { errors: {} };

function MyForm() {
  const [state, formAction, pending] = useActionState(action, initialState);
  return (
    <Form action={formAction} errors={state.errors}>
      <Field name="email">…</Field>
      <Button type="submit" loading={pending}>Save</Button>
    </Form>
  );
}
```

`useActionState` is the React 19 idiom for server-action forms.
Pair with `Button loading={pending}` for the submit-state UI.

## Pitfalls

- **Raw `<form>` won't track Field state.** Always use `Form`
  when there are `Field`s inside. The validation pipeline only
  works through base-ui's primitive.
- **`errors` is `Record<string, string | string[]>`** — use the
  same `name` on each `Field` as the key in your errors record.
  Mismatched names = errors never display.
- **`Form` doesn't trigger native HTML5 validation** by default.
  If you need browser-level "this field is required" tooltips,
  drop `noValidate={false}` (it defaults to honoring the
  `novalidate` attribute when set).
- **Submit handlers should `event.preventDefault()`** unless
  you actually want the browser navigation. With Server Actions
  via the `action` prop, base-ui handles this for you.

## Rules of thumb

- **One `Form` per submission** — don't nest forms.
- **`Form` + `Field` + `Input` is the canonical stack** for any
  data-collecting surface. Skip it only for purely display-only
  controls.
- **Use `Fieldset` for grouping** when the form has 4+ inputs in
  multiple logical sections.
- **Server Actions + `useActionState`** is the React 19 idiom —
  prefer it over `useState` + manual fetch unless you have a
  specific reason.
- **Submit button should be `<Button type="submit" loading={pending}>`** —
  the loading state preserves the button width while showing a
  spinner.

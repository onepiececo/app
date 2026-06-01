# OTPField

Source: [`src/components/ui/otp-field.tsx`](../../src/components/ui/otp-field.tsx).
Base UI primitive: [OTP Field](https://base-ui.com/react/components/otp-field).

A discrete-cell input for verification codes — one `<input>` per
digit, auto-advance on type, paste-the-whole-code support, native
field validation. Each cell uses the same Input-family chrome
(`bg-background` + 1px ring + soft shadow + focus halo) so the row
sits naturally next to other form controls.

Two sizes: `default` (32×32 → 36×36) and `lg` (36×36 → 40×40). The
larger size for codes that are the focal point of a screen
(2FA verification, magic-link entry).

## Anatomy

Base-ui parts → project wrappers:

- `OTPField.Root` → `OTPField` — `<div>` container, owns value / length / validation, tracks indices by DOM order of inputs.
- `OTPField.Input` → `OTPFieldInput` — single-character `<input>` slot.
- `OTPField.Separator` → `OTPFieldSeparator` — visual `<div>` divider (renders the project `Separator`).

## API reference

**Root** (`OTPField`)
- `length: number` *(required)* — total slots; must equal the number of `OTPFieldInput` children.
- `value` / `defaultValue: string` — controlled / uncontrolled code.
- `onValueChange(value, event, reason)` — fires on edits; `reason` ∈ `'input-change' | 'input-paste' | 'input-delete' | 'input-arrow-key'`.
- `onValueComplete(value)` — fires when all slots filled (use this + `queueMicrotask` instead of `autoSubmit`, see scenario 3).
- `onValueInvalid(value, reason)` — rejected input (e.g. letter typed when `validationType="numeric"`).
- `validationType: 'numeric' | 'alpha' | 'alphanumeric' | 'none'` (default `'numeric'`).
- `sanitizeValue: (raw: string) => string` — custom sanitiser when `validationType="none"`.
- `mask: boolean` — render as password bullets.
- `autoSubmit: boolean` — currently buggy under React 19 (see scenario 3).
- `name`, `disabled`, `readOnly`, `required`.
- *(project)* `size: "default" | "lg"`.

**Input**: standard `className` / `style` / `render`. Do NOT pass `index` — Root assigns by DOM order.

**Separator**: `orientation: "horizontal" | "vertical"` plus standard styling props.

### Data attributes

- `data-complete` — on Root when every slot is filled.
- `data-filled` — on Root / Input when at least one character entered / present.
- `data-focused` — on Input.
- `data-disabled`, `data-readonly`, `data-required`.
- `data-valid` / `data-invalid` — when wrapped in `Field.Root`.
- `data-dirty` / `data-touched`.

## Parts

- `OTPField` — root. Pass `length` (required, number of cells) and
  `value` / `onValueChange` (controlled) or `defaultValue`. Render
  exactly `length` `OTPFieldInput` children inside (the Root tracks
  them by DOM order).
- `OTPFieldInput` — a single cell. No `index` prop — Root assigns
  index by DOM order.
- `OTPFieldSeparator` — visual gap between groups (the dash in
  `123 - 456`). Renders the system `Separator` styled as a small
  pill.
- `OTPFieldPrimitive` — re-export of `@base-ui/react/otp-field`.

## Scenarios

### 1. Six-digit code with mid-separator

```tsx
const [code, setCode] = useState("");

<Field>
  <FieldLabel>One-time code</FieldLabel>
  <OTPField length={6} value={code} onValueChange={setCode}>
    <OTPFieldInput />
    <OTPFieldInput />
    <OTPFieldInput />
    <OTPFieldSeparator />
    <OTPFieldInput />
    <OTPFieldInput />
    <OTPFieldInput />
  </OTPField>
  <FieldDescription>Check your email for the 6-digit code.</FieldDescription>
</Field>
```

### 2. Four-digit large code

```tsx
<OTPField length={4} size="lg" defaultValue="">
  <OTPFieldInput />
  <OTPFieldInput />
  <OTPFieldInput />
  <OTPFieldInput />
</OTPField>
```

### 3. Auto-submit on completion (current bug — use the workaround)

base-ui's `autoSubmit` prop currently calls `form.requestSubmit()`
synchronously inside the input change handler, which logs a
`flushSync was called from inside a lifecycle method` warning under
React 19 (see [`primitive.md`](../primitive.md) for the bug
report). Until base-ui ships a fix, defer the submit to a
microtask via `onValueComplete` + a form `ref`:

```tsx
"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { OTPField, OTPFieldInput } from "@/components/ui/otp-field";

function VerifyForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);

  return (
    <Form
      ref={formRef}
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setSubmitted(String(formData.get("verify") ?? ""));
      }}
    >
      <Field>
        <FieldLabel>Verification code</FieldLabel>
        <OTPField
          length={6}
          name="verify"
          onValueComplete={() => {
            queueMicrotask(() => formRef.current?.requestSubmit());
          }}
        >
          {Array.from({ length: 6 }, (_, i) => <OTPFieldInput key={i} />)}
        </OTPField>
      </Field>
      <Button type="submit">Verify</Button>
      {submitted ? <p>Submitted: {submitted}</p> : null}
    </Form>
  );
}
```

Once base-ui ships a fix, swap back to:

```tsx
<OTPField length={6} name="verify" autoSubmit>…</OTPField>
```

### 4. Inside a Form (server-action verification)

```tsx
<Form action={verifyCode}>
  <Field>
    <FieldLabel>Verification code</FieldLabel>
    <OTPField length={6} name="code">
      {Array.from({ length: 6 }, (_, i) => <OTPFieldInput key={i} />)}
    </OTPField>
    <FieldError />
  </Field>
  <Button type="submit">Verify</Button>
</Form>
```

The hidden form input automatically participates in the form's
`FormData` — submit reads the joined code as `formData.get("code")`.

### 5. Mask the value (PIN entry)

```tsx
<OTPField length={4} mask>
  <OTPFieldInput />
  <OTPFieldInput />
  <OTPFieldInput />
  <OTPFieldInput />
</OTPField>
```

`mask` switches each cell to type=password rendering — bullets
instead of digits.

## Pitfalls

- **`length` is required** on the Root, AND the number of
  `OTPFieldInput` children must match. Mismatched count = broken
  focus advancement.
- **`OTPFieldInput` does not take an `index` prop** — the Root
  assigns indices by DOM order. Don't wrap inputs in any layout
  div between Root and Input or the index tracking breaks.
- **Paste handles full codes automatically** — when a user pastes
  a 6-digit string into the first cell, base-ui distributes it
  across all cells. Don't intercept paste events.
- **`validationType="numeric"` is the default** — non-digits
  filter out automatically. Pass `validationType="alphanumeric"`
  for letters + digits codes.
- **The Separator is a positional marker only**. It doesn't
  count toward `length` — `length={6}` with one separator means
  6 inputs + 1 separator + 0 indexing offset.

## Rules of thumb

- **Use OTPField for verification codes** (2FA, magic-link, email
  confirmation). Don't use it for general numeric input — that's
  `NumberField`'s job.
- **Add a Separator after every 3 cells** for readability —
  `123 - 456` is far easier to scan than `123456`.
- **`size="lg"` when the code is the only thing on the screen**
  (full-page 2FA verification). Default size when it's one
  field in a longer form.
- **Always pair with a Field + FieldDescription** that tells the
  user where the code came from ("Check your email" / "We sent
  a code to **••••8290**").
- **`autoSubmit` for 6+ digit codes** where the user is unlikely
  to want to review before pressing Submit. Skip it for shorter
  codes where typos are common.

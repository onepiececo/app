# OTPField `autoSubmit` triggers flushSync-during-render warning

When `autoSubmit` is set on `OTPFieldPreview.Root` and the user fills
the last cell, React logs:

```
Warning: flushSync was called from inside a lifecycle method.
React cannot flush when React is already rendering.
Consider moving this call to a scheduler task or micro task.
```

## Minimal repro

```tsx
"use client";

import { Form } from "@base-ui/react/form";
import { OTPFieldPreview } from "@base-ui/react/otp-field";
import { useState } from "react";

export default function App() {
  const [submitted, setSubmitted] = useState<string | null>(null);

  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setSubmitted(String(formData.get("code") ?? ""));
      }}
    >
      <OTPFieldPreview.Root length={6} name="code" autoSubmit>
        <OTPFieldPreview.Input />
        <OTPFieldPreview.Input />
        <OTPFieldPreview.Input />
        <OTPFieldPreview.Input />
        <OTPFieldPreview.Input />
        <OTPFieldPreview.Input />
      </OTPFieldPreview.Root>
      {submitted ? <p>Submitted: {submitted}</p> : null}
    </Form>
  );
}
```

## Steps

1. Render the component.
2. Type or paste a 6-digit code.
3. On the 6th digit, the form attempts to auto-submit and React logs
   the warning above.

## Environment

- `@base-ui/react`: `1.4.1`
- `react`: `19.2.5`
- `next`: `16` (App Router, Turbopack)

## Likely cause

`autoSubmit` calls `form.requestSubmit()` synchronously inside the
input's value-change handler, which is still inside React's render
flush. Wrapping the submit call in `queueMicrotask` (or
`requestAnimationFrame`) inside `OTPFieldRoot` should fix it.

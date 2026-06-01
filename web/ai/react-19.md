# React 19 + React Compiler

This repo runs **React 19** with the **React Compiler** enabled
(`next.config.ts` → `reactCompiler: true`). That combination changes how
you should write components day-to-day.

The single most important rule: **never write `useMemo` or `useCallback`.**
If you only read one section of this doc, read [Memoization](#memoization).

## Memoization

The React Compiler runs at build time (via Babel, scoped by Next.js's SWC
filter to files that contain JSX or hooks). It analyzes every component
and hook for memoization opportunities and inserts the equivalent of
`useMemo` / `useCallback` automatically — with provably correct dependency
tracking.

That means:

- **Don't write `useMemo`.** The compiler memoizes derived values.
- **Don't write `useCallback`.** The compiler memoizes inline functions.
- **Don't wrap components in `React.memo()`.** The compiler decides per
  component whether memoization is profitable.
- Just compute and declare things inline. The compiler does the rest.

`useMemo` is also actively unsafe for instance stability: per React docs,
React is allowed to re-invoke the factory. We hit this with
`useMemo(() => createTooltipHandle(), [])` — the handle got re-created,
the registered triggers were orphaned, and `handle.open(triggerId)` threw
"No trigger found with id". For anything that must be `===` across
renders, use a lazy ref:

```tsx
const handleRef = useRef<TooltipPrimitive.Handle<Payload> | null>(null);
if (!handleRef.current) handleRef.current = TooltipCreateHandle();
const handle = handleRef.current;
```

Or `useState(() => createInstance())[0]` — same shape, also fine.

### Compiler directives

If you ever genuinely need to opt a single component out (e.g. you're
debugging a compiler issue, or wrapping incompatible third-party code):

```tsx
function ProblemComponent() {
  "use no memo"; // TODO(name): remove after fixing X
  // …
}
```

`"use memo"` exists for the inverse case (annotation mode), but the repo
uses default mode where everything compiles, so you'll only need
`"use no memo"`. Treat it as a temporary escape hatch — open an issue,
fix the underlying problem, remove the directive.

### Rules of React (what the compiler depends on)

The compiler is sound only if your components follow the Rules of React:

1. **Components are pure.** Same inputs → same output.
2. **Don't mutate props or state.** Treat them as readonly. Build new
   values; don't push into existing arrays.
3. **No side effects in render.** Side effects belong in event handlers,
   `useEffect`, or Server Actions.

Break these rules and the compiler may produce subtly wrong code.

## `ref` as a regular prop

`forwardRef` is deprecated. New components accept `ref` as a normal prop:

```tsx
type ButtonProps = {
  variant?: "default" | "outline";
  ref?: React.Ref<HTMLButtonElement>;
  // …
};

export const Button = (props: ButtonProps) => (
  <button ref={props.ref} className={…}>…</button>
);
```

For our wrapper components, you usually don't need to surface `ref`
explicitly — `mergeProps` / `useRender` from base-ui composes refs for
you.

Existing `forwardRef` usages don't need a rip-out. Replace when you're
already touching the file.

### Ref cleanup functions

Ref callbacks can return a cleanup, fired on unmount:

```tsx
<input
  ref={(el) => {
    el?.addEventListener("focus", onFocus);
    return () => el?.removeEventListener("focus", onFocus);
  }}
/>
```

**Caveat (TypeScript):** the callback must be a block, not an implicit
return. `<div ref={c => (instance = c)} />` will be rejected — write
`<div ref={c => { instance = c; }} />`.

## Actions, `useActionState`, `useFormStatus`, `useOptimistic`

React 19 makes async data mutations a first-class primitive. The pattern:

- A **Server Action** (`"use server"` function) does the work.
- `useActionState(action, initial)` wraps it for client invocation,
  giving you `[state, submit, isPending]`.
- A `<form action={submit}>` calls it on submit and resets uncontrolled
  inputs on success.
- `useFormStatus()` lets nested children read pending state without
  prop-drilling.
- `useOptimistic(value)` shows an instant optimistic UI while the action
  runs.

```tsx
// app/actions.ts
"use server";
export async function updateName(_prev: string | null, formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const error = await db.users.updateName(name);
  return error ?? null;
}

// app/profile/page.tsx
"use client";
import { useActionState, useOptimistic } from "react";
import { useFormStatus } from "react-dom";
import { updateName } from "../actions";

function Submit() {
  const { pending } = useFormStatus();
  return <Button type="submit" loading={pending}>Save</Button>;
}

export default function Profile({ initialName }: { initialName: string }) {
  const [error, submit] = useActionState(updateName, null);
  const [optimisticName, setOptimisticName] = useOptimistic(initialName);

  return (
    <form
      action={async (formData) => {
        setOptimisticName(String(formData.get("name") ?? ""));
        await submit(formData);
      }}
    >
      <p>Hello, {optimisticName}.</p>
      <Input name="name" defaultValue={initialName} />
      <Submit />
      {error ? <p className="text-destructive">{error}</p> : null}
    </form>
  );
}
```

Prefer this over hand-rolling `useState` + `useTransition` + try/catch
for form submissions. Less boilerplate, fewer bugs around pending state.

`useActionState` was briefly called `useFormState` in React Canary —
delete any of those and rename.

## `use()` hook

`use()` reads a resource (Promise *or* Context) inside render. It
integrates with Suspense for promises and works in branches where
`useContext` doesn't (after early returns, inside conditionals).

```tsx
// Promise
function Comments({ commentsPromise }: { commentsPromise: Promise<Comment[]> }) {
  const comments = use(commentsPromise);
  return <ul>{comments.map((c) => <li key={c.id}>{c.body}</li>)}</ul>;
}

<Suspense fallback={<Skeleton />}>
  <Comments commentsPromise={fetchComments()} />
</Suspense>;

// Context (works after early return)
function Heading({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  const theme = use(ThemeContext);
  return <h1 style={{ color: theme.color }}>{children}</h1>;
}
```

**Promise gotcha:** `use()` does NOT support promises *created in render*
(every render makes a new one — infinite loop). The promise must come
from outside the component or from a Suspense-aware data layer. In Next.js
App Router, prefer Server Components doing `await` directly; reach for
`use(promise)` only when you need to read a server-rendered async value
from a Client Component.

## Context as Provider (no more `.Provider`)

```tsx
const ThemeContext = createContext<Theme>("light");

// Old
<ThemeContext.Provider value="dark">{children}</ThemeContext.Provider>

// New
<ThemeContext value="dark">{children}</ThemeContext>
```

Both work today; `Context.Provider` is deprecated. Codemod available for
bulk conversion if/when we want to clean up.

## Document metadata, stylesheets, scripts

These tags hoist to `<head>` from anywhere in the tree:

- `<title>`, `<meta>`, `<link>` — colocate with the component that owns
  the metadata.
- `<link rel="stylesheet" href="…" precedence="default" />` — React
  dedupes by `href`, controls insertion order via `precedence`, and
  blocks reveal until the stylesheet loads.
- `<script async src="…" />` — async scripts dedupe across mounts.

In the App Router, **prefer the `metadata` export** on `page.tsx` /
`layout.tsx` for static SEO concerns (Next.js handles streaming and SSR
correctly there). Reach for inline metadata tags only when the value is
genuinely component-local (e.g. a stylesheet a particular component
needs).

## Resource preloading APIs

From `react-dom`:

```tsx
import { prefetchDNS, preconnect, preload, preinit } from "react-dom";

prefetchDNS("https://images.example.com");                     // DNS only
preconnect("https://api.example.com");                          // DNS + TCP
preload("https://fonts.example.com/inter.woff2", { as: "font" });
preinit("https://cdn.example.com/critical.js", { as: "script" });
```

Useful inside event handlers (preload on hover before navigation) or
Server Components for above-the-fold resources. React orders the emitted
`<link>` / `<script>` tags by utility, not call order.

## Better hydration errors

Hydration mismatches now report a single error with a visual diff
showing exactly which text/attribute differs between server and client
output, plus a list of common causes. If you see one, scan the listed
causes first (`Date.now()` in render, locale-sensitive formatting,
client-only branches without `useMounted` gate) before deeper digging.

Unexpected `<head>` / `<body>` tags injected by extensions or third-party
scripts are now skipped instead of throwing.

## Error reporting

`createRoot` accepts three error callbacks:

```tsx
createRoot(container, {
  onCaughtError(error, info) { /* caught by ErrorBoundary */ },
  onUncaughtError(error, info) { /* escaped all boundaries */ },
  onRecoverableError(error, info) { /* React recovered automatically */ },
});
```

Useful for wiring up Sentry / OpenTelemetry / etc. with the right
severity per category.

## Custom elements (Web Components)

React 19 passes the Custom Elements Everywhere test suite. Prop-to-attribute
vs prop-to-property mapping is automatic:

- **CSR:** matches DOM property if one exists, else attribute.
- **SSR:** primitives become attributes; objects/functions/symbols/false
  are omitted.

You can drop `<my-component data={obj} onAction={fn} />` and React will
do the right thing.

## Static prerendering

`react-dom/static` exposes `prerender()` and `prerenderToNodeStream()`
for SSG that waits for Suspense data to resolve before returning HTML —
unlike `renderToString` which doesn't. In this repo Next.js handles
prerendering, so you generally won't call these directly.

## Deprecated / removed

| Item | Replacement |
| --- | --- |
| `useMemo`, `useCallback`, `React.memo` | Compiler does this — write inline |
| `forwardRef` | `ref` as a prop |
| `Context.Provider` | `<Context value={…}>` |
| Calling refs with `null` on unmount | Cleanup return from ref callback |
| `useFormState` | `useActionState` (renamed) |
| `renderToString` for SSG | `prerender()` (when SSG, blocking on data) |

## Quick smell tests when reviewing PRs

- A new file imports `useMemo` / `useCallback` → flag it. Always.
- A new component is wrapped in `React.memo()` → flag it.
- A new component uses `forwardRef` → suggest the prop form (don't
  block — old form still works).
- `<X.Provider>` for a freshly-added context → use `<X>` directly.
- Form submission has `useState` for `loading` and `error` and a manual
  `try / catch` → suggest `useActionState` + `useFormStatus`.
- `useEffect` that `await`s something and `setState`s the result → maybe
  `use(promise)` inside Suspense is a better fit.

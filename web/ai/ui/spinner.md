# Spinner

Source: [`src/components/ui/spinner.tsx`](../../src/components/ui/spinner.tsx).

A spinning loader icon. Wraps `Loader2Icon` from lucide with
`animate-spin`, `role="status"`, and `aria-label="Loading"` so screen
readers announce it. Size and color inherit from the parent (default
lucide sizing rules) — pass `className="size-4 text-muted-foreground"`
to override.

## Parts

- `Spinner` — the only export. Accepts every prop `lucide-react`
  passes through (`size`, `strokeWidth`, `className`, `style`, etc.).
- `spinnerVariants` — exported recipe for the spin animation class.

## Scenarios

### 1. Standalone

```tsx
<Spinner className="size-4 text-muted-foreground" />
```

### 2. Inside a `Button` (loading state)

```tsx
<Button loading>Saving…</Button>
```

`Button` already composes `Spinner` internally when `loading` is
true. Don't drop a `Spinner` next to the button content yourself —
the loading API hides the children + overlays the spinner in the
same grid cell so the button doesn't shift width.

### 3. Inline with text

```tsx
<span className="inline-flex items-center gap-2 text-muted-foreground">
  <Spinner className="size-3.5" />
  Loading projects…
</span>
```

### 4. Centered in a panel / Empty state

```tsx
<div className="flex h-64 items-center justify-center">
  <Spinner className="size-6 text-muted-foreground" />
</div>
```

### 5. Replacing icon in a stat / row

```tsx
<div className="flex items-center gap-2">
  {isUpdating ? <Spinner className="size-4" /> : <CheckIcon className="size-4 text-success" />}
  <span>Synced 2m ago</span>
</div>
```

## Pitfalls

- **Don't render Spinner inside a `Button` directly.** Use the
  `loading` prop — it preserves the button's width and disables
  interaction in one shot.
- **`role="status"` is on the SVG**, not a wrapping div. If you
  wrap the spinner in your own labeled region, set `role="status"`
  on the wrapper and `aria-hidden` on the spinner so AT doesn't
  double-announce.
- **The default size is whatever lucide gives you** (`24px`). Always
  pass an explicit `size-…` class — context decides the right size.

## Rules of thumb

- **Inside `Button`** → `<Button loading>…</Button>`, never `<Button><Spinner />…</Button>`.
- **In a stat / status row** → `size-4` to match adjacent icons.
- **In an empty / loading state panel** → `size-6` or `size-8` with
  `text-muted-foreground`.
- **In a Tooltip / inline chip** → `size-3.5` so it doesn't dominate
  the text.
- **Don't combine multiple spinners on the same screen** — pick one
  loading affordance per region.

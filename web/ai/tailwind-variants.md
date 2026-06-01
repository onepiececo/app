# Tailwind Variants (`tv`)

Source dep: [`tailwind-variants`](https://www.tailwind-variants.org/) — installed at `^3.2.2` in this repo.

A typed variant API for composing Tailwind class strings. Use it when a component has more than one or two visual axes (variant × size, side × state, color × tone) and the class strings start to collapse into a tangle of `cn()` calls. Use plain `cn()` for one-shot styling that doesn't deserve a system.

## When to reach for `tv` vs `cn`

| Use `cn()` | Use `tv()` |
| --- | --- |
| Single-component, single-axis styling | Multiple axes (variant × size × state) |
| Conditional class on one element | A component with **slots** (header / body / footer / etc) where chrome decisions cascade across slots |
| Truly bespoke pages | A primitive being reused across the design system |
| Fewer than ~3 lines of merged classes | Long class strings or a `cva` you'd otherwise write |

`tv()` is **not a replacement** for `cn()` — they coexist. Most consumer code stays on `cn()`. Reach for `tv()` inside library primitives.

## Install + import

```ts
// Default build — wraps tailwind-merge for automatic conflict resolution.
import { tv, type VariantProps } from "tailwind-variants";
```

A lite build (`tailwind-variants/lite`) exists without `tailwind-merge` if bundle size matters. We use the default build because conflict resolution is worth the extra ~3KB.

The package also exports `cn`, `cnMerge`, and `cx` utilities. We **do not** use these — the project's `cn` from `@/lib/utils` already wraps `clsx + twMerge` and is the convention. Stick with it.

## Basic usage

```tsx
import { tv } from "tailwind-variants";

const button = tv({
  base: "inline-flex h-9 items-center rounded-md px-3 text-sm font-medium",
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      outline: "border border-border bg-background hover:bg-muted",
      ghost: "hover:bg-muted",
    },
    size: {
      sm: "h-8 px-2.5 text-xs",
      default: "h-9 px-3 text-sm",
      lg: "h-10 px-4 text-sm",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

// Single component — `tv()` returns a function that returns a string.
button({ variant: "outline", size: "sm" });
// => "inline-flex h-8 items-center rounded-md px-2.5 text-xs font-medium border border-border bg-background hover:bg-muted"
```

## Slots — the killer feature

A component with multiple parts (header / panel / footer; trigger / popup / arrow) becomes one `tv()` call with a `slots` object. Variants apply across all slots simultaneously, so chrome decisions stay coherent.

```tsx
const card = tv({
  slots: {
    root: "rounded-xl border bg-card",
    header: "flex items-center px-6 py-4",
    body: "px-6 pb-6",
    footer: "flex items-center justify-end gap-2 px-6 pb-6",
  },
  variants: {
    appearance: {
      flat: { root: "shadow-none" },
      elevated: { root: "shadow-md" },
      // Variants can target a single slot or multiple slots at once.
      compact: {
        header: "py-2",
        body: "pb-2",
        footer: "pb-2",
      },
    },
  },
});

const { root, header, body, footer } = card({ appearance: "elevated" });

return (
  <div className={root()}>
    <div className={header()}>…</div>
    <div className={body()}>…</div>
    <div className={footer()}>…</div>
  </div>
);
```

Each slot is its own callable that accepts `{ class }` for per-instance overrides:

```tsx
<div className={root({ class: "max-w-sm" })}>…</div>
```

## Compound variants — handling cross-axis decisions

When a class depends on **two** variants together (size: lg AND state: open), use `compoundVariants`:

```tsx
const button = tv({
  base: "rounded-md",
  variants: {
    variant: { default: "bg-primary", destructive: "bg-destructive" },
    disabled: { true: "opacity-50 pointer-events-none" },
  },
  compoundVariants: [
    {
      variant: "destructive",
      disabled: true,
      // Soft red background instead of full destructive — quieter when disabled.
      class: "bg-destructive/40",
    },
  ],
});
```

For slots, the compound's `class` is an object keyed by slot name:

```tsx
compoundVariants: [
  {
    variant: "outlined",
    severity: "error",
    class: {
      root: "border-red-700",
      title: "text-red-700",
    },
  },
],
```

## Compound slots — apply once across many slots

When N slots share the same conditional classes, `compoundSlots` saves repetition:

```tsx
compoundSlots: [
  {
    slots: ["item", "prev", "next"],
    size: "sm",
    class: "h-8 w-8 text-sm", // applied to all three slots when size=sm
  },
],
```

## Extracting types — `VariantProps`

```tsx
import { tv, type VariantProps } from "tailwind-variants";

const button = tv({
  variants: {
    variant: { default: "...", ghost: "..." },
    size: { sm: "...", lg: "..." },
  },
});

type ButtonVariants = VariantProps<typeof button>;
// => { variant?: "default" | "ghost"; size?: "sm" | "lg" }

type ButtonProps = ButtonVariants & React.ComponentProps<"button">;

export const Button = (props: ButtonProps) => {
  const { variant, size, className, ...rest } = props;
  return <button className={button({ variant, size, class: className })} {...rest} />;
};
```

This is the recommended pattern: extract `VariantProps`, intersect with the underlying element's props, expose them on your component.

## Project conventions

- **Use `tv()` inside primitives** in `src/components/ui/`, not in feature code. Feature code composes primitives and uses `cn()` for one-off tweaks.
- **One `tv()` per primitive file.** Don't sprinkle multiple `tv()` calls. If a primitive has obvious sub-shapes (sidebar's panel vs page chrome), use `slots` to keep them in one definition.
- **Always set `defaultVariants`** when a variant has a sensible default. Skipping it means consumers must always pass the variant explicitly.
- **Pass user `className` via the `class` key** on the slot/element call so tailwind-merge resolves conflicts:
  ```tsx
  return <div className={root({ class: props.className })} />;
  ```
- **Use `VariantProps<typeof x>`** to derive prop types — never hand-type the variant union, it goes stale.
- **Stick with our `cn`** from `@/lib/utils` for plain class merging. The package exports its own `cn` / `cx` / `cnMerge` but we don't import them — keep the convention single.

## Pitfalls

- **Boolean variants live under `true` / `false` keys**, not `enabled` / `disabled`. The variant key itself is your boolean flag (`disabled: true`).
- **`compoundSlots` without a variant filter applies always.** Read it as "default merged classes across these slots." Use a variant filter to scope.
- **Slot result functions are NOT cached** — destructuring `const { root } = card(...)` and reusing `root()` is fine, but every render does the merge. For very hot paths consider memoizing the destructure inside the component.
- **The `slots` key short-circuits `base`.** A `tv({ base, slots })` is unusual — prefer either `base` (single-element) or `slots` (multi-element), not both.
- **`tailwind-merge` config** can be customized via `twMergeConfig` to teach it about custom design-token classes (`text-tiny`, `shadow-large`, etc). Most projects don't need this; this repo doesn't.

## Why we picked it

- **Slots** — no other CVA-like library handles multi-element components without manual cn() coordination across siblings.
- **Compound variants/slots** — first-class support for cross-axis decisions instead of escape hatches.
- **`tailwind-merge` baked in** — no double-class problems when consumers override.
- **Type-safe props via `VariantProps`** — the prop unions stay in sync with the variant keys.
- **No build step** — works in any TS/JS environment, no codegen, no Babel plugin.

For deeper docs: <https://www.tailwind-variants.org/>.

# Base UI Styling

Source: <https://base-ui.com/react/handbook/styling.md>.

Base UI is unstyled. Components expose structure, state attributes, CSS
variables, and render composition hooks; this repo owns the visual system
in `src/components/ui/`.

## Rules

- Use `@base-ui/react` primitives and style wrapper parts locally.
- Prefer `tailwind-variants` slot recipes when a component has multiple styled parts.
- Use plain `className` composition for single-part wrappers or pass-through primitives.
- Use `mergeBaseUiClassName` only when a wrapped Base UI part accepts function-style `className`.
- Do not use Radix `asChild`; Base UI uses the `render` prop.
- Keep state styling on data attributes instead of JavaScript conditionals where possible.

## State Attributes

Common attributes include:

- `data-open`, `data-closed`, `data-popup-open`
- `data-highlighted`, `data-selected`, `data-checked`, `data-unchecked`
- `data-disabled`, `data-readonly`, `data-required`
- `data-valid`, `data-invalid`, `data-dirty`, `data-touched`, `data-filled`, `data-focused`
- `data-starting-style`, `data-ending-style`, `data-instant`
- `data-side`, `data-align`, `data-orientation`

Use these in Tailwind variants, for example `data-[invalid]:border-destructive`.

## CSS Variables

Floating and popup parts expose placement variables such as:

- `--anchor-width`
- `--anchor-height`
- `--available-width`
- `--available-height`
- `--transform-origin`

Use these instead of measuring in React. Typical examples are matching a
popup width to its trigger with `w-(--anchor-width)` or animating scale
from `origin-(--transform-origin)`.

## Repo Pattern

```tsx
export const selectVariants = tv({
  slots: {
    trigger: "...",
    popup: "...",
    item: "...",
  },
});

const styles = selectVariants();
```

Expose the recipe when consumers may need slot-level extension. Do not add
empty recipes just to make every primitive look uniform.

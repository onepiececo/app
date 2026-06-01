# Base UI Composition

Source: <https://base-ui.com/react/handbook/composition.md>.

Base UI composition uses the `render` prop, not `asChild`. The rendered
element or component receives Base UI props and a ref, and it must pass them
to the actual DOM node.

## Basic Pattern

```tsx
<TooltipTrigger render={<Button variant="outline" />}>Help</TooltipTrigger>
```

When a local wrapper needs to add props while preserving user props, use
`mergeProps` from Base UI.

```tsx
const render = (ownProps, state) => {
  const merged = mergeProps(ownProps, props.render.props);
  return <button {...merged} />;
};
```

## Rules

- Never use `asChild`; it is not a Base UI API.
- Custom components used with `render` must forward received props and refs to a DOM element.
- Do not pass button-only props, such as `type="button"`, to non-button render targets.
- If a wrapper exposes `render`, preserve Base UI's function-style `className` support with `mergeBaseUiClassName` when applicable.
- If the wrapper renders a project component like `Button`, do not pass Base UI function-style `className` into it unless that component supports it.

## Repo Pattern

Use `mergeProps` for wrappers around primitive parts. Use normal JSX
composition for components that are not exposing a Base UI `render` escape
hatch.

Reference files:

- `ai/baseui/use-render.md`
- `ai/baseui/merge-props.md`
- `src/lib/base-ui-class-name.ts`

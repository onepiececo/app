# Base UI `mergeProps`

Source: <https://base-ui.com/react/utils/merge-props.md>.

`mergeProps` combines internal props with user props safely. Use it in reusable wrapper components and in function-form `render` callbacks.

## Behavior

- Normal props: rightmost wins.
- `className`: concatenated right-to-left, so rightmost classes appear first.
- `style`: merged, rightmost style keys win.
- Event handlers: merged and called right-to-left.
- `ref`: not merged; only the rightmost ref is kept unless `useRender` handles ref merging.

## Pattern

```tsx
const defaultProps = {
  className: "rounded-md",
  onClick() {
    // internal handler
  },
};

return useRender({
  defaultTagName: "button",
  render: props.render,
  props: mergeProps<"button">(defaultProps, props),
});
```

## Preventing Base UI Handlers

For React synthetic events, Base UI adds `event.preventBaseUIHandler()`. Calling it prevents Base UI's earlier internal handler from running without calling `preventDefault()` or `stopPropagation()`.

```tsx
mergeProps<"button">(baseProps, {
  onClick(event) {
    if (locked) event.preventBaseUIHandler();
  },
});
```

## Function Arguments

`mergeProps` can receive a function that computes props from the merged props so far. That function replaces the accumulated props, so chain previous handlers manually if needed.

```tsx
mergeProps(
  { onClick: first },
  (props) => ({
    onClick(event) {
      props.onClick?.(event);
      second(event);
    },
  }),
);
```

## Project Rules

- Use `mergeProps` for wrappers that expose `render`.
- Use `cn` for one-off local class composition.
- Use `tv` slots for primitive styling systems, then pass the resulting class through `mergeProps` where a renderable wrapper is involved.

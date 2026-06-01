# Base UI `useRender`

Source: <https://base-ui.com/react/utils/use-render.md>.

`useRender` lets our wrapper components expose a Base UI-style `render` prop. It replaces Radix-style `asChild`.

## Use It When

- Building a reusable wrapper that normally renders one element but should allow a caller-supplied element.
- Implementing custom components like `Button` or `SelectButton` that accept `render={<OtherComponent />}`.
- You need a callback render prop that receives merged props and component state.

## Wrapper Pattern

```tsx
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

type TextProps = useRender.ComponentProps<"p">;

export const Text = (props: TextProps) => {
  const { render, ...rest } = props;

  return useRender({
    defaultTagName: "p",
    render,
    props: mergeProps<"p">(
      { className: "text-sm" },
      rest,
    ),
  });
};
```

## React 19 Refs

React 19 lets components receive `ref` as a normal prop. Do not add `forwardRef` for new wrappers. If a wrapper needs an internal ref, pass it to `useRender`:

```tsx
const internalRef = useRef<HTMLParagraphElement | null>(null);

return useRender({
  defaultTagName: "p",
  ref: internalRef,
  render: props.render,
  props,
});
```

## Render Functions

When using `render={(props, state) => ...}`, the callback receives props that must be spread onto the rendered element. If you add extra props inside the callback, use `mergeProps`.

```tsx
<SomePart
  render={(props) => (
    <button {...mergeProps<"button">(props, { className: "rounded-md" })} />
  )}
/>
```

## Caution

- Prefer render elements (`render={<Button />}`) for normal composition.
- Function render props are useful but easy to get wrong because you own prop spreading.
- When a component may render a non-button element, avoid blindly setting button-only props like `type="button"` unless you know the default tag is a button.

# Base UI TypeScript

Source: <https://base-ui.com/react/handbook/typescript.md>.

Base UI namespaces expose prop, state, and event-detail types for their
parts. Prefer those exported types over hand-written approximations.

## Common Types

```tsx
import { Select } from "@base-ui/react/select";

type SelectRootProps = Select.Root.Props;
type SelectItemProps = Select.Item.Props;
type SelectItemState = Select.Item.State;
type ChangeDetails = Select.Root.ChangeEventDetails;
```

Use `Part.Props` for wrappers and `Part.State` for function-style
`className` state.

## Render Prop Types

For custom components used with `render`, use `useRender.ComponentProps`
when the wrapper needs to mirror a DOM element or component signature.

```tsx
import { useRender } from "@base-ui/react/use-render";

type TriggerProps = useRender.ComponentProps<"button">;
```

## Repo Rules

- Use Base UI exported prop types for primitive wrappers.
- Use `BaseUiClassName<State>` from `src/lib/base-ui-class-name.ts` when wrapping stateful class names.
- Do not pass function-style `className` into wrappers typed as `string` only.
- Keep wrapper props small and explicit when the component is a design-system primitive.
- Respect React 19 `ref` as a regular prop for new project components; do not add `forwardRef` by default.

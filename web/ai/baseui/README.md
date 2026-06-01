# Base UI Notes

Source index: <https://base-ui.com/llms.txt>.

These notes summarize Base UI behavior that matters when wrapping primitives in `src/components/ui/`. Treat the upstream docs as authoritative when these notes are incomplete.

## Files

- [`use-render.md`](./use-render.md) — render prop composition and `useRender` wrapper patterns.
- [`merge-props.md`](./merge-props.md) — safe prop merging, handler ordering, and `preventBaseUIHandler()`.
- [`providers.md`](./providers.md) — `CSPProvider` and `DirectionProvider`.
- [`styling.md`](./styling.md) — state attributes, CSS variables, and repo styling rules.
- [`animation.md`](./animation.md) — popup transition attributes and motion patterns.
- [`composition.md`](./composition.md) — `render` composition and wrapper rules.
- [`customization.md`](./customization.md) — change details, event cancellation, and behavior escape hatches.
- [`forms.md`](./forms.md) — names, labels, validation, and field state.
- [`typescript.md`](./typescript.md) — Base UI prop, state, and render prop types.

## Import Rule

Use `@base-ui/react` imports. The old `@base-ui-components/react` package name is stale.

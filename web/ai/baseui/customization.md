# Base UI Customization

Source: <https://base-ui.com/react/handbook/customization.md>.

Base UI exposes behavior through controlled props, change handlers, event
details, render props, and escape hatches for cancelling internal handling.

## Change Handlers

Many primitives call change handlers with the next value plus an event
details object:

```tsx
<Select value={value} onValueChange={(next, details) => setValue(next)} />
```

The details object can include a `reason` that explains why the state
changed. Some details objects expose `cancel()` to prevent Base UI's
internal state update.

## Event Flow

- `eventDetails.reason` identifies the user or programmatic cause when available.
- `eventDetails.cancel()` prevents the internal state change for cancellable events.
- `eventDetails.allowPropagation()` lets a normally stopped event bubble upward.
- `event.preventBaseUIHandler()` can skip Base UI's default event handler from a React synthetic event.

Use these sparingly. Most wrappers should expose the primitive props rather
than adding custom behavior.

## Render Customization

Use `render` when the DOM element or project component must change. Use
slot recipes when only styling changes. Prefer a narrow wrapper API over a
large prop matrix.

## Repo Guidance

- Preserve Base UI event detail arguments when wrapping handlers.
- Avoid replacing primitive behavior with local state unless the wrapper owns a real product pattern.
- Keep cancellation logic near the primitive that needs it.
- Do not add compatibility props for Radix names unless there is a concrete migration need.

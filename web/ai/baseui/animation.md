# Base UI Animation

Source: <https://base-ui.com/react/handbook/animation.md>.

Base UI supports animation through state data attributes. Prefer CSS
transitions for normal popups because they can be interrupted cleanly when
the user changes direction quickly.

## CSS Transition Pattern

```css
.Popup {
  transform-origin: var(--transform-origin);
  transition:
    opacity 150ms ease,
    transform 150ms ease;
}

.Popup[data-starting-style],
.Popup[data-ending-style] {
  opacity: 0;
  transform: scale(0.98);
}
```

Use `data-starting-style` for enter state and `data-ending-style` for exit
state. Base UI keeps the element mounted long enough for exit transitions
when the part supports it.

## Direction-Aware Motion

Use `data-side` for direction-aware transforms:

```css
.Popup[data-side="top"][data-starting-style] { transform: translateY(4px); }
.Popup[data-side="bottom"][data-starting-style] { transform: translateY(-4px); }
```

For scale animations, pair `transform-origin: var(--transform-origin)` with
small scale deltas so the popup appears to grow from the anchor.

## Data Attributes

- `data-starting-style` marks the initial enter frame.
- `data-ending-style` marks the exit frame.
- `data-instant` marks transitions that should skip animation.
- `data-side` and `data-align` describe popup placement.

## JavaScript Animation Libraries

Use a JS animation library only when CSS cannot express the interaction.
Control `open`, use `keepMounted` where needed, and compose popup parts via
`render` so Base UI still owns accessibility and focus behavior.

Select has special mounting behavior: it starts unmounted, then can remain
mounted after user interaction. Verify exit animations specifically when
wrapping Select popups.

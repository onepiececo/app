# Toolbar

Source: [`src/components/ui/toolbar.tsx`](../../src/components/ui/toolbar.tsx).
Base UI primitive: [Toolbar](https://base-ui.com/react/components/toolbar) — `@base-ui/react/toolbar`.

Styling is centralized in the exported slot recipe `toolbarVariants`.

## Anatomy

```
Toolbar.Root                  // role="toolbar"; arrow-key roving focus
├── Toolbar.Button            // toolbar-aware <button>
├── Toolbar.Link              // toolbar-aware <a>
├── Toolbar.Input             // toolbar-aware native input
├── Toolbar.Group             // logical grouping wrapper
└── Toolbar.Separator         // auto-orienting divider
```

Regular `Button` and `Toggle` work inside the toolbar too — they pick up
roving focus from the root.

## API reference

### `Toolbar.Root`

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `loopFocus` | `boolean` | `true` | Wraps arrow-key focus at edges. |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | |
| `disabled` | `boolean` | — | Disables every item. |
| `render` | `ReactElement \| function` | — | |

**Data attributes:** `data-orientation`, `data-disabled`.

### `Toolbar.Button` / `Toolbar.Input`

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `focusableWhenDisabled` | `boolean` | `true` | Keeps the item in the focus ring while disabled. |
| `disabled` | `boolean` | `false` | |
| `nativeButton` | `boolean` | `true` | (Button only.) |

**Data attributes:** `data-orientation`, `data-disabled`, `data-focusable`.

### `Toolbar.Group`

`disabled` cascades to children. **Data attributes:** `data-orientation`,
`data-disabled`.

### `Toolbar.Separator`

Pass `orientation="vertical"` for horizontal toolbars and vice versa —
the component does not auto-flip. **Data attributes:** `data-orientation`.

A real application toolbar — an `<div role="toolbar">` with **arrow-key
navigation between items** and proper screen-reader semantics. Use
for editor toolbars (Bold / Italic / Align...), application command
bars, or any horizontal/vertical row of controls that should behave
as a single composite widget.

The container is the same floating-glass chrome as `Menu` /
`Popover` — `rounded-xl bg-popover` with a tight soft drop shadow
(no border). Reads as part of the same family of floating surfaces.
Compose with `Toggle` for stateful items and regular `Button` for
one-shot actions.

## Parts

- `Toolbar` — root container. `role="toolbar"`. Manages arrow-key
  focus between focusable descendants.
- `ToolbarGroup` — wrapper for related items (e.g. "marks: B / I /
  U" together, "alignment: L / C / R" together). `flex items-center
  gap-1`.
- `ToolbarButton` — toolbar-aware button. Use base-ui's primitive if
  you need `<button>` semantics with the toolbar's focus management.
  Most of the time you can use a regular `Button` or `Toggle` inside
  `ToolbarGroup` directly.
- `ToolbarLink` — toolbar-aware link (`<a>` with the toolbar's focus
  management).
- `ToolbarInput` — input that participates in the toolbar's keyboard
  navigation (rare — most surfaces only need a single `Input` outside
  the toolbar).
- `ToolbarSeparator` — divider between groups. Auto-orients per
  toolbar orientation.
- `ToolbarPrimitive` — re-export of `@base-ui/react/toolbar`.

## Scenarios

### 1. Editor toolbar — marks + alignment

```tsx
const [marks, setMarks] = useState({ b: false, i: true, u: false });
const [align, setAlign] = useState<"left" | "center" | "right">("left");

<Toolbar>
  <ToolbarGroup>
    <Toggle aria-label="Bold" pressed={marks.b} onPressedChange={(v) => setMarks((m) => ({ ...m, b: v }))}>
      <BoldIcon />
    </Toggle>
    <Toggle aria-label="Italic" pressed={marks.i} onPressedChange={(v) => setMarks((m) => ({ ...m, i: v }))}>
      <ItalicIcon />
    </Toggle>
    <Toggle aria-label="Underline" pressed={marks.u} onPressedChange={(v) => setMarks((m) => ({ ...m, u: v }))}>
      <UnderlineIcon />
    </Toggle>
  </ToolbarGroup>

  <ToolbarSeparator orientation="vertical" />

  <ToolbarGroup>
    <Toggle aria-label="Align left" pressed={align === "left"} onPressedChange={(v) => v && setAlign("left")}>
      <AlignLeftIcon />
    </Toggle>
    <Toggle aria-label="Align center" pressed={align === "center"} onPressedChange={(v) => v && setAlign("center")}>
      <AlignCenterIcon />
    </Toggle>
    <Toggle aria-label="Align right" pressed={align === "right"} onPressedChange={(v) => v && setAlign("right")}>
      <AlignRightIcon />
    </Toggle>
  </ToolbarGroup>

  <ToolbarSeparator orientation="vertical" />

  <Button variant="ghost" size="sm">Save</Button>
</Toolbar>
```

Arrow-keys move focus between items. `Tab` enters the toolbar
once, then arrow-keys take over.

### 2. Vertical toolbar (editor side rail)

```tsx
<Toolbar orientation="vertical">
  <ToolbarGroup>
    <Toggle aria-label="Pen"><PenIcon /></Toggle>
    <Toggle aria-label="Brush"><BrushIcon /></Toggle>
    <Toggle aria-label="Eraser"><EraserIcon /></Toggle>
  </ToolbarGroup>
</Toolbar>
```

`ToolbarSeparator` flips to a horizontal divider automatically.

### 3. Compact toolbar — one group, no separators

```tsx
<Toolbar>
  <ToolbarGroup>
    <Button variant="ghost" size="sm">Undo</Button>
    <Button variant="ghost" size="sm">Redo</Button>
  </ToolbarGroup>
</Toolbar>
```

For a one-section toolbar, skip separators — the container alone
is enough visual grouping.

### 4. Anchored above an editor / canvas

```tsx
<div className="relative">
  <Toolbar className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full shadow-lg">
    …
  </Toolbar>
  <textarea className="w-full" />
</div>
```

Float the toolbar above the content region; bump the `shadow` for
floating-panel feel.

## Pitfalls

- **Don't nest a `Toolbar` inside another `Toolbar`.** The
  arrow-key handling intercepts focus and you'll end up with two
  composite widgets fighting for keyboard ownership.
- **Use `Toggle` for stateful items**, not `ToolbarButton`. Toggle
  has `pressed` / `onPressedChange` and the inset depression for
  the on state. `ToolbarButton` is just a stateless `<button>`
  that participates in the toolbar's focus management.
- **For horizontal toolbars, separators must be
  `orientation="vertical"`** to render as a vertical line between
  horizontal items. (Same for vertical toolbars + horizontal
  separators.) The component doesn't auto-flip the separator.

## Rules of thumb

- **Editor / canvas controls** → `Toolbar` (arrow-key nav matters).
- **Segmented control / one-of-N** → `ToggleGroup` (controlled
  value, arrow-key nav).
- **Group related items with `ToolbarGroup`** and split with
  `ToolbarSeparator` — the toolbar reads as logical sections,
  not just a flat list.
- **Toolbars are small** — keep them under 8 items per row, use
  overflow menus for the rest. Past that, consider a `Menu` /
  `Combobox` instead of cramming the toolbar.

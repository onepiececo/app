# Separator

Source: [`src/components/ui/separator.tsx`](../../src/components/ui/separator.tsx).
Base UI primitive: [Separator](https://base-ui.com/react/components/separator).

A 1px hairline divider in `bg-border`. Renders horizontal by default;
`orientation="vertical"` for a vertical line. **Pass children to render
a labeled separator** — the line splits and centers the label between
two hairlines (the classic "or" divider).

## Anatomy

Base UI ships a single part. Our `Separator` either renders the primitive
directly, or — when `children` are passed — wraps two primitives around
a label `<span>`:

```
Separator (single hairline)

— or —

<div data-slot="separator-with-label">
  Separator (data-slot="separator")
  <span> {children} </span>
  Separator (data-slot="separator")
</div>
```

## Parts

- `Separator` — the only export. `orientation` (`"horizontal" |
  "vertical"`, default `"horizontal"`) and optional `children`.
- `SeparatorPrimitive` — re-export of `@base-ui/react/separator`.

## API reference

### Base UI `Separator` props

| Prop | Type | Default |
| --- | --- | --- |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |
| `className` | `string \| ((state) => string)` | — |
| `style` | `CSSProperties \| ((state) => CSSProperties)` | — |
| `render` | `ReactElement \| ((props, state) => ReactElement)` | — |

### Data attributes

- `data-orientation` — mirrors the `orientation` prop. Use for
  orientation-specific styling (we key `h-px` / `w-px` and the
  `self-stretch` fallback off this).

## Scenarios

### 1. Plain horizontal

```tsx
<Separator />
```

Full-width 1px line in `bg-border`.

### 2. Plain vertical (e.g. between toolbar groups)

```tsx
<div className="flex items-center gap-3">
  <span>Search</span>
  <Separator orientation="vertical" className="h-4" />
  <span>Press ⌘K</span>
</div>
```

Vertical separators auto-stretch to `self-stretch` unless you pass
an `h-…` class — for inline rows like above, give it an explicit
height (`h-4`) so it doesn't try to fill the row.

### 3. Labeled (auth divider, "or with email")

```tsx
<Separator>or</Separator>
```

Renders:

```
─────────  OR  ─────────
```

The label is auto-uppercased + tracked via `tracking-wider` and
colored `text-muted-foreground`. Two `SeparatorPrimitive` hairlines
flank the label so it stays semantic.

### 4. Labeled vertical (rare — section dividers in a sidebar)

```tsx
<div className="flex h-40 items-center">
  <span>A</span>
  <Separator orientation="vertical">vs</Separator>
  <span>B</span>
</div>
```

Renders the label rotated-text-equivalent vertically (text stays
upright, hairlines run above and below).

### 5. Inside a Menu / Drawer item list

```tsx
<MenuPopup>
  <MenuItem>Edit</MenuItem>
  <MenuItem>Duplicate</MenuItem>
  <MenuSeparator />
  <MenuItem variant="destructive">Delete</MenuItem>
</MenuPopup>
```

Menu and Drawer ship their own separator primitives (`MenuSeparator`,
`DrawerMenuSeparator`) tuned for inset list layouts — use those
instead of `Separator` when inside their menus.

## Pitfalls

- **Vertical separators inside a flex row need `h-…`**. The default
  `self-stretch` only works when the parent has a fixed height. For
  inline rows (text + separator + text), pass `h-4` / `h-5` etc. to
  match the row content.
- **Labeled separators render a different DOM** (`<div>` wrapping
  two `<SeparatorPrimitive>`s + a label `<span>`). The wrapper has
  `data-slot="separator-with-label"`; the inner lines have
  `data-slot="separator"`. Style accordingly if you target via
  attribute.
- **Don't use Separator for menu / drawer rows.** Those have their
  own primitives with specific inset / outdent rules.

## Rules of thumb

- **Plain Separator** between sections of a panel that don't need
  any labeling.
- **Labeled Separator** for auth flows ("or"), pricing comparisons,
  or anywhere two distinct decision paths sit side-by-side.
- **Vertical Separator** between items in a horizontal toolbar /
  status bar — always pair with an explicit `h-…`.
- **Reach for the Menu / Drawer / Sheet's own separator primitive**
  when inside those containers; the dedicated ones know about list
  outdent and inset.

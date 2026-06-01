# Tabs

Source: [`src/components/ui/tabs.tsx`](../../src/components/ui/tabs.tsx).
Base UI primitive: [Tabs](https://base-ui.com/react/components/tabs).

Two promoted treatments from `/test` Round 4, both built from Base UI's
`Root` / `List` / `Tab` / `Indicator` / `Panel` parts:

- `ink` — default. Full-width baseline with a primary active rule.
- `inset` — input-like shell with a quiet raised active segment.

## Anatomy

```
Tabs (Root)
├── TabsList
│   ├── TabsTab        (×N — one per panel value)
│   └── (Indicator)    (rendered inside TabsList for us)
└── TabsPanel          (×N — keyed by `value`)
```

`TabsList` renders `TabsPrimitive.Indicator` automatically. The indicator
uses Base UI's `--active-tab-*` CSS variables for width, height, and
position, so active-state movement stays aligned to the selected tab.

## Variants

| Variant | Shape | When to use |
| --- | --- | --- |
| `ink` *(default)* | Full-width bottom border with a 2px primary active rule | Page or section navigation where the tab row should also divide the content below. Use with `fullWidth` for edge-to-edge rails. |
| `inset` | Rounded input-like shell with a quiet raised active segment | Local tabs inside cards, settings panels, dashboards, or compact product surfaces. |

## Parts

- `Tabs` — root. Accepts `orientation="horizontal" | "vertical"` (default horizontal).
- `TabsList` — container + indicator. Takes `variant` and `fullWidth`.
- `TabsTab` (aliased as `TabsTrigger`) — individual tab button.
- `TabsPanel` (aliased as `TabsContent`) — content area for a tab's value.

### `TabsList` props (project additions)

- `variant?: "ink" | "inset"` — defaults to `"ink"`.
- `fullWidth?: boolean` — when `true`, the list stretches to fill its horizontal container. For `ink`, this extends the bottom border past the tabs. Ignored in vertical orientation.

## API reference (Base UI)

### `Tabs` (Root) props

| Prop | Type | Default |
| --- | --- | --- |
| `value` / `defaultValue` | `Tabs.Tab.Value` (string \| number) | `0` |
| `onValueChange` | `(value, eventDetails) => void` | — |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |

Data attributes: `data-orientation`, `data-activation-direction`.

### `TabsList` props (Base UI)

| Prop | Type | Default |
| --- | --- | --- |
| `activateOnFocus` | `boolean` | `false` |
| `loopFocus` | `boolean` | `true` |

`activateOnFocus` flips arrow-key navigation between "focus only, activate
on Enter/Space" (default) and "auto-activate on focus".

### `TabsTab` props

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `Tabs.Tab.Value` | — |
| `disabled` | `boolean` | — |
| `nativeButton` | `boolean` | `true` |

Data attributes: `data-active`, `data-disabled`, `data-orientation`,
`data-activation-direction`. We key tab styling off `data-active` and
`data-[orientation=…]`.

### `TabsIndicator`

Rendered inside `TabsList`. Exposes CSS variables for the active tab's
geometry, which our variants animate against:

- `--active-tab-width`, `--active-tab-height`
- `--active-tab-left`, `--active-tab-right`
- `--active-tab-top`, `--active-tab-bottom`

Supports `renderBeforeHydration` to prevent SSR shifts.

### `TabsPanel` props

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `Tabs.Tab.Value` | — |
| `keepMounted` | `boolean` | `false` |

Data attributes: `data-hidden`, `data-index`, `data-starting-style`,
`data-ending-style`, `data-orientation`, `data-activation-direction`.

## Scenarios

### 1. Ink rail (default)

```tsx
<Tabs defaultValue="overview">
  <TabsList fullWidth>
    <TabsTab value="overview">Overview</TabsTab>
    <TabsTab value="activity">Activity</TabsTab>
    <TabsTab value="settings">Settings</TabsTab>
  </TabsList>
  <TabsPanel value="overview">…</TabsPanel>
  <TabsPanel value="activity">…</TabsPanel>
  <TabsPanel value="settings">…</TabsPanel>
</Tabs>
```

### 2. Inset slab

```tsx
<Tabs defaultValue="activity">
  <TabsList variant="inset">
    <TabsTab value="overview">Overview</TabsTab>
    <TabsTab value="activity">Activity</TabsTab>
    <TabsTab value="settings">Settings</TabsTab>
  </TabsList>
</Tabs>
```

### 3. Vertical ink navigation

```tsx
<Tabs defaultValue="overview" orientation="vertical">
  <TabsList>
    <TabsTab value="overview">Overview</TabsTab>
    <TabsTab value="activity">Activity</TabsTab>
    <TabsTab value="settings">Settings</TabsTab>
  </TabsList>
  <TabsPanel value="overview">…</TabsPanel>
</Tabs>
```

## Rules of thumb

- Default to `ink` for page-level or section navigation, especially when the tab row should double as a divider.
- Use `fullWidth` with `ink` when the rail should extend through unused horizontal space.
- Use `inset` for local controls inside cards, settings panels, and compact app surfaces.
- Do not recreate the discarded clip-path duplicated-text treatment. It was not robust enough for the primitive.
- Preview horizontal + vertical together whenever you change the Tabs component; it catches indicator regressions fast.

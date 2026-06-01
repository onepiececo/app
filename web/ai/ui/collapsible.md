# Collapsible

Source: [`src/components/ui/collapsible.tsx`](../../src/components/ui/collapsible.tsx).
Built on [`@base-ui/react/collapsible`](https://base-ui.com/react/components/collapsible).

A bare two-state container — show / hide a panel via a trigger.
Animates the panel's height from `0` → measured content height in
200ms. Headless by design — no chrome, no chevron, no padding. Bring
your own. Styling is exposed through the exported slot recipe
`collapsibleVariants`.

If you want a chrome-styled show/hide row (chevron + label + accent
hover + grouped panels), use `Accordion` instead — it's `Collapsible`
+ the system's accordion chrome layered on top.

This primitive also powers `SidebarMenuCollapsible` (the expandable
nav-row pattern in `src/components/ui/sidebar.tsx`) and `Accordion`
internally — the same data attrs / CSS var apply across all three.

## Anatomy

| Base UI | Project wrapper | Renders |
| --- | --- | --- |
| `Collapsible.Root` | `Collapsible` | `<div>` |
| `Collapsible.Trigger` | `CollapsibleTrigger` | `<button>` |
| `Collapsible.Panel` | `CollapsiblePanel` (alias `CollapsibleContent`) | `<div>` |

The recipe slots are `root`, `trigger`, and `panel`, matching the wrapper
anatomy and preserving the `data-slot` names.

## Parts

- `Collapsible` — root. Pass `open` / `onOpenChange` for controlled,
  or `defaultOpen` for uncontrolled.
- `CollapsibleTrigger` — the toggle. `cursor-pointer` baked in.
  Render whatever you want as children.
- `CollapsiblePanel` (alias `CollapsibleContent`) — the show/hide
  region. `overflow-hidden` + height transition driven by
  `--collapsible-panel-height` (set by base-ui via measurement).
- `CollapsiblePrimitive` — re-export of `@base-ui/react/collapsible`.
- `collapsibleVariants` — exported tailwind-variants slot recipe for the
  root, trigger, and panel classes.

## API reference

### Root props

| Prop | Type | Description |
| --- | --- | --- |
| `open` | `boolean` | Controlled open state. |
| `defaultOpen` | `boolean` | Uncontrolled initial state. Default `false`. |
| `onOpenChange` | `(open: boolean, details) => void` | Fires when state changes. |
| `disabled` | `boolean` | Disables trigger interaction. |
| `render` | `ReactElement \| (props, state) => ReactElement` | Swap the wrapper element. |

### Trigger props

| Prop | Type | Description |
| --- | --- | --- |
| `nativeButton` | `boolean` | Default `true`. Set `false` when rendering a non-button via `render`. |
| `render` | `ReactElement \| (props, state) => ReactElement` | Adopt e.g. a `Button` wrapper. |

### Panel props

| Prop | Type | Description |
| --- | --- | --- |
| `keepMounted` | `boolean` | Keep contents in DOM while closed. Default `false`. |
| `hiddenUntilFound` | `boolean` | Use `hidden="until-found"` so browser find-in-page expands the panel. Overrides `keepMounted`. |
| `render` | `ReactElement \| (props, state) => ReactElement` | Swap the panel element. |

### Data attributes — animation-critical

| Where | Attribute | When |
| --- | --- | --- |
| Trigger | `data-panel-open` | **Only present** while the panel is open — gate chevron rotation off this (`[&[data-panel-open]_svg]:rotate-90` or `[[data-panel-open]_&]:rotate-180`). |
| Panel | `data-open` | Panel is open. |
| Panel | `data-closed` | Panel is closed. |
| Panel | `data-starting-style` | Set during the opening transition (height: 0 → measured). |
| Panel | `data-ending-style` | Set during the closing transition (height: measured → 0). |

### CSS variables (set on Panel)

| Variable | Value |
| --- | --- |
| `--collapsible-panel-height` | Measured panel height. The project wrapper sets `h-(--collapsible-panel-height)` and uses `data-starting-style:h-0` / `data-ending-style:h-0` to drive the transition. |
| `--collapsible-panel-width` | Measured panel width (rarely needed — height is the typical animated axis). |

## Scenarios

### 1. Bare toggle

```tsx
<Collapsible>
  <CollapsibleTrigger className="text-sm underline">
    Show details
  </CollapsibleTrigger>
  <CollapsiblePanel className="pt-2 text-sm text-muted-foreground">
    Detailed content goes here.
  </CollapsiblePanel>
</Collapsible>
```

### 2. With a chevron + label trigger

```tsx
<Collapsible defaultOpen>
  <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium [&[data-panel-open]_svg]:rotate-90">
    <ChevronRightIcon className="size-4 transition-transform" />
    Advanced
  </CollapsibleTrigger>
  <CollapsiblePanel className="pt-3">
    <div className="flex flex-col gap-2">
      <Field>
        <FieldLabel>Custom domain</FieldLabel>
        <Input />
      </Field>
    </div>
  </CollapsiblePanel>
</Collapsible>
```

### 3. Controlled

```tsx
const [open, setOpen] = useState(false);

<Collapsible open={open} onOpenChange={setOpen}>
  <CollapsibleTrigger render={<Button variant="outline" />}>
    {open ? "Hide" : "Show"} payload
  </CollapsibleTrigger>
  <CollapsiblePanel className="pt-2">
    <pre className="rounded-md bg-muted p-3 text-xs">{JSON.stringify(payload, null, 2)}</pre>
  </CollapsiblePanel>
</Collapsible>
```

### 4. Filter row in a sidebar

```tsx
<Collapsible defaultOpen>
  <CollapsibleTrigger className="flex w-full items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
    Tags
    <ChevronDownIcon className="size-4 transition-transform [[data-panel-open]_&]:rotate-180" />
  </CollapsibleTrigger>
  <CollapsiblePanel className="pt-2">
    <CheckboxGroup>…</CheckboxGroup>
  </CollapsiblePanel>
</Collapsible>
```

## Pitfalls

- **The Panel is `overflow-hidden`.** Anything inside that needs to
  visually bleed out (popovers, tooltips, focus rings on the panel
  edge) has to escape the clip via Portal.
- **The animation is `transition-[height]`** with the height variable
  driven by base-ui's measurement. If your panel content includes
  images / async-loaded data that affect height, the transition can
  jump — pre-measure with skeletons or fixed-height placeholders.
- **`CollapsibleTrigger` is just a button** with `cursor-pointer`.
  No styling, no chevron. Compose with whatever you need.
- **Don't reach for Collapsible inside Accordion.** Accordion already
  manages a stack of Collapsibles internally.

## Rules of thumb

- **Use Collapsible for one-off "show more / less"** affordances —
  inline detail expanders, advanced settings sections, optional
  payload viewers.
- **Use Accordion for a stack of related items** — FAQ, settings
  groups, sectioned forms. Accordion gives you the chrome + the
  one-open-at-a-time logic; Collapsible is just a single toggle.
- **For sidebar filter sections** with a chevron + label header,
  Collapsible is the right primitive — Accordion's chrome is
  too heavy for sidebar use.
- **Always animate height changes**, not visibility. The height
  transition is what makes the panel feel like it's actually
  expanding rather than appearing.

# Combobox

Source: [`src/components/ui/combobox.tsx`](../../src/components/ui/combobox.tsx).
Base UI primitive: [Combobox](https://base-ui.com/react/components/combobox).

Combobox is the filterable list primitive — a text input (or trigger button)
paired with a popup of options that narrow as the user types. It shares the
same box-shadow ring + inset bezel + dark-gradient language as Input and
Select, so the four patterns below drop into forms without restyling.

> **Combobox vs Select.** Reach for `Select` when the option set is short
> (≤ 10–12 items) and there's nothing to filter on. Reach for `Combobox`
> when the list is long enough that a filter is helpful, or when the value
> itself is free-form text with suggestions. For multi-select, always use
> `Combobox` — `Select` is single-value by design.

## Anatomy

Styling is centralized in the exported slot recipe `comboboxVariants`; wrappers
consume recipe slots while preserving Base UI's `className` render-function
support where the primitive exposes state.

| Base UI part | Project wrapper | Notes |
| --- | --- | --- |
| `Combobox.Root` | `Combobox` | Wraps a context provider so `ComboboxPopup` can auto-anchor to `ComboboxChips`. |
| `Combobox.Input` | `ComboboxInput` (text-field anchor), `ComboboxChipsInput` (multi-select typing area) | `ComboboxInput` is wrapped in `Combobox.InputGroup` with optional trigger / clear / start addon. |
| `Combobox.InputGroup` | (used inside `ComboboxInput`) | — |
| `Combobox.Trigger` | `ComboboxTrigger` | Button-style anchor, or the chevron inside `ComboboxInput`. |
| `Combobox.Icon` | (used inside `ComboboxInput`'s trigger) | Wraps the chevron / icon. |
| `Combobox.Clear` | `ComboboxClear` | Reset selection. |
| `Combobox.Value` | `ComboboxValue` | Renders selected label or render-prop child. Fragment, no DOM element. |
| `Combobox.Chips` | `ComboboxChips` | Multi-select container. |
| `Combobox.Chip` | `ComboboxChip` | Selected-value chip — does **not** auto-render its remove button. |
| `Combobox.ChipRemove` | `ComboboxChipRemove` | The X button — must be nested manually. |
| `Combobox.Portal` | (used inside `ComboboxPopup`) | `portalProps` flow through. |
| `Combobox.Backdrop` | (re-export only via `ComboboxPrimitive`) | Optional overlay. |
| `Combobox.Positioner` | (used inside `ComboboxPopup`) | Owns `side` / `align` / `sideOffset` / `anchor`. |
| `Combobox.Popup` | `ComboboxPopup` | The styled popup container (Portal + Positioner + Popup). |
| `Combobox.Arrow` | (re-export only) | — |
| `Combobox.Status` | `ComboboxStatus` | Live-region status text (loading / counts). |
| `Combobox.Empty` | `ComboboxEmpty` | Empty-state copy. |
| `Combobox.List` | `ComboboxList` | Wrapped in `ScrollArea`. |
| `Combobox.Row` | `ComboboxRow` | Multi-column row layout escape hatch. |
| `Combobox.Collection` | `ComboboxCollection` | Iterates leaf items inside a group. |
| `Combobox.Group` | `ComboboxGroup` | Section wrapper. |
| `Combobox.GroupLabel` | `ComboboxGroupLabel` | Section header. |
| `Combobox.Item` | `ComboboxItem` | Single option; trailing checkmark auto-rendered via `ItemIndicator`. |
| `Combobox.ItemIndicator` | (used inside `ComboboxItem`) | Trailing check. |
| `Combobox.Separator` | `ComboboxSeparator` | Group divider. |
| `Combobox.useFilter` | `useComboboxFilter` | Hook for custom filter functions. |

## Parts

- `comboboxVariants` — exported Tailwind Variants recipe for the wrapper slots (`input`, `popup`, `item`, `chips`, `chip`, etc.).
- `Combobox` — root. Accepts Base UI's `items`, `multiple`, `itemToStringLabel`, `defaultValue`, `value`, `onValueChange`, etc.
- `ComboboxInput` — the text field variant of the anchor. Renders through our `Input` with the shared chrome. Props: `size`, `showTrigger` (chevron button, default `true`), `showClear`, `startAddon`, `triggerProps`, `clearProps`.
- `ComboboxChips` — the chips-container variant of the anchor (multi-select). Mirrors Input chrome; the chips and the typing area live inside. Use with `ComboboxValue` as a render prop.
- `ComboboxChipsInput` — the typing area inside a `ComboboxChips`. Zero horizontal padding on purpose — the container owns padding and the `gap-1` owns inter-chip spacing.
- `ComboboxChip` — a selected-value chip. Children are the label; nest `ComboboxChipRemove` for the dismiss button (not rendered automatically — avoids duplicate-X footgun).
- `ComboboxChipRemove` — the X button inside a chip.
- `ComboboxTrigger` — button-style anchor (used for searchable-select patterns where the trigger looks like a `SelectTrigger`). Combined with `ComboboxValue placeholder="…"` for the label.
- `ComboboxValue` — renders the selected label, the placeholder, or a render-prop on the current selection (used for multi-select chips).
- `ComboboxPopup` — portaled positioner + popup container. Takes `side`, `align`, `sideOffset`, `alignOffset`, `anchor`, `portalProps`.
- `ComboboxList` — the scrollable list area. Feed it a render function over the items.
- `ComboboxItem` — single option. Children are the label; the trailing checkmark is rendered automatically when this item's value matches the selection.
- `ComboboxGroup`, `ComboboxGroupLabel`, `ComboboxCollection` — for grouped items. The collection inside a group iterates the nested leaf items.
- `ComboboxEmpty` — copy shown when the filter matches nothing.
- `ComboboxSeparator` — thin divider between groups.
- `ComboboxClear` — explicit clear button (used automatically by `ComboboxInput showClear`).
- `ComboboxRow`, `ComboboxStatus`, `ComboboxPrimitive` — escape hatches re-exported from Base UI for scenarios the wrappers don't cover.

## API reference

### Root props

| Prop | Type | Description |
| --- | --- | --- |
| `items` | `T[] \| { items: T[]; label?: string }[]` | Source list. Required for SSR-safe filtering and for the `(item) => …` list render. |
| `value` / `defaultValue` | `T \| T[]` | Selection. Array shape when `multiple`. |
| `onValueChange` | `(value, details) => void` | Selection changed. |
| `multiple` | `boolean` | Multi-select mode (chips anchor). |
| `inputValue` / `defaultInputValue` | `string` | Controlled / uncontrolled filter text. |
| `onInputValueChange` | `(value, details) => void` | Filter text changed. |
| `open` / `defaultOpen` | `boolean` | Popup open state. |
| `onOpenChange` | `(open, details) => void` | — |
| `onOpenChangeComplete` | `(open) => void` | Fires after the open/close transition settles. |
| `filter` | `(item, query, itemToString) => boolean \| null` | Custom filter. Pass `null` to disable filtering. |
| `itemToStringLabel` | `(item) => string` | Map a leaf item to its display string (used for the input value after selection). |
| `itemToStringValue` | `(item) => string` | Map a leaf item to its underlying value. |
| `name` / `disabled` / `readOnly` / `required` | — | Standard form flags. |

### Input props (and ChipsInput)

| Prop | Type | Description |
| --- | --- | --- |
| `placeholder` | `string` | — |
| `disabled` | `boolean` | — |
| `render` | `ReactElement \| (props) => ReactElement` | The project's `ComboboxInput` uses `render={<Input nativeInput size={…} />}` to inherit Input chrome. |

### Trigger / Clear props

Both accept `disabled`, `render`, plus standard props. `Trigger` exposes
`data-popup-open` and `data-pressed`.

### Positioner / Popup props (passed through `ComboboxPopup`)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `side` | `"top" \| "right" \| "bottom" \| "left" \| "inline-end" \| "inline-start" \| "none"` | `"bottom"` | — |
| `align` | `"start" \| "center" \| "end"` | `"start"` | — |
| `sideOffset` | `number` | `4` | Gap from anchor. |
| `alignOffset` | `number` | — | Tangential offset. |
| `anchor` | `Element \| Ref \| (() => …)` | auto | Wrapper auto-anchors to the chips container in multi-select. |
| `portalProps` | `ComboboxPrimitive.Portal.Props` | — | `keepMounted`, `container`, etc. |

### Item / Group / List props

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `T` | The item this row represents. |
| `disabled` | `boolean` | Skip in keyboard nav, no selection. |
| `Group items` | `T[]` | Pass to `ComboboxGroup` so its `ComboboxCollection` can iterate the leaves. |

### Data attributes

| Where | Attribute | When |
| --- | --- | --- |
| Trigger | `data-popup-open` | Popup is open. |
| Trigger | `data-pressed` | Mouse/touch pressed or focus-visible (chrome hook). |
| Trigger | `data-placeholder` | No value selected — drive placeholder color from here (`ComboboxValue` is a fragment). |
| Item | `data-highlighted` | Keyboard / hover highlight. |
| Item | `data-selected` | Currently selected. |
| Item | `data-disabled` | — |
| List | `data-empty` | No items match the filter. |
| List | `data-has-overflow-y` | Set when content exceeds height (project wrapper uses `in-data-has-overflow-y:pe-3` for scrollbar gutter). |
| Popup | `data-starting-style` / `data-ending-style` | Enter/exit animation hooks. |
| Popup | `data-side` (`top`/`right`/`bottom`/`left`) | Direction-aware transforms. |

### CSS variables (on Positioner / Popup)

| Variable | Use |
| --- | --- |
| `--anchor-width` | Width of the input/trigger. Project popup uses `min-w-(--anchor-width)`. |
| `--available-width` | Max horizontal space before viewport clip. `max-w-(--available-width)`. |
| `--available-height` | Max vertical space. Wrapper sets `max-h-[min(var(--available-height),23rem)]`. |
| `--transform-origin` | Origin for scale/opacity enter animations. `origin-(--transform-origin)`. |
| `--input-container-height` | Height of an internal input row (popup-internal search pattern). |

## Scenarios

### 1. Single select — the common case

A filterable list of single values. The input displays the selected label, the chevron opens the popup.

```tsx
<Combobox items={FRUITS}>
  <ComboboxInput placeholder="Pick a fruit" className="w-64" />
  <ComboboxPopup>
    <ComboboxEmpty>No fruit matches that.</ComboboxEmpty>
    <ComboboxList>
      {(item: string) => (
        <ComboboxItem key={item} value={item}>
          {item}
        </ComboboxItem>
      )}
    </ComboboxList>
  </ComboboxPopup>
</Combobox>
```

### 2. Multi-select — chips inside the anchor

`ComboboxChips` is the multi-select anchor. Selected values render as chips via `ComboboxValue`'s render prop; the typing area (`ComboboxChipsInput`) sits flush between chips. The placeholder only appears while nothing is selected.

```tsx
<Combobox items={FRUITS} multiple>
  <ComboboxChips className="w-72">
    <ComboboxValue>
      {(selected: string[]) => (
        <>
          {selected.map((value) => (
            <ComboboxChip key={value}>
              {value}
              <ComboboxChipRemove />
            </ComboboxChip>
          ))}
          <ComboboxChipsInput
            placeholder={selected.length === 0 ? "Add fruits" : ""}
          />
        </>
      )}
    </ComboboxValue>
  </ComboboxChips>
  <ComboboxPopup>
    <ComboboxEmpty>No more fruits.</ComboboxEmpty>
    <ComboboxList>
      {(item: string) => (
        <ComboboxItem key={item} value={item}>
          {item}
        </ComboboxItem>
      )}
    </ComboboxList>
  </ComboboxPopup>
</Combobox>
```

**Alignment rule.** `ComboboxChipsInput` ships with no horizontal padding. The container (`ComboboxChips`) owns `px-[calc(--spacing(3)-1px)]` so the first chip and the typing placeholder line up with an `Input` cursor. Don't add `ps-*` back to the input — you'll break the flush feel between chips and the caret.

### 3. Searchable select — button trigger + popup-internal search

When the list is long enough that the value itself shouldn't be a free-form text field, but a filter is still helpful, render the anchor as a trigger button (like `SelectTrigger`) and put a search input inside the popup. This is the Base UI "searchable select" pattern.

```tsx
const TRIGGER_CLASSES =
  "relative inline-flex min-h-9 w-64 select-none items-center justify-between gap-2 rounded-lg bg-background not-dark:bg-clip-padding px-[calc(--spacing(3)-1px)] text-left text-base text-foreground data-placeholder:text-muted-foreground/72 outline-none transition-shadow shadow-[0_0_0_1px_color-mix(in_srgb,var(--foreground)_24%,var(--background)),0_1px_2px_rgb(0_0_0/0.05)] inset-shadow-[0_1px_0_rgb(255_255_255/0.3),0_-1px_0_rgb(0_0_0/0.04)] focus-visible:shadow-[0_0_0_1px_var(--ring),0_0_0_3px_color-mix(in_srgb,var(--ring)_24%,transparent)] focus-visible:inset-shadow-none data-pressed:shadow-[0_0_0_1px_var(--ring),0_0_0_3px_color-mix(in_srgb,var(--ring)_24%,transparent)] data-pressed:inset-shadow-none sm:min-h-8 sm:text-sm dark:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--foreground)_7%,var(--background)),color-mix(in_srgb,var(--foreground)_1%,var(--background)))] dark:shadow-[0_0_0_1px_rgb(0_0_0/0.4),0_1px_2px_rgb(0_0_0/0.2)] dark:inset-shadow-[0_1px_0_rgb(255_255_255/0.08),0_-1px_0_rgb(0_0_0/0.12)] dark:focus-visible:shadow-[0_0_0_1px_var(--ring),0_0_0_3px_color-mix(in_srgb,var(--ring)_28%,transparent)] dark:data-pressed:shadow-[0_0_0_1px_var(--ring),0_0_0_3px_color-mix(in_srgb,var(--ring)_28%,transparent)]";

<Combobox items={COUNTRIES}>
  <ComboboxTrigger className={TRIGGER_CLASSES}>
    <ComboboxValue placeholder="Select country" />
    <ChevronsUpDownIcon className="size-4 opacity-80" />
  </ComboboxTrigger>
  <ComboboxPopup>
    <div className="border-b border-border p-2">
      <ComboboxPrimitive.Input
        placeholder="Search country…"
        render={<Input className="w-full" nativeInput size="sm" />}
      />
    </div>
    <ComboboxEmpty>No country matches.</ComboboxEmpty>
    <ComboboxList>
      {(item: string) => (
        <ComboboxItem key={item} value={item}>
          {item}
        </ComboboxItem>
      )}
    </ComboboxList>
  </ComboboxPopup>
</Combobox>
```

**Placeholder color.** `ComboboxValue` renders as a fragment (no DOM element), so the placeholder text inherits the trigger's color. Base UI adds `data-placeholder` to `ComboboxTrigger` while nothing is selected — the `TRIGGER_CLASSES` above use `data-placeholder:text-muted-foreground/72` so the label drops to the muted tone before a selection and flips to `text-foreground` after.

### 4. Grouped — labelled sections inside the popup

```tsx
type FruitItem = { label: string; value: string };
type FruitGroup = { label: string; items: FruitItem[] };

<Combobox
  items={FRUIT_GROUPS}
  itemToStringLabel={(item: FruitItem) => item.label}
>
  <ComboboxInput placeholder="Pick a fruit" className="w-64" />
  <ComboboxPopup>
    <ComboboxEmpty>Nothing matches.</ComboboxEmpty>
    <ComboboxList>
      {(group: FruitGroup) => (
        <ComboboxGroup key={group.label} items={group.items}>
          <ComboboxGroupLabel>{group.label}</ComboboxGroupLabel>
          <ComboboxCollection>
            {(item: FruitItem) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxCollection>
        </ComboboxGroup>
      )}
    </ComboboxList>
  </ComboboxPopup>
</Combobox>
```

`itemToStringLabel` is called with the **selected leaf item** (a `FruitItem`), not with a group — that's how the input shows `"Lemon"` after selection instead of going blank.

## Rules of thumb

- The selected-item checkmark is trailing (`col-start-2` inside `ComboboxItem`). Don't re-add a leading indicator; keep the label left-aligned and let the check trail.
- For multi-select, keep `ComboboxChipsInput` unpadded — the container owns `px-[calc(--spacing(3)-1px)]` so the first chip and the caret align with an `Input` cursor.
- `ComboboxChip` does **not** auto-render its remove button. Nest `<ComboboxChipRemove />` inside — rendering your own on top of an auto one doubles the X.
- For searchable-select triggers, add `data-placeholder:text-muted-foreground/72` to your trigger classes — `ComboboxValue` is a fragment, so the placeholder color has to come from the trigger.
- Prefer `Select` when the list is short enough that filtering would be pure friction. Use `Combobox` as soon as search pays for itself, and always for multi-select.

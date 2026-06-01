# Autocomplete

Source: [`src/components/ui/autocomplete.tsx`](../../src/components/ui/autocomplete.tsx).
Built on [`@base-ui/react/autocomplete`](https://base-ui.com/react/components/autocomplete).

A text input that opens a filtering popup of suggestions as the user
types. The input value can be any free-form text — suggestions only
*optionally* autocomplete what's typed, they don't constrain it.

The popup wears the **floating-glass chrome** (Menu-matched —
`rounded-lg bg-popover` + tight soft drop, no border) with an
origin-aware scale animation per the popup-animation principles.

## Usage guidelines

- **Avoid when selection state is needed.** If the value must be
  remembered as an item (not free-form text) and can't be a custom
  string the user typed, use [`Combobox`](./combobox.md) instead. The
  TL;DR: **Autocomplete = type-anything-with-hints**, **Combobox =
  pick-from-list-maybe-via-typing**.
- **Use it as a filterable command picker.** When the input is paired
  with action items (each `AutocompleteItem` runs an `onClick` instead
  of selecting a value), the result is a small command bar. The
  larger ⌘K palette is built on this exact pattern — see
  [`Command`](./command.md), which is `<Autocomplete inline open>`
  under the hood.
- **Form controls must have an accessible name.** Wrap the input in a
  `<Field>` with a `<FieldLabel>` (preferred — also wires up
  `<FieldDescription>` and `<FieldError>` for free), or attach a plain
  `<label htmlFor=…>`. See the [forms guide](./form.md). A bare
  `AutocompleteInput` with only a `placeholder` is **not** accessibly
  labeled.

## Anatomy / Parts

| Base UI part | Project wrapper | Notes |
| --- | --- | --- |
| `Autocomplete.Root` | `Autocomplete` | Owns open / filter / selection. Pass `items`. |
| `Autocomplete.InputGroup` | (rendered inside `AutocompleteInput`) | Wraps input + addon + clear/trigger buttons. |
| `Autocomplete.Input` | `AutocompleteInput` | Wears the `Input` chrome. `startAddon`, `showClear`, `showTrigger`. |
| `Autocomplete.Trigger` | `AutocompleteTrigger` | Optional manual toggle (input opens on focus by default). |
| `Autocomplete.Icon` | (used inside default trigger) | Decorative chevron. |
| `Autocomplete.Clear` | `AutocompleteClear` | `×` button. |
| `Autocomplete.Value` | `AutocompleteValue` | Read-only render of the typed value. |
| `Autocomplete.Portal` | (used by `AutocompletePopup`) | Pass through via `portalProps`. |
| `Autocomplete.Positioner` | (used by `AutocompletePopup`) | Configured via `side` / `align` / `sideOffset` / `anchor`. |
| `Autocomplete.Popup` | `AutocompletePopup` | Floating-glass chrome (`rounded-lg`). |
| `Autocomplete.List` | `AutocompleteList` | Render-fn child; wrapped in `ScrollArea`. |
| `Autocomplete.Item` | `AutocompleteItem` | Row. `data-highlighted:bg-accent`. |
| `Autocomplete.Group` / `.GroupLabel` | `AutocompleteGroup` / `AutocompleteGroupLabel` | Sectioned lists. |
| `Autocomplete.Separator` | `AutocompleteSeparator` | Hairline between items. |
| `Autocomplete.Empty` | `AutocompleteEmpty` | Renders when filter returns zero matches. |
| `Autocomplete.Status` | `AutocompleteStatus` | Result-count / loading row. |
| `Autocomplete.Collection` | `AutocompleteCollection` | Wraps dynamic item subtrees. |
| `Autocomplete.Row` | `AutocompleteRow` | Multi-column row container. |
| `Autocomplete.useFilter` | `useAutocompleteFilter` | Hook returning `{ contains, startsWith }`. |

## API reference

### `Autocomplete` (Root)

| Prop | Type | Notes |
| --- | --- | --- |
| `items` | `T[]` | Master list (filtered subset is rendered via `AutocompleteList`). |
| `value` / `defaultValue` | `string` | Controlled / uncontrolled input string. |
| `onValueChange` | `(value, details) => void` | Fires on input change. |
| `open` / `defaultOpen` | `boolean` | Controlled / uncontrolled popup visibility. |
| `onOpenChange` | `(open, details) => void` | — |
| `mode` | `"list" \| "both" \| "inline" \| "none"` | How suggestions surface (inline ghost vs popup vs both). |
| `autoHighlight` | `boolean \| "always" \| "auto-strict" \| "off"` | Pre-highlight behavior — see scenario 3. |
| `keepHighlight` | `boolean` (default `true`) | Don't reset highlight on every keystroke. |
| `highlightItemOnHover` | `boolean` | Move highlight when the mouse enters an item. |
| `limit` | `number` | Cap items rendered after filtering. |
| `filter` | `(items, query) => items \| null` | Custom matcher (fuzzy, etc). |
| `itemToStringValue` | `(item) => string` | Extract the string committed to the input. |
| `inline` | `boolean` | Render the list flat (no portal) — powers `Command`. |

### `AutocompleteInput`

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `size` | `"sm" \| "default" \| "lg" \| number` | `"default"` | Forwarded to the underlying `Input`. |
| `startAddon` | `ReactNode` | — | Decorative leading icon (auto-sized). |
| `showTrigger` | `boolean` | `false` | Render a chevron toggle on the right. |
| `showClear` | `boolean` | `false` | Render an `×` clear button on the right. |
| `triggerProps` / `clearProps` | base-ui props | — | Pass-through. |
| (other `Autocomplete.Input.Props`) | | | `placeholder`, `disabled`, etc. |

Data attrs on `Autocomplete.Input`: `data-highlighted` while focused.

### `AutocompletePopup`

Bundles `Portal → Positioner → Popup`.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` | — |
| `align` | `"start" \| "center" \| "end"` | `"start"` | — |
| `sideOffset` | `number` | `4` | Gap from the input. |
| `alignOffset` | `number` | — | — |
| `anchor` | `Element \| RefObject \| fn` | input | Anchor override. |
| `portalProps` | `Autocomplete.Portal.Props` | — | E.g. `keepMounted`, `container`. |

CSS vars on the popup: `--anchor-width`, `--available-width`,
`--available-height`, `--transform-origin` (already wired into the chrome).

### `AutocompleteItem`

| Prop | Type | Notes |
| --- | --- | --- |
| `value` | `T` | The item data; `null` to render a non-selectable row. |
| `disabled` | `boolean` | — |
| `onClick` | `(event) => void` | For action-picker scenarios. |

Data attrs: `data-highlighted` (keyboard focus), `data-disabled`.

## Scenarios

### 1. Basic — city picker

```tsx
<Field>
  <FieldLabel>City</FieldLabel>
  <Autocomplete items={CITIES}>
    <AutocompleteInput placeholder="Search a city…" />
    <AutocompletePopup>
      <AutocompleteEmpty>No matching cities.</AutocompleteEmpty>
      <AutocompleteList>
        {(item: string) => (
          <AutocompleteItem key={item} value={item}>
            <MapPinIcon />
            {item}
          </AutocompleteItem>
        )}
      </AutocompleteList>
    </AutocompletePopup>
  </Autocomplete>
  <FieldDescription>
    Free-form text — type anything, suggestions only autocomplete what
    you're typing.
  </FieldDescription>
</Field>
```

### 2. With Field + description + error

```tsx
<Field>
  <FieldLabel>Recipient</FieldLabel>
  <Autocomplete items={contacts}>
    <AutocompleteInput placeholder="Type a name or email…" />
    <AutocompletePopup>
      <AutocompleteList>
        {(c) => (
          <AutocompleteItem key={c.id} value={c.email}>
            <Avatar size="xs" tone={avatarToneFromSeed(c.name)}>
              <AvatarFallback>{c.initials}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{c.name}</span>
            <span className="ms-auto text-xs text-muted-foreground">{c.email}</span>
          </AutocompleteItem>
        )}
      </AutocompleteList>
    </AutocompletePopup>
  </Autocomplete>
  <FieldDescription>We never share addresses.</FieldDescription>
  <FieldError>Pick a contact or type a valid email.</FieldError>
</Field>
```

### 3. Auto-highlight modes

```tsx
{/* Default: always highlight first match. Press ↵ to accept. */}
<Autocomplete items={items} autoHighlight="always">…</Autocomplete>

{/* Strict: only highlight if input is a prefix of an item. */}
<Autocomplete items={items} autoHighlight="auto-strict">…</Autocomplete>

{/* Off: nothing is highlighted until the user uses ↑↓. */}
<Autocomplete items={items} autoHighlight="off">…</Autocomplete>
```

`autoHighlight` controls whether the first matching item is
pre-highlighted as the user types. Pair with `keepHighlight={true}`
(default) so the highlighted index doesn't reset on every keystroke.

**When to pick which:**

- `"always"` — best for "search-and-pick" flows (city picker, contact
  picker). Pressing ↵ commits the suggestion.
- `"auto-strict"` — best when you want autocomplete-only behavior
  (the suggestion only kicks in if it actually matches the prefix).
- `"off"` — best when free-form text is the primary intent and the
  suggestions are advisory (e.g. tag input where you usually type a
  brand-new tag).

### 4. Limit results

```tsx
<Autocomplete items={ALL_PROJECTS} limit={50}>
  <AutocompleteInput placeholder="Search projects…" />
  <AutocompletePopup>
    <AutocompleteList>{(p) => <AutocompleteItem … />}</AutocompleteList>
    <AutocompleteStatus>
      {ALL_PROJECTS.length > 50 ? `Showing 50 of ${ALL_PROJECTS.length}` : null}
    </AutocompleteStatus>
  </AutocompletePopup>
</Autocomplete>
```

`limit` caps the number of items rendered after filtering. Use this
for very large lists (1000+ items) — the popup stays snappy and the
user sees the most relevant matches first. Pair with
`AutocompleteStatus` to communicate that the list is truncated.

### 5. Fuzzy matching (custom filter)

Base-ui filters with a contains-match by default (case-insensitive
substring). For fuzzy / multi-token / weighted matching, plug in a
custom filter via `filter`:

```tsx
import { matchSorter } from "match-sorter";

<Autocomplete
  items={projects}
  filter={(items, query) =>
    query.length === 0
      ? items
      : matchSorter(items, query, { keys: ["name", "tags"] })
  }
>
  …
</Autocomplete>
```

A custom `filter` receives `(items, query)` and returns the filtered
subset. Base-ui hands you the raw inputs — sort, score, fuzzy-match,
or use a vector index, whatever you need. Common libraries:
[`match-sorter`](https://github.com/kentcdodds/match-sorter) (good
default), [`fuzzysort`](https://github.com/farzher/fuzzysort) (faster
on large lists), [`Fuse.js`](https://www.fusejs.io/) (more featureful).

For very small lists (< 30 items), the default contains-match is
usually enough — don't reach for a fuzzy library before you measure.

### 6. As a filterable action picker (mini command bar)

```tsx
<Autocomplete items={ACTIONS}>
  <AutocompleteInput placeholder="Run a command…" startAddon={<SearchIcon />} />
  <AutocompletePopup>
    <AutocompleteList>
      {(action: Action) => (
        <AutocompleteItem
          key={action.id}
          value={action.id}
          onClick={() => action.run()}
        >
          {action.icon}
          {action.label}
          <kbd className="ms-auto text-xs text-muted-foreground">{action.shortcut}</kbd>
        </AutocompleteItem>
      )}
    </AutocompleteList>
  </AutocompletePopup>
</Autocomplete>
```

Each item runs an `onClick` instead of selecting a value. For the
full-featured ⌘K palette (Dialog wrapper + ⌘/ hint pill + footer
keyboard map + leading-icon chips), use [`Command`](./command.md) —
which is built on this same pattern.

### 7. Inline mode

```tsx
<Autocomplete items={items} inline open>
  <AutocompleteInput placeholder="Filter…" />
  <AutocompleteList>{(item) => <AutocompleteItem … />}</AutocompleteList>
</Autocomplete>
```

`inline` renders the list flat (no portal) and `open` keeps it open
permanently. This is the underlying mode that powers `Command`. Use
when you want the suggestions to live inline in your layout instead
of as a floating popup.

### 8. Empty state

```tsx
<AutocompletePopup>
  <AutocompleteEmpty>
    <div className="flex flex-col items-center gap-2 py-2">
      <span className="text-sm font-medium">No matches</span>
      <span className="text-xs text-muted-foreground">
        Try a different keyword.
      </span>
    </div>
  </AutocompleteEmpty>
  <AutocompleteList>…</AutocompleteList>
</AutocompletePopup>
```

`AutocompleteEmpty` renders when the filtered list is empty. Pair
with `AutocompleteStatus` for "showing N of M" hints when the list
is truncated by `limit`.

## Pitfalls

- **`Autocomplete` ≠ `Combobox`.** This is the most common mistake.
  Autocomplete's value is **the input string** — not a selected item
  reference. If you want a structured selection that can't be
  arbitrary text (timezones, currencies, users), reach for `Combobox`.
- **`AutocompleteInput` needs a label.** A `placeholder` is **not** a
  label. Wrap in `<Field><FieldLabel>` (preferred) or pass an `id`
  and pair with `<label htmlFor>`.
- **`AutocompleteList` takes a render function**, not children — the
  list of items comes from `Autocomplete`'s `items` prop, not from
  composed JSX. Children-as-items can hydration-mismatch with SSR.
- **Updating `Autocomplete`'s popup chrome doesn't affect Combobox or
  Command.** They each maintain their own popup chrome — Combobox
  still uses the older bordered + `::before` chrome (separate
  decision); Command uses its own floating-glass at `rounded-2xl`.
- **`autoHighlight="always"` + free-form intent feels weird.** If
  the user is going to type a brand-new value most of the time (e.g.
  tag input), highlighting the first suggestion makes ↵ silently
  commit a suggestion they didn't mean to pick. Use
  `autoHighlight="off"` for free-form-first inputs.
- **`AutocompleteEmpty` and `AutocompleteList` are siblings.** The
  empty state isn't *inside* the list — it's rendered by the popup
  when the filter returns zero items. Putting empty inside list
  causes layout glitches.
- **`limit` filters before render**, so users with very specific
  searches never see all results. Always pair with
  `AutocompleteStatus` (or a similar hint) to tell them the list is
  truncated.
- **Don't put complex interactive children in items.** Each
  `AutocompleteItem` is selectable — a Button or Input inside it
  fights for click handling. If you need actions on a row, put them
  on the right slot but trigger via the item's own `onClick` /
  `onSelect`, or split into separate rows.

## Rules of thumb

- **Default popup chrome is the floating-glass** family — same as
  `Menu`, `Popover`, `Tooltip`, `Toolbar`, `Command`. Don't override
  unless the design has a deliberate reason.
- **`autoHighlight="always"` + `keepHighlight={true}`** are the right
  defaults for search-and-pick UIs. ↑↓ navigates, ↵ commits the
  highlighted item, Esc closes.
- **For lists under ~30 items**, skip `limit` and skip a custom
  `filter`. Base-ui's contains-match is fast enough and the user
  can scan the whole list anyway.
- **For lists over ~500 items**, use both `limit` (cap rendered rows)
  and a custom fuzzy `filter` (better relevance ordering). Show the
  truncation hint via `AutocompleteStatus`.
- **Use `Field`** for every Autocomplete in a form. Free
  `FieldDescription` + `FieldError` accessibility wiring is the win.
- **For ⌘K-style palettes, use `Command`**, not raw Autocomplete.
  Command bundles the modal shell, ⌘/ hint pill, footer keyboard map,
  icon chips, and the inline+open mode behind a single component.

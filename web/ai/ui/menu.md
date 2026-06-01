# Menu

Source: [`src/components/ui/menu.tsx`](../../src/components/ui/menu.tsx).
Base UI primitives:
[Menu](https://base-ui.com/react/components/menu) (standard dropdown),
[Context Menu](https://base-ui.com/react/components/context-menu)
(right-click / long-press), and
[Menubar](https://base-ui.com/react/components/menubar) (horizontal
menu strip — File / Edit / View).

Dropdown menu on the floating-glass surface — `bg-popover` with a tight
soft drop shadow (no border), origin-aware scale-from-trigger animation
(see [popup animation principles](#animation-principles)), lucide icons
on the left of items, and right-aligned check indicators on
`MenuCheckboxItem` / `MenuRadioItem` to mirror Select's selected-row
treatment.

## When to reach for which primitive

- **`Menu`** — the default dropdown opened from a button trigger
  (toolbars, row actions, account menus). This file documents Menu.
- **`Context Menu`** (base-ui `ContextMenu`) — right-click / long-press
  surface. Trigger is a region, popup positions at the pointer
  coordinates rather than against a button. Same `Item` /
  `CheckboxItem` / `RadioGroup` / `SubmenuRoot` parts as Menu — adopt
  the same chrome via `data-slot`.
- **`Menubar`** (base-ui `Menubar`) — horizontal strip wrapping
  multiple `Menu.Root` instances (classic File/Edit/View). Adds
  `loopFocus`, `orientation`, and `data-has-submenu-open`. Triggers
  are siblings; moving across them auto-opens the next menu.

This repo currently only ships wrappers for `Menu`. For Context Menu
or Menubar usage, import from `@base-ui/react/context-menu` /
`@base-ui/react/menubar` and reuse `MenuPopup` / `MenuItem` chrome
classes when building wrappers.

## Anatomy

Project wrappers map onto base-ui parts:

| Wrapper | Base UI part |
| --- | --- |
| `Menu` (alias `DropdownMenu`) | `Menu.Root` |
| `MenuTrigger` | `Menu.Trigger` |
| `MenuPortal` | `Menu.Portal` |
| `MenuPopup` | `Menu.Portal` + `Menu.Backdrop` + `Menu.Positioner` + `Menu.Popup` (collapsed) |
| `MenuItem` | `Menu.Item` |
| `MenuCheckboxItem` | `Menu.CheckboxItem` (+ `CheckboxItemIndicator`) |
| `MenuRadioGroup` / `MenuRadioItem` | `Menu.RadioGroup` / `Menu.RadioItem` (+ `RadioItemIndicator`) |
| `MenuGroup` / `MenuGroupLabel` | `Menu.Group` / `Menu.GroupLabel` |
| `MenuSeparator` | `Menu.Separator` |
| `MenuSub` / `MenuSubTrigger` / `MenuSubPopup` | `Menu.SubmenuRoot` / `Menu.SubmenuTrigger` (+ wrapped Positioner+Popup) |
| `MenuShortcut` | `<kbd>` (project) |

Base-ui also exposes `Menu.LinkItem` (anchor variant), `Menu.Arrow`
(directional pointer), and `Menu.Viewport` (scrollable container for
long lists) — not currently wrapped here; reach for the primitive
directly when needed.

## API reference

`Menu` (Root):
- `open` / `defaultOpen` / `onOpenChange`
- `modal: boolean` — block outside interaction (default `true` when
  not nested under another menu).
- `handle` — created via `MenuCreateHandle()` to share one popup
  across detached triggers. Render as `{({ payload }) => …}` on the
  Root, not the Popup.

`MenuTrigger`:
- `openOnHover: boolean` — open on hover (toolbar / nav menus).
- `delay: number` — hover delay ms (default ~100).
- `render={<Button … />}` — adopt button semantics.

`MenuPopup` (also accepts Positioner props pass-through):
- `side: "top" | "right" | "bottom" | "left" | "inline-start" | "inline-end"`
- `align: "start" | "center" | "end"`
- `sideOffset` / `alignOffset: number`
- `anchor` — anchor element / virtual anchor / pointer.
- `portalProps` — `keepMounted`, `container`.

`MenuItem`:
- `closeOnClick: boolean` — default `true`.
- `disabled`, `onClick` (use `onClick`, **not** `onSelect`).

`MenuCheckboxItem` / `MenuRadioItem`:
- `checked` / `defaultChecked` / `onCheckedChange`
- `value` (RadioItem only)
- `closeOnClick: boolean` — default `true`.

Key data attributes:
- `data-highlighted` — current keyboard / hover focus.
- `data-disabled` — disabled item.
- `data-popup-open` — set on trigger while open.
- `data-side` — `top` / `right` / `bottom` / `left` for direction-aware transforms.
- `data-starting-style` / `data-ending-style` — enter / exit hooks.
- `data-instant` — skip animation (e.g. provider-grouped re-opens).
- `data-checked` — set on checked CheckboxItem / RadioItem.

## Parts

- `Menu` — root (alias: `DropdownMenu`).
- `MenuTrigger` — opens the menu (alias: `DropdownMenuTrigger`). Use
  `render={<Button variant="…" />}` to adopt button semantics.
- `MenuPopup` — the floating popover. Wraps Portal + Positioner + Popup
  internally. Accepts `side`, `align`, `sideOffset`, `alignOffset`,
  `anchor`, and `portalProps` for positioning escape hatches.
- `MenuItem` — interactive row. `variant="default" | "destructive"`.
- `MenuCheckboxItem` — toggleable row. `variant="default" | "switch"`.
  Default renders a right-aligned check icon when checked. Switch
  renders an inline pill toggle.
- `MenuRadioGroup` + `MenuRadioItem` — single-selection group with the
  same right-aligned check indicator as the default checkbox.
- `MenuGroup` + `MenuGroupLabel` — accessible grouping with a small
  muted heading.
- `MenuSeparator` — hairline divider with an outdent that bleeds to the
  popup edge.
- `MenuShortcut` — `<kbd>` rendered with `ms-auto` so it slots into the
  right column of an item next to other right-aligned content.
- `MenuSub` + `MenuSubTrigger` + `MenuSubPopup` — nested submenus. The
  trigger renders a chevron on the right; the popup uses the same
  chrome as the parent.
- Aliases (drop-in `DropdownMenu*` API): every component above is also
  re-exported under its `DropdownMenu*` name.

## Scenarios

### 1. Basic menu with an outline trigger

```tsx
<Menu>
  <MenuTrigger render={<Button variant="outline">Open menu</Button>} />
  <MenuPopup>
    <MenuItem>Profile</MenuItem>
    <MenuItem>Billing</MenuItem>
    <MenuItem>Team</MenuItem>
  </MenuPopup>
</Menu>
```

### 2. Items with icons + keyboard shortcuts

```tsx
<MenuPopup>
  <MenuItem>
    <PlayIcon aria-hidden />
    Play
    <MenuShortcut>⌘P</MenuShortcut>
  </MenuItem>
  <MenuItem disabled>
    <PauseIcon aria-hidden />
    Pause
    <MenuShortcut>⇧⌘P</MenuShortcut>
  </MenuItem>
</MenuPopup>
```

`MenuShortcut` uses `ms-auto`, so the kbd lives in the same right
column as the check / chevron / value indicators.

### 3. Checkboxes with right-aligned check (Select-style)

```tsx
<MenuPopup>
  <MenuCheckboxItem defaultChecked>
    <ShuffleIcon aria-hidden />
    Shuffle
  </MenuCheckboxItem>
  <MenuCheckboxItem>
    <RepeatIcon aria-hidden />
    Repeat
  </MenuCheckboxItem>
</MenuPopup>
```

The lucide icon goes on the left, the label is in the middle, the
check renders on the right when checked. Empty space on the right
when unchecked. **Don't put the check on the left** — that's the
shadcn / Radix default and we explicitly moved it to the right to
match Select.

### 4. Switch-styled checkbox (for settings)

```tsx
<MenuPopup>
  <MenuCheckboxItem variant="switch" defaultChecked>Auto save</MenuCheckboxItem>
  <MenuCheckboxItem variant="switch">Notifications</MenuCheckboxItem>
</MenuPopup>
```

`variant="switch"` swaps the right-aligned check icon for an inline
animated pill toggle. Use this when the row represents a long-lived
preference (auto-save, notifications, dark mode) rather than a verb
(shuffle, repeat).

### 5. Radio group

```tsx
const [theme, setTheme] = useState("system");

<MenuPopup>
  <MenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as string)}>
    <MenuRadioItem value="light">Light</MenuRadioItem>
    <MenuRadioItem value="dark">Dark</MenuRadioItem>
    <MenuRadioItem value="system">System</MenuRadioItem>
  </MenuRadioGroup>
</MenuPopup>
```

Same right-aligned check indicator as the default checkbox — single
selection, only one item shows the check at a time.

### 6. Group + label

```tsx
<MenuPopup>
  <MenuGroup>
    <MenuGroupLabel>Account</MenuGroupLabel>
    <MenuItem>Profile</MenuItem>
    <MenuItem>Billing</MenuItem>
  </MenuGroup>
  <MenuSeparator />
  <MenuGroup>
    <MenuGroupLabel>Support</MenuGroupLabel>
    <MenuItem>Docs</MenuItem>
    <MenuItem>Contact</MenuItem>
  </MenuGroup>
</MenuPopup>
```

### 7. Nested submenu

```tsx
<MenuPopup>
  <MenuItem>Item one</MenuItem>
  <MenuSub>
    <MenuSubTrigger>
      <PlusIcon aria-hidden />
      Add to Playlist
    </MenuSubTrigger>
    <MenuSubPopup>
      <MenuItem>Jazz</MenuItem>
      <MenuItem>Rock</MenuItem>
      <MenuItem>Pop</MenuItem>
    </MenuSubPopup>
  </MenuSub>
  <MenuItem>Item two</MenuItem>
</MenuPopup>
```

`MenuSubTrigger` automatically renders a `ChevronRightIcon` on the
right and gets the same highlight + open state as a regular item.
`MenuSubPopup` re-uses `MenuPopup` chrome so the nested menu reads
as a continuation of the parent.

### 8. Destructive item

```tsx
<MenuItem variant="destructive">
  <TrashIcon aria-hidden />
  Delete
  <MenuShortcut>⌘⌫</MenuShortcut>
</MenuItem>
```

`variant="destructive"` switches the highlight from `bg-accent` to
`bg-destructive/10` and the text to `text-destructive-foreground`.
Place destructive items at the bottom of the menu, separated by a
`MenuSeparator`.

### 9. Hover-to-open trigger

```tsx
<MenuTrigger openOnHover render={<Button variant="outline">Hover me</Button>}>
```

For toolbar / nav menus where moving across triggers should open them.

### 10. Open a Dialog from a menu

```tsx
const [dialogOpen, setDialogOpen] = useState(false);

<>
  <Menu>
    <MenuTrigger render={<Button variant="outline">Open menu</Button>} />
    <MenuPopup>
      <MenuItem onClick={() => setDialogOpen(true)}>Open dialog</MenuItem>
    </MenuPopup>
  </Menu>
  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
    <DialogPopup>…</DialogPopup>
  </Dialog>
</>
```

The default `closeOnClick` on `MenuItem` means the menu will close
before the dialog opens — which is exactly what you want.

## Animation principles

The popup animation bakes in the seven principles documented in
[memory](file:///C:/Users/cland/.claude/projects/C--Users-cland-OneDrive-Desktop-Projects-template/memory/feedback_popup_animation_principles.md):

- **Origin-aware** via `transform-origin: var(--transform-origin)` so
  the popup grows from the trigger corner (set by `align` on Positioner).
- **Initial scale `0.92`** — enough that the origin is visible without
  feeling like the popup teleports in. Never `scale(0)`.
- **Custom `cubic-bezier(0.16, 1, 0.3, 1)` easeOutExpo on enter** —
  fast at start, gentle at end. Built-in `ease-out` is too weak for UI.
- **Faster `cubic-bezier(0.4, 0, 1, 1)` ease-in on exit** so the popup
  disappears quickly.
- **200ms enter / 140ms exit** — under the 300ms ceiling for UI animations.
- **`data-instant: transition-none`** so re-opens (when you close and
  immediately reopen the same menu) skip the animation. Feels instant
  without defeating the initial-open delay.

If you want a snappier or richer treatment for a one-off menu, fork
the popup className and tune scale + duration only — keep the easing
and `data-instant` rules.

## Pitfalls

- **`MenuItem` icons are first child only.** The CSS selector targets
  `[&>svg]` (direct child SVG). Wrap an icon in a `<span>` and it
  loses its 16px sizing + opacity. Pass icons as direct children.
- **`MenuShortcut` placement matters.** It uses `ms-auto` to push to
  the right column — put it as the last child of `MenuItem`. If you
  put other right-aligned content (check, chevron) in the same item,
  they'll fight for the right column.
- **Hover-open triggers default to a 100ms delay.** Pass `delay={0}`
  to `MenuTrigger` for instant-open. Be careful with this — instant
  hover-open menus accidentally fire constantly.
- **Submenus inherit the parent popup chrome.** That's intentional —
  `MenuSubPopup` is `MenuPopup` with `side="inline-end"` defaulted in.
  If you want a different submenu chrome, fork `MenuSubPopup`.

## Rules of thumb

- **Reach for Menu when there are ≤ 8 actions** related to a single
  trigger. Past that, a `Combobox` (filterable) or a Dialog with a
  command palette is usually better.
- **Group destructive actions at the bottom**, separated. Never mix a
  destructive item into the middle of a list.
- **Use `MenuCheckboxItem variant="switch"` for long-lived preferences.**
  Use the default check style for verbs / one-shot toggles (Shuffle,
  Repeat, Mute).
- **Lucide icons over emoji.** Sized at `size-4` (16px) with `opacity-80`
  by default — match the rest of the surface.
- **Don't open menus from menus** — use a submenu (`MenuSub`) for
  nested actions, or a Dialog if the secondary surface is a form.

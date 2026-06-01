# Command

Source: [`src/components/ui/command.tsx`](../../src/components/ui/command.tsx).
Built on [`@base-ui/react/dialog`](https://base-ui.com/react/components/dialog)
+ [`@base-ui/react/autocomplete`](https://base-ui.com/react/components/autocomplete).

A ⌘K-style command palette. The popup wears the **floating-glass chrome**
(Menu / Popover family — `rounded-2xl bg-popover` + soft drop, no border)
and is anchored as a centered modal via `CommandDialog`. The list inside
is an `Autocomplete` with `inline open` so it always renders flat and
filters in place as the user types.

The component exports `commandVariants`, a slot-based `tailwind-variants`
recipe for the dialog shell, command input row, list parts, row accessories,
and footer. Base UI parts keep state-derived `className` functions via local
slot merging.

Three layout layers, no nested panels:

1. **Search row** — `CommandInput` with stripped Input chrome, leading
   `SearchIcon`, optional `⌘/` hint pill on the right. Hairline below.
2. **List** — `CommandList` + `CommandGroup` + `CommandItem`. Each item
   has a leading `CommandIconChip` (outline-button-style chip wrapping
   the icon) and an optional right slot (`CommandShortcut`, `Badge`,
   `Button`, count text, etc).
3. **Footer** — `CommandFooter` with `CommandFooterHint` rows for the
   keyboard map (`# tags / ↑↓ navigate / ↵ open / esc close / ← parent`).
   Hairline above.

## Parts

### Modal shell

- `CommandDialog` — base-ui Dialog Root.
- `CommandDialogTrigger` — element that opens the palette.
- `CommandDialogPopup` — the styled popup. Mounts a portal, backdrop,
  viewport, and the floating-glass surface around `children`. Pass the
  `Command` + its parts as children.
- `CommandCreateHandle` — base-ui's imperative handle (`createHandle()`)
  for opening the palette without a trigger element. Use for global
  ⌘K bindings.

### Body

- `Command` — `Autocomplete inline open`. Manages filter state.
- `CommandInput` — search row. Props: `hint?` (defaults to `"⌘/"`,
  pass `null` to omit), plus all `Autocomplete.Input` props.
- `CommandList` — scrollable list region (uses `ScrollArea` internally
  via `AutocompleteList`).
- `CommandEmpty` — renders when filter matches zero items. Pass any
  content; defaults to centered + padded.
- `CommandGroup` — `[role=group]` wrapper. Sibling groups get a 6px
  visual gap automatically (base-ui's `[[role=group]+&]:mt-1.5`). For
  continuous lists, use a single group; for visually-broken sections
  use `CommandSeparator`.
- `CommandGroupLabel` — small muted label for a group. `px-2.5 py-1
  text-xs font-medium text-muted-foreground` by default.
- `CommandGroupHeader` — flex row that puts a `CommandGroupLabel` next
  to an action element (a button, link, etc) on the right. Pass the
  label with `className="px-0 py-0"` to drop its default padding.
- `CommandItem` — selectable row. `min-h-8 gap-2.5 rounded-md px-2.5
  py-1 text-sm`. Highlighted via `data-highlighted:bg-accent` (base-ui).
- `CommandSeparator` — hairline divider (`my-1.5`).

### Accessories

- `CommandIconChip` — outline-button-style square chip (`size-6 rounded-md
  bg-background` + 1px ring + inset top highlight). Wrap every leading
  icon with this. Auto-sizes inner SVGs to `size-3.5` at `opacity-90`.
- `CommandShortcut` — right-aligned `<kbd>` for keyboard accelerators
  on a row. `ms-auto`, muted small caps tracking.
- `CommandHintPill` — small kbd-style pill (`h-5.5 rounded-md` with a
  1px ring on a transparent background). Used by `CommandInput`'s
  `hint` and by `CommandFooterHint`.
- `CommandFooter` — `border-t` row with `gap-4` for hint pairs.
- `CommandFooterHint` — `<CommandHintPill>{kbd}</CommandHintPill> {label}`
  pair. Pass `kbd` (string or node) and a label as children.

## Scenarios

### 1. File / action launcher

The reference design — a "Recent" group with an action header (Clear),
mixed right-slot accessories per row.

```tsx
<CommandDialog>
  <CommandDialogTrigger render={<Button variant="outline">Search…</Button>} />
  <CommandDialogPopup>
    <Command>
      <CommandInput />
      <CommandList>
        <CommandGroup>
          <CommandGroupHeader>
            <CommandGroupLabel className="px-0 py-0">Recent</CommandGroupLabel>
            <Button size="xs" variant="outline">Clear</Button>
          </CommandGroupHeader>
          <CommandItem>
            <CommandIconChip><FolderIcon /></CommandIconChip>
            <span className="font-medium">Sisyphus Ventures Logo Design</span>
            <span className="ms-auto flex items-center gap-2">
              <AvatarGroup size="xs" max={3} items={team} />
              <Button size="xs" variant="secondary">Jump to…</Button>
            </span>
          </CommandItem>
          <CommandItem>
            <CommandIconChip>
              <span className="text-[10px] font-bold text-foreground">S</span>
            </CommandIconChip>
            <span className="font-medium">Send Slack message</span>
            <span className="ms-auto">
              <Badge appearance="solid" variant="default">
                <span className="size-3 rounded-full bg-background/72" />
                Uber Design
              </Badge>
            </span>
          </CommandItem>
          <CommandItem>
            <CommandIconChip><BellIcon /></CommandIconChip>
            <span className="font-medium">Notifications</span>
            <span className="ms-auto text-[13px] font-medium text-primary">8</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
      <CommandFooter>
        <CommandFooterHint kbd="#">tags</CommandFooterHint>
        <CommandFooterHint kbd="↑↓">navigate</CommandFooterHint>
        <CommandFooterHint kbd="↵">open</CommandFooterHint>
        <CommandFooterHint kbd="esc">close</CommandFooterHint>
      </CommandFooter>
    </Command>
  </CommandDialogPopup>
</CommandDialog>
```

### 2. Quick actions with shortcuts (keyboard-driven)

Bare action list — no group header, no right-slot accessories beyond
`CommandShortcut`. The pure ⌘K pattern.

```tsx
<Command>
  <CommandInput placeholder="Run a command…" hint="⌘K" />
  <CommandList>
    <CommandGroup>
      <CommandItem>
        <CommandIconChip><PlusIcon /></CommandIconChip>
        New document
        <CommandShortcut>⌘N</CommandShortcut>
      </CommandItem>
      <CommandItem>
        <CommandIconChip><FileTextIcon /></CommandIconChip>
        Open file
        <CommandShortcut>⌘O</CommandShortcut>
      </CommandItem>
      <CommandItem>
        <CommandIconChip><TrashIcon /></CommandIconChip>
        Delete
        <CommandShortcut>⌘⌫</CommandShortcut>
      </CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```

### 3. Multi-group with separator

Two visually distinct sections. `CommandGroupLabel` for the section
title; `CommandSeparator` for a hairline divider between groups.

```tsx
<Command>
  <CommandInput placeholder="Find a setting…" />
  <CommandList>
    <CommandGroup>
      <CommandGroupLabel>Account</CommandGroupLabel>
      <CommandItem>
        <CommandIconChip><UserIcon /></CommandIconChip>
        Profile
      </CommandItem>
      <CommandItem>
        <CommandIconChip><BellIcon /></CommandIconChip>
        Notifications
      </CommandItem>
    </CommandGroup>
    <CommandSeparator />
    <CommandGroup>
      <CommandGroupLabel>Workspace</CommandGroupLabel>
      <CommandItem>
        <CommandIconChip><UsersIcon /></CommandIconChip>
        Members
      </CommandItem>
      <CommandItem>
        <CommandIconChip><SettingsIcon /></CommandIconChip>
        Workspace settings
        <CommandShortcut>⌘,</CommandShortcut>
      </CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```

### 4. Theme picker (state via right slot)

`CommandShortcut` is a generic right-aligned slot — it doesn't have to
hold a kbd. Drop a `CheckIcon` for the selected option in a list of
mutually exclusive choices.

```tsx
<Command>
  <CommandInput placeholder="Set theme…" hint={null} />
  <CommandList>
    <CommandGroup>
      <CommandItem>
        <CommandIconChip><SunIcon /></CommandIconChip>
        Light
        <CheckIcon className="ms-auto size-4 text-primary" />
      </CommandItem>
      <CommandItem>
        <CommandIconChip><MoonIcon /></CommandIconChip>
        Dark
      </CommandItem>
      <CommandItem>
        <CommandIconChip><MonitorIcon /></CommandIconChip>
        System
      </CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```

### 5. Empty state

`CommandEmpty` renders when the filter eliminates every item.

```tsx
<CommandList>
  <CommandEmpty>
    <div className="flex flex-col items-center gap-2 py-2">
      <div className="inline-flex size-10 items-center justify-center rounded-full bg-muted/60">
        <SearchIcon className="size-4 text-muted-foreground" />
      </div>
      <span className="text-sm font-medium">No projects found</span>
      <span className="text-xs text-muted-foreground">
        Try a different keyword or create a new project.
      </span>
    </div>
  </CommandEmpty>
</CommandList>
```

### 6. Global ⌘K binding (handle pattern)

For app-wide palettes that don't have a visible trigger, use
`CommandCreateHandle()` and bind a global keydown listener.

```tsx
const handle = CommandCreateHandle();

useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handle.open();
    }
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [handle]);

return (
  <CommandDialog handle={handle}>
    <CommandDialogPopup>
      <Command>…</Command>
    </CommandDialogPopup>
  </CommandDialog>
);
```

## Pitfalls

- **Don't wrap the leading icon manually.** Use `CommandIconChip` so
  every row's icon stays the same shape, regardless of the lucide
  glyph's actual stroke weight. Bare `<Icon />` children get default
  size and full opacity and look "out of place" (Round 3 lesson).
- **Sibling `CommandGroup`s have a built-in 6px gap.** That's base-ui's
  `[[role=group]+&]:mt-1.5` rule on `AutocompleteGroup`. If you want
  items to flow continuously, use a single group. If you want a visible
  divider between sections, use `CommandSeparator` (which gives a
  hairline) — don't try to hide the silent gap.
- **`CommandInput` strips Input chrome on purpose.** It uses
  `AutocompletePrimitive.Input` directly with a plain native input.
  Don't swap it for `<Input>` — the secondary surface gradient + 1px
  ring + inset highlight will leak through and the search row will
  look like an Input nailed onto a popup.
- **`CommandShortcut` and `CheckIcon` etc. are generic right slots.**
  They both rely on `ms-auto` for their position. Don't put both in
  the same row unless you wrap them in a single `<span className="ms-auto
  flex …">` so the row layout doesn't fight itself.
- **`CommandGroupHeader` puts label + action on one row.** When you use
  it, pass the label as `<CommandGroupLabel className="px-0 py-0">`
  so the label's default padding doesn't double up with the header's.
- **Don't put a `Field` / `Label` inside the search row.** The palette
  search isn't a form field — it's a filter. base-ui handles its
  accessibility internally.
- **For 2-axis or very tall lists**, the popup is `max-h-105` (420px)
  by default and `CommandList` scrolls inside. Don't override the
  height unless the design calls for it; the cap keeps the palette
  from stretching to fill an empty viewport.

## Rules of thumb

- **Default to the file/action launcher pattern** when the palette
  shows recently-touched items + a long tail of actions.
- **Use the keyboard-driven pattern** when every action has an
  accelerator (editor commands, ⌘K menu, Linear-style command bar).
- **Use the multi-group + separator pattern** for browse-style palettes
  (settings, workspace switchers) where users skim sections rather
  than typing.
- **Use the right slot for state, not just shortcuts.** A `CheckIcon`
  for radio-style choice, a primary count for unread badges, an
  `AvatarGroup` for shared resources — anything that helps the user
  pick the right row at a glance.
- **Mount `CommandDialog` once at the app root** if you have a global
  ⌘K binding, then dispatch via `CommandCreateHandle().open()`. Don't
  mount per-page unless the palette is genuinely page-scoped.
- **The `⌘/` hint is the default** because most surfaces are searchable
  via this binding. Pass `hint="⌘K"` or `hint={null}` for inline
  pickers that don't have a global keystroke.

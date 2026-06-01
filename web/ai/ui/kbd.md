# Kbd

Source: [`src/components/ui/kbd.tsx`](../../src/components/ui/kbd.tsx).

A `<kbd>` element styled as a real keycap — `bg-background` fill,
1px ring, plus a 1px bottom shadow that produces the subtle "key
sitting on the surface" depth. Dark mode swaps the fill for a
top-lit gradient so the bezel still reads. `font-sans` (not mono)
because most keyboard symbols are unicode glyphs (`⌘ ⇧ ⌥ ⌃ ↵ ⌫ ⏏`)
that look better in the system font.

## Parts

- `Kbd` — single key. `h-5 min-w-5` so single-character keys stay
  square.
- `KbdGroup` — wrapper that lays multiple `Kbd` keys with a 4px
  gap. Use it when you want the chord to read as one unit.
- `kbdVariants` — exported slot recipe with `key` and `group` slots.

## Scenarios

### 1. Single key

```tsx
Press <Kbd>K</Kbd> to focus search.
```

### 2. Chord — modifier + key

```tsx
Open the command bar with{" "}
<KbdGroup>
  <Kbd>⌘</Kbd>
  <Kbd>K</Kbd>
</KbdGroup>
```

### 3. Inline in a Menu shortcut

```tsx
<MenuItem>
  Save
  <MenuShortcut>⌘S</MenuShortcut>
</MenuItem>
```

`MenuShortcut` already uses the `kbd` element internally with the
right-aligned `ms-auto` slot — don't reach for `Kbd` for menu
shortcuts.

### 4. Inside a `Button`

```tsx
<Button variant="outline" className="gap-2">
  <SearchIcon />
  Search
  <Kbd className="ml-auto">⌘K</Kbd>
</Button>
```

### 5. Inside a Tooltip

```tsx
<Tooltip>
  <TooltipTrigger>Bold</TooltipTrigger>
  <TooltipPopup>
    Bold <Kbd>⌘B</Kbd>
  </TooltipPopup>
</Tooltip>
```

## Pitfalls

- **Use unicode glyphs for modifiers**: `⌘ ⇧ ⌥ ⌃ ↵ ⌫ ⏏ ⏎`. They read
  the same on every platform and don't need `<svg>`s.
- **`Kbd` is `pointer-events-none`** — clicks pass through to the
  parent. If you need the keycap to be clickable, wrap in a
  `<button>`.
- **Don't use `font-mono`.** The unicode keycap glyphs render with
  more detail in the system sans font.
- **For Mac vs Windows / Linux**, render conditionally:
  ```tsx
  const isMac = typeof navigator !== "undefined" && /Mac/.test(navigator.platform);
  <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
  ```
  Or maintain a small `keyMap` helper.

## Rules of thumb

- **Wrap chords in `KbdGroup`** — it gives the right gap and lets the
  parent flex layout treat the chord as one inline element.
- **Single key inline (no group needed)** for one-off mentions in
  copy.
- **Don't reach for `Kbd` inside `MenuShortcut`** — that primitive
  has its own kbd styling tuned for menu rows.

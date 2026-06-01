# Sheet

Source: [`src/components/ui/sheet.tsx`](../../src/components/ui/sheet.tsx).
Built on [`@base-ui/react/dialog`](https://base-ui.com/react/components/dialog)
(Sheet is a Dialog with edge anchoring + slide-in animation).

The desktop sibling of `Drawer`. Same floating-glass chrome
(`bg-popover`, no border, omnidirectional soft drop, dark-mode 1px
ring), but **no swipe-to-dismiss** (no SwipeArea, no Bar, no
nested-stacking). Use Sheet for desktop side / top / bottom panels;
use Drawer when the same surface should swipe-dismiss on mobile.

The close X lives **inside `SheetHeader`**, column-aligned with the
title via `grid grid-cols-[1fr_auto]` (the Dialog pattern). Don't
absolute-position your own close button — pass `showCloseButton={false}`
to the header instead.

## Parts

- `Sheet` — root (alias of `DialogPrimitive.Root`).
- `SheetTrigger` — opens the sheet. Use `render={<Button … />}`.
- `SheetPopup` (alias `SheetContent`) — the panel. Wraps Portal +
  Backdrop + Viewport + Popup internally. Accepts `side`
  (`"right" | "left" | "top" | "bottom"`, default `"right"`) and
  `variant` (`"default" | "inset"`).
- `SheetHeader` — title + description + close X column-aligned.
  Pass `showCloseButton={false}` to skip the X. `closeProps` forwards
  to the underlying close button.
- `SheetTitle` — `<h2>` heading. `font-heading font-semibold text-xl`.
- `SheetDescription` — muted body text. `<p class="text-muted-foreground text-sm">`.
- `SheetFooter` — sticky-bottom action row. `variant="default"` adds
  a top border + `bg-muted/72`; `variant="bare"` is just spacing.
- `SheetPanel` — opinionated body content scroll area with `ScrollArea`
  baked in. Use when content might overflow.
- `SheetClose` — base-ui Close. Use inside footer actions.
- `SheetBackdrop` (alias `SheetOverlay`) — the backdrop. Already
  rendered by `SheetPopup`; only export it if you're composing
  manually.
- `SheetViewport` — the positioning container. Same — handled by
  `SheetPopup`.
- `sheetVariants` — exported slot recipe for backdrop, viewport, popup,
  header, footer, title, description, and panel slots. Variants cover
  `side`, `variant`, and footer variant.
- `SheetPrimitive` — re-export of `@base-ui/react/dialog` for custom
  compositions.

## Scenarios

### 1. Right sheet (default) — settings panel

```tsx
<Sheet>
  <SheetTrigger render={<Button variant="outline">Settings</Button>} />
  <SheetPopup side="right">
    <SheetHeader>
      <SheetTitle>Settings</SheetTitle>
      <SheetDescription>Tweak preferences for this workspace.</SheetDescription>
    </SheetHeader>
    <div className="flex flex-1 flex-col gap-4 px-6 pb-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="ws-name">Workspace name</Label>
        <Input id="ws-name" defaultValue="Template Co" />
      </div>
      <label className="flex items-center justify-between gap-3 py-2 text-sm">
        <span>Notifications</span>
        <Switch defaultChecked />
      </label>
    </div>
    <SheetFooter>
      <SheetClose render={<Button variant="ghost">Cancel</Button>} />
      <Button>Save</Button>
    </SheetFooter>
  </SheetPopup>
</Sheet>
```

### 2. Left sheet — filters

```tsx
<Sheet>
  <SheetTrigger render={<Button variant="outline">Filters</Button>} />
  <SheetPopup side="left">
    <SheetHeader>
      <SheetTitle>Filters</SheetTitle>
      <SheetDescription>Narrow the results.</SheetDescription>
    </SheetHeader>
    {/* filter form */}
  </SheetPopup>
</Sheet>
```

### 3. Bottom sheet (desktop bottom panel)

```tsx
<Sheet>
  <SheetTrigger render={<Button variant="outline">Compose</Button>} />
  <SheetPopup side="bottom">…</SheetPopup>
</Sheet>
```

For the mobile bottom-sheet pattern with swipe-dismiss, use `Drawer`
instead.

### 4. Inset variant (responsive card)

```tsx
<SheetPopup side="right" variant="inset">…</SheetPopup>
```

On `<sm` viewports, behaves like a regular right sheet. On `sm+`,
sits with 16px margin and rounds all corners — reads as a centered
card. Best when a desktop card should become a side sheet on mobile.

### 5. Without the close X

```tsx
<SheetPopup>
  <SheetHeader showCloseButton={false}>
    <SheetTitle>Confirm</SheetTitle>
    <SheetDescription>This can't be undone.</SheetDescription>
  </SheetHeader>
  …
</SheetPopup>
```

Use when the only dismiss is the explicit Cancel / Confirm buttons.

### 6. Custom close button styling

```tsx
<SheetHeader closeProps={{ className: "col-start-2 row-start-1 -mt-2 -mr-2" }}>
  …
</SheetHeader>
```

`closeProps` forwards to the underlying base-ui Close. Use to nudge
position or swap variants without re-implementing the header.

### 7. Long body — wrap in `SheetPanel` for scroll-fade

```tsx
<SheetPopup>
  <SheetHeader>
    <SheetTitle>Activity</SheetTitle>
  </SheetHeader>
  <SheetPanel>
    {events.map((e) => <Row key={e.id} event={e} />)}
  </SheetPanel>
  <SheetFooter>
    <SheetClose render={<Button>Close</Button>} />
  </SheetFooter>
</SheetPopup>
```

`SheetPanel` wraps in a `ScrollArea` with optional scroll-fade. The
header / footer stay sticky, the panel scrolls.

## Pitfalls

- **Don't render a close button in `SheetPopup` directly.** The
  header's `grid-cols-[1fr_auto]` is what aligns it with the title.
  Absolute-positioning the close in the popup (the legacy pattern)
  produces a misaligned X that floats above the title.
- **`SheetDescription` spans both header columns** — the
  `[&_[data-slot=sheet-description]]:col-span-full` selector in
  `SheetHeader` makes sure the description doesn't get clipped to
  column 1 next to the close X.
- **`Sheet` is a Dialog primitive** — not the `Drawer` primitive. So
  no `swipeDirection`, `snapPoints`, or `data-swiping`. If you need
  any of those, use `Drawer`.
- **Use `Drawer` for mobile-first sheets** — Sheet doesn't give you
  swipe-to-dismiss, the safe-area-inset bleed below the popup, or
  the grab bar. They're sibling components, not interchangeable.

## Rules of thumb

- **Right sheet (default)** for desktop side panels — settings, edit
  details, activity logs, share dialogs that exceed a Popover.
- **Left sheet** for nav / persistent filter panels.
- **Bottom / top sheets** are rare on desktop — usually a Toast,
  Drawer, or Banner is a better fit.
- **`variant="inset"`** when you want a centered card on desktop and
  a side sheet on mobile — saves you having to toggle between Sheet
  and Dialog by viewport.
- **Always use `SheetHeader`** even if the close X is the only
  child. The grid alignment is what makes the chrome consistent.
- **Footer-aligned Cancel + primary action**, with `SheetClose`
  wrapping the Cancel button so it dismisses on click.

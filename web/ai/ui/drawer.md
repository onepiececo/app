# Drawer

Source: [`src/components/ui/drawer.tsx`](../../src/components/ui/drawer.tsx).
Base UI primitive: [Drawer](https://base-ui.com/react/components/drawer).

> Most modal-style UI on mobile should go through [`Popup`](./popup.md), which
> renders a `Dialog` on desktop and a bottom `Drawer` on mobile. Reach for
> `Drawer` directly when the panel must stay a sliding sheet on every
> viewport (right-side cart, persistent filter rail, mobile nav, etc.).

## Anatomy

```tsx
<Drawer>                         {/* Drawer.Root + position context */}
  <DrawerTrigger />              {/* Drawer.Trigger */}
  <DrawerPopup>                  {/* wraps Portal + Backdrop + Viewport + Popup */}
    <DrawerBar />                {/* swipe-handle pill (auto via showBar) */}
    <DrawerHeader>
      <DrawerTitle />            {/* Drawer.Title */}
      <DrawerDescription />      {/* Drawer.Description */}
    </DrawerHeader>
    <DrawerPanel />              {/* scrollable body (custom) */}
    <DrawerFooter>
      <DrawerClose />            {/* Drawer.Close */}
    </DrawerFooter>
  </DrawerPopup>
  <DrawerSwipeArea />            {/* optional edge gesture zone */}
</Drawer>
```

Lower-level primitives are also exported: `DrawerPortal`, `DrawerBackdrop`,
`DrawerViewport`, `DrawerContent`, `DrawerPrimitive` (full base-ui re-export),
and the slot recipe `drawerVariants`.
Custom drawer-as-list parts: `DrawerMenu`, `DrawerMenuItem`,
`DrawerMenuSeparator`, `DrawerMenuGroup`, `DrawerMenuGroupLabel`,
`DrawerMenuTrigger`, `DrawerMenuCheckboxItem`, `DrawerMenuRadioGroup`,
`DrawerMenuRadioItem`.

`drawerVariants` owns the styled anatomy slots: `swipeArea`, `backdrop`,
`viewport`, `popup`, `header`, `footer`, `title`, `description`, `panel`,
`bar`, `barIndicator`, and the `menu*` slots.

Edge-anchored modal panel with swipe-to-dismiss, snap points, and nested-stack
support. Same floating-glass surface as `Menu` / `Popover` (no border,
omnidirectional soft drop shadow), tinted swipe bar (`foreground/30` pill
that lights up on hover and during drag), `allowSelection` on the header
so the title text is selectable.

**Use Drawer for full-surface modal interactions on mobile** — share
sheets, filters, carts, settings panels, app nav. On desktop, prefer
`Popover` for free-form panels and `Dialog` for centered modals; reach
for `Drawer` only when the panel is genuinely better as a sliding
sheet (right-side cart, persistent filter rail, etc.).

## Parts

- `Drawer` — root. `position` (`"bottom" | "top" | "left" | "right"`,
  default `"bottom"`) sets which edge the drawer slides in from and
  auto-derives the swipe direction. Otherwise accepts every base-ui
  prop (`open` / `onOpenChange` / `modal` / `snapPoints` /
  `disablePointerDismissal` / `actionsRef` etc.).
- `DrawerTrigger` — opens the drawer. Use `render={<Button … />}`.
- `DrawerPopup` — the panel. Wraps Portal + Backdrop + Viewport + Popup
  internally. Accepts `showBar` (renders a swipe-handle pill at the
  top), `showCloseButton` (renders an X — usually unnecessary because
  swipe + backdrop tap already dismiss), `variant` (`"default"`,
  `"straight"` for square corners, `"inset"` for a card on `sm+` /
  drawer on `<sm`), and `portalProps`.
- `DrawerHeader` — title / description block. Pass `allowSelection` to
  let users select the text without triggering the swipe gesture
  (wraps the inner content in `DrawerContent` automatically).
- `DrawerTitle` / `DrawerDescription` — the heading and subtext.
- `DrawerContent` — re-export of `DrawerPrimitive.Content`. Wrap any
  region whose drag should NOT initiate a swipe-dismiss (text
  selection, scrollable lists, etc.).
- `DrawerPanel` — opinionated content scroll area with `ScrollArea`
  baked in. Use it when the body might overflow the viewport.
- `DrawerFooter` — sticky-bottom action row with safe-area padding.
  `variant="default"` adds a top border + bg-muted; `variant="bare"`
  is just spacing. Mostly used for confirm-style drawers; share /
  settings drawers usually skip the footer.
- `DrawerBar` — the swipe handle pill (rendered automatically by
  `DrawerPopup` when `showBar`). Tinted `foreground/30`, lights up to
  `foreground/45` on hover and `foreground/60` while `data-swiping`.
- `DrawerSwipeArea` — invisible edge gesture zone. The drawer normally
  swipes from the popup itself; reach for this manually only for custom
  edge-grab zones.
- `DrawerClose` — base-ui Close button. Use inside footer actions.
- `DrawerMenu*` — pre-styled menu items / groups / labels / triggers
  for drawer-as-list patterns. Includes `DrawerMenuItem`,
  `DrawerMenuSeparator`, `DrawerMenuGroup`, `DrawerMenuGroupLabel`,
  `DrawerMenuTrigger`, `DrawerMenuCheckboxItem`,
  `DrawerMenuRadioGroup`, `DrawerMenuRadioItem`.
- `DrawerCreateHandle` — re-export of `DrawerPrimitive.createHandle`
  for detached-trigger patterns.
- `DrawerPrimitive` — re-export of `@base-ui/react/drawer` for
  custom compositions.

## Layout convention

The header uses `px-6 pt-6 pb-4`. Items / form blocks live in a
`px-6 pb-6` wrapper. **Match the same `px-6` everywhere** so the title
text, description, and item content all start at the same x-position
(24px from the drawer edge). If you put items inline buttons with
their own padding (e.g. `-mx-2 px-2`), the item bg starts at 16px
but the icon / text content lands at 24px to stay in column.

## Scenarios

### 1. Bottom · Share sheet

```tsx
<Drawer position="bottom">
  <DrawerTrigger render={<Button variant="outline">Share</Button>} />
  <DrawerPopup showBar>
    <DrawerHeader allowSelection className="px-6 pt-6 pb-4">
      <DrawerContent>
        <DrawerTitle>Share</DrawerTitle>
        <DrawerDescription>Send a link or invite teammates.</DrawerDescription>
      </DrawerContent>
    </DrawerHeader>
    <div className="flex flex-col gap-0.5 px-6 pb-6">
      <button type="button" className={ITEM_BASE}>
        <CopyIcon aria-hidden />
        Copy link
      </button>
      {/* … */}
      <div className="my-2 h-px bg-border" />
      <button type="button" className={cn(ITEM_BASE, "text-destructive-foreground hover:bg-destructive/10")}>
        <TrashIcon aria-hidden />
        Remove access
      </button>
    </div>
  </DrawerPopup>
</Drawer>
```

The canonical mobile share sheet — quick actions list with a
destructive item separated at the bottom.

### 2. Right · Filters panel (with controlled state)

```tsx
function FiltersDrawer() {
  const [price, setPrice] = useState<[number, number]>([20, 150]);
  return (
    <Drawer position="right">
      <DrawerTrigger render={<Button variant="outline"><SlidersHorizontalIcon className="size-4" /> Filters</Button>} />
      <DrawerPopup showBar>
        <DrawerHeader allowSelection className="px-6 pt-6 pb-4">
          <DrawerContent>
            <DrawerTitle>Filters</DrawerTitle>
            <DrawerDescription>Narrow the results.</DrawerDescription>
          </DrawerContent>
        </DrawerHeader>
        <div className="flex flex-1 flex-col gap-6 px-6 pb-6">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</span>
            <label className="flex items-center gap-3 text-sm"><Checkbox defaultChecked /> Apparel</label>
            <label className="flex items-center gap-3 text-sm"><Checkbox /> Footwear</label>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Price</span>
            <Slider value={price} onChange={(v) => setPrice(v as [number, number])} min={0} max={500} valuePosition="top" label="Range" formatValue={(v) => `$${v}`} minStepsBetweenValues={20} />
          </div>
          <div className="mt-auto flex gap-2 pt-4">
            <Button variant="ghost" className="flex-1">Reset</Button>
            <Button className="flex-1">Apply</Button>
          </div>
        </div>
      </DrawerPopup>
    </Drawer>
  );
}
```

The Slider already includes `data-base-ui-swipe-ignore` on its root,
so dragging the thumb won't trigger the drawer's swipe-to-dismiss.
For other custom draggable elements, add the attribute yourself.

### 3. Right · Shopping cart

```tsx
<Drawer position="right">
  <DrawerTrigger render={<Button variant="outline"><ShoppingCartIcon className="size-4" /> Cart (3)</Button>} />
  <DrawerPopup showBar>
    <DrawerHeader allowSelection className="px-6 pt-6 pb-4">
      <DrawerContent>
        <DrawerTitle>Your cart</DrawerTitle>
        <DrawerDescription>3 items · ready to ship</DrawerDescription>
      </DrawerContent>
    </DrawerHeader>
    <div className="flex flex-1 flex-col px-6 pb-6">
      {items.map((item) => (
        <div key={item.name} className="flex items-center gap-3 border-b border-border py-3 last:border-0">
          <div className="size-12 shrink-0 rounded-md bg-muted" />
          <div className="flex-1">
            <div className="text-sm font-medium">{item.name}</div>
            <div className="text-xs text-muted-foreground">Qty {item.qty}</div>
          </div>
          <div className="text-sm font-medium tabular-nums">{item.price}</div>
        </div>
      ))}
      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Subtotal</span>
        <span className="text-base font-semibold tabular-nums">$132.00</span>
      </div>
      <Button className="mt-4 w-full"><CreditCardIcon className="size-4" /> Checkout</Button>
    </div>
  </DrawerPopup>
</Drawer>
```

### 4. Right · Settings panel

```tsx
<Drawer position="right">
  <DrawerTrigger render={<Button variant="outline">Settings</Button>} />
  <DrawerPopup showBar>
    <DrawerHeader allowSelection className="px-6 pt-6 pb-4">
      <DrawerContent>
        <DrawerTitle>Settings</DrawerTitle>
        <DrawerDescription>Personal preferences for this workspace.</DrawerDescription>
      </DrawerContent>
    </DrawerHeader>
    <div className="flex flex-col gap-1 px-6 pb-6">
      <label className="flex items-center justify-between gap-3 py-2 text-sm">
        <span className="inline-flex items-center gap-2"><BellIcon className="size-4 opacity-80" /> Notifications</span>
        <Switch defaultChecked />
      </label>
      <label className="flex items-center justify-between gap-3 py-2 text-sm">
        <span className="inline-flex items-center gap-2"><MoonIcon className="size-4 opacity-80" /> Dark mode</span>
        <Switch />
      </label>
    </div>
  </DrawerPopup>
</Drawer>
```

### 5. Left · Mobile navigation

```tsx
<Drawer position="left">
  <DrawerTrigger render={<Button variant="outline">Menu</Button>} />
  <DrawerPopup showBar>
    <DrawerHeader allowSelection className="px-6 pt-6 pb-4">
      <DrawerContent>
        <DrawerTitle>Template</DrawerTitle>
        <DrawerDescription>kyle@template.com</DrawerDescription>
      </DrawerContent>
    </DrawerHeader>
    <div className="flex flex-col gap-3 px-6 pb-6">
      <button type="button" className={cn(ITEM_BASE, "bg-muted/50")}>
        <SearchIcon /> <span className="flex-1 text-left text-muted-foreground">Search…</span>
        <kbd className="font-sans text-xs text-muted-foreground/70 tracking-widest">⌘K</kbd>
      </button>
      <div className="flex flex-col gap-0.5">
        <span className="px-2 py-1.5 -mx-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Workspace</span>
        <button type="button" className={ITEM_BASE}><HomeIcon /> Home</button>
        <button type="button" className={ITEM_BASE}>
          <InboxIcon /> Inbox <span className="ml-auto text-xs text-muted-foreground tabular-nums">12</span>
        </button>
      </div>
    </div>
  </DrawerPopup>
</Drawer>
```

### 6. Inset variant (responsive card)

```tsx
<Drawer position="bottom">
  <DrawerTrigger render={<Button variant="outline">Open</Button>} />
  <DrawerPopup variant="inset" showBar>
    {/* … */}
  </DrawerPopup>
</Drawer>
```

`variant="inset"` keeps the drawer as a normal bottom sheet on phones
but turns into a centered card with 16px margins on `sm+`. Use this
when a desktop dialog should become a drawer on mobile without
needing two separate components.

### 7. Detached triggers (createHandle)

```tsx
const filterDrawer = DrawerCreateHandle();

// Many entry points
<Button onClick={() => filterDrawer.open()}>Filters</Button>
<button type="button" onClick={() => filterDrawer.open()}>Quick filter</button>

// Single root
<Drawer handle={filterDrawer} position="right">
  <DrawerPopup showBar>
    {/* … */}
  </DrawerPopup>
</Drawer>
```

Useful when filters / cart / settings drawers are opened from many
places (header button + empty-state CTA + keyboard shortcut).

### 8. Snap points (multi-height bottom sheet)

```tsx
<Drawer position="bottom" snapPoints={[0.4, 0.9]}>
  <DrawerTrigger render={<Button>Quick view</Button>} />
  <DrawerPopup showBar>
    {/* drawer opens at 40% height, swipe up snaps to 90% */}
  </DrawerPopup>
</Drawer>
```

`snapPoints` is an array of fractions (0–1) or pixel values (>1) or
string units (`"148px"`). User can swipe between them or release at
any point.

## Pitfalls

- **`DrawerHeader` text is not selectable by default.** Pass
  `allowSelection`, which automatically wraps the children in
  `DrawerContent` so the swipe gesture won't intercept text drags.
- **Slider / NumberField / any draggable inside the drawer** —
  production `Slider` already opts out via `data-base-ui-swipe-ignore`
  on its root. Custom draggable controls need to set the attribute
  themselves on a wrapper.
- **Don't add a close X.** Drawers dismiss via swipe, backdrop tap,
  and Escape. A close button is redundant and breaks the iOS / Android
  convention. The component supports `showCloseButton` for the rare
  case it's needed (e.g. a non-modal drawer with no backdrop).
- **Footer is opt-in.** Use `DrawerFooter` only when the drawer
  represents a confirm flow (Cancel + Submit). For lists / settings,
  let the items extend to the safe-area-inset-bottom and skip the
  footer.
- **`px-6` everywhere.** Don't mix `px-4` items with a `px-6` header
  — the misalignment is immediately visible.
- **Items in the menu pattern use `-mx-2 px-2`.** This pulls the
  hover bg back to a 16px-from-edge start while keeping the icon /
  text content at 24px (= title text x). Other layouts: just align
  to `px-6`.
- **The drawer occupies the full viewport on `<sm`** (no margin).
  Use `variant="inset"` if you want a 16px gutter on `sm+`.

## Rules of thumb

- **Bottom drawer** — confirms, share sheets, quick info / quick
  actions. The default for "this is mobile UI."
- **Right drawer** — cart, filters, settings, persistent panels that
  don't dominate the viewport.
- **Left drawer** — app nav. Almost never anything else.
- **Top drawer** — system-level alerts. Rare. Most "top" drawers
  should be Toast or AlertDialog instead.
- **Always use `showBar`** unless you have a specific reason not to.
  The bar is the universal mobile affordance for "swipe to dismiss";
  removing it makes the gesture invisible.
- **Always use `allowSelection`** on the header so the title /
  description are user-selectable.
- **Skip the footer** for share / settings / nav drawers — the items
  don't need a sticky action row.

## API reference

### `Drawer` (Drawer.Root)
- Custom: `position?: "bottom" | "top" | "left" | "right"` (default `"bottom"`) — auto-derives `swipeDirection`.
- `open?` / `defaultOpen?` / `onOpenChange?` — controlled state.
- `modal?: boolean` (default `true`).
- `disablePointerDismissal?: boolean` — disables backdrop / outside-tap dismiss.
- `swipeDirection?: "up" | "down" | "left" | "right"` — override the auto-derived value.
- `snapPoints?: Array<number | string>` — fractions (`0–1`), pixels (`>1`), or units (`"148px"`).
- `snapPoint?` / `onSnapPointChange?` — controlled snap.
- `snapToSequentialPoints?: boolean` — only step one snap at a time.
- `handle?: DrawerHandle` — pair with `DrawerCreateHandle()` for detached triggers.
- `actionsRef?` — imperative `{ unmount() }`.

### `DrawerTrigger` / `DrawerClose`
- `render={<Button … />}` to compose. Trigger data: `[data-open]`.

### `DrawerPopup` (wraps Portal + Backdrop + Viewport + Drawer.Popup)
- Custom: `position?` (overrides context), `variant?: "default" | "straight" | "inset"` (default `"default"`), `showBar?: boolean` (default `false`), `showCloseButton?: boolean` (default `false`), `portalProps?`.
- Data: `[data-open]`, `[data-closed]`, `[data-starting-style]`, `[data-ending-style]`, `[data-swiping]`, `[data-nested-drawer-open]`, `[data-nested-drawer-swiping]`.
- CSS vars on the popup: `--drawer-swipe-movement-x/-y`, `--drawer-swipe-progress` (0–1), `--drawer-swipe-strength`, `--drawer-snap-point-offset`, `--drawer-height`, `--drawer-frontmost-height`, `--nested-drawers`.

### `DrawerBackdrop`
Data: `[data-starting-style]`, `[data-ending-style]`, `[data-swiping]`. Reads `--drawer-swipe-progress` for opacity tracking.

### `DrawerSwipeArea`
- Custom: `position?` (overrides context). Use manually only for custom edge-grab zones.

### `DrawerContent` (Drawer.Content)
Wrap any region whose drag should NOT initiate a swipe-dismiss (text selection, scroll lists, draggable controls). `DrawerHeader`/`DrawerFooter`/`DrawerPanel` opt in via `allowSelection`.

### `DrawerTitle` / `DrawerDescription`
Standard heading / paragraph props.

### `DrawerCreateHandle<T>()`
Factory for cross-tree imperative open/close: `handle.open(payload?)`, `handle.close()`.

### Custom slots (no base-ui counterpart)
- `DrawerHeader` — `allowSelection?: boolean` (default `false`); when `true` wraps in `DrawerContent`.
- `DrawerPanel` — `scrollFade?: boolean` (default `true`), `scrollable?: boolean` (default `true`), `allowSelection?: boolean` (default `true`).
- `DrawerFooter` — `variant?: "default" | "bare"` (default `"default"`), `allowSelection?: boolean` (default `true`). Adds `safe-area-inset-bottom` padding.
- `DrawerBar` — swipe handle pill, `position?` override.
- `DrawerMenu*` — drawer-as-list primitives. `DrawerMenuItem` accepts `variant?: "default" | "destructive"`. `DrawerMenuCheckboxItem` accepts `variant?: "default" | "switch"`.

### Swipe opt-out
Add `data-base-ui-swipe-ignore` on any wrapper whose drag should not be intercepted by the drawer (custom sliders, drag-and-drop lists). Production `Slider` already opts out.

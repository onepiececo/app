# Popup

Source: [`src/components/ui/popup.tsx`](../../src/components/ui/popup.tsx).

`Popup` is the **default modal primitive** in this codebase. It dispatches
to one of three underlying components based on viewport and dismissibility:

| Mode | Viewport | Dismissible | Renders |
| --- | --- | --- | --- |
| `dialog` (default) | `md+` | yes | [`Dialog`](./dialog.md) |
| `alert-dialog` | `md+` | `dismissible={false}` | [`AlertDialog`](./alert-dialog.md) |
| `drawer` | `< md` | either | bottom `Drawer` — when `dismissible={false}`, backdrop-tap close and swipe-to-dismiss are both disabled so alert semantics survive |

Same parts, same code, best-in-class mobile look with no extra work from
the caller.

> **Default to `Popup`.** Use `Dialog` or `Drawer` directly only when you
> explicitly want the same layout on every viewport (e.g. a marketing
> dialog that should never become a bottom sheet, or a drawer that should
> stay a drawer on desktop).

## Parts

All Popup parts mirror the Dialog parts. They delegate to `Dialog*` on desktop and to `Drawer*` on mobile via a context.

`Popup` intentionally has no visual recipe of its own. It delegates all
chrome to `Dialog`, `AlertDialog`, or `Drawer`, so styling changes belong
in those underlying primitives.

- `Popup` — root. Takes the same props as `Dialog`. Resolves the viewport once and provides it to children.
- `PopupTrigger` — opens the modal. Identical API to `DialogTrigger`.
- `PopupClose` — closes it.
- `PopupContent` — the modal container. Accepts an optional `showBar` prop (defaults to `true`) which controls the swipe handle on mobile; desktop ignores it.
- `PopupHeader` — title + description + close X (on desktop). On mobile, the drawer's header variant renders (no corner X — the swipe bar dismisses).
- `PopupTitle`, `PopupDescription` — text parts.
- `PopupBody` — non-scrolling padded body for forms / short content. Dialog side uses `DialogBody`; Drawer side uses `DrawerPanel scrollable={false}`.
- `PopupPanel` — scrollable body. Dialog side needs an explicit height on `PopupContent` (e.g. `className="h-[80vh]"`) because ScrollArea requires a bounded height. Drawer side handles scrolling natively.
- `PopupFooter` — action row. Same `variant="default" | "bare"` options as `DialogFooter`. Default (muted bordered strip) is the common choice.

## Scenarios

### 1. Classic confirmation

```tsx
<Popup>
  <PopupTrigger render={<Button variant="destructive">Delete workspace</Button>} />
  <PopupContent>
    <PopupHeader>
      <PopupTitle>Delete workspace</PopupTitle>
      <PopupDescription>
        This removes all projects, data, and invites. This action cannot be undone.
      </PopupDescription>
    </PopupHeader>
    <PopupFooter>
      <PopupClose render={<Button variant="outline" />}>Cancel</PopupClose>
      <PopupClose render={<Button variant="destructive" />}>Delete workspace</PopupClose>
    </PopupFooter>
  </PopupContent>
</Popup>
```

### 2. Form (the Edit profile pattern)

`PopupBody` gives you a padded, non-scrolling body on both platforms. On mobile it maps to `DrawerPanel scrollable={false}`; on desktop it's `DialogBody`.

```tsx
<Popup>
  <PopupTrigger render={<Button variant="outline">Edit profile</Button>} />
  <PopupContent className="sm:max-w-sm">
    <PopupHeader>
      <PopupTitle>Edit profile</PopupTitle>
      <PopupDescription>
        Make changes to your profile here. Click save when you&apos;re done.
      </PopupDescription>
    </PopupHeader>
    <Form className="contents">
      <PopupBody className="grid gap-4">
        <Field>
          <FieldLabel>Name</FieldLabel>
          <Input defaultValue="Margaret Welsh" type="text" />
        </Field>
        <Field>
          <FieldLabel>Username</FieldLabel>
          <Input defaultValue="@maggie.welsh" type="text" />
        </Field>
      </PopupBody>
      <PopupFooter>
        <PopupClose render={<Button variant="ghost" />}>Cancel</PopupClose>
        <Button type="submit">Save</Button>
      </PopupFooter>
    </Form>
  </PopupContent>
</Popup>
```

### 3. Scrollable content

Use `PopupPanel` for long bodies. On desktop, set an explicit height on `PopupContent` so `ScrollArea` can bound itself.

```tsx
<Popup>
  <PopupTrigger render={<Button variant="outline">View terms</Button>} />
  <PopupContent className="h-[80vh]">
    <PopupHeader>
      <PopupTitle>Terms of service</PopupTitle>
      <PopupDescription>Last updated April 23, 2026.</PopupDescription>
    </PopupHeader>
    <PopupPanel>
      {/* long copy */}
    </PopupPanel>
    <PopupFooter>
      <PopupClose render={<Button variant="outline" />}>Decline</PopupClose>
      <Button>I agree</Button>
    </PopupFooter>
  </PopupContent>
</Popup>
```

### 4. Alert-type (non-dismissable)

Pass `dismissible={false}` on the root. On desktop this **dispatches to `AlertDialog`** (no close X, Escape / backdrop click blocked); on mobile it stays a `Drawer` with backdrop-tap close (`disablePointerDismissal`) and swipe-to-dismiss (`swipeDirection={undefined}`) both disabled and the swipe bar hidden. Close is only possible via an explicit action button (`PopupClose` on Cancel, or a programmatic `onOpenChange`).

```tsx
<Popup dismissible={false}>
  <PopupTrigger render={<Button variant="destructive">Revoke sessions</Button>} />
  <PopupContent>
    <PopupHeader>
      <PopupTitle>Revoke all sessions?</PopupTitle>
      <PopupDescription>
        Everyone signed in on any device will be logged out immediately.
      </PopupDescription>
    </PopupHeader>
    <PopupFooter>
      <PopupClose render={<Button variant="outline" />}>Cancel</PopupClose>
      <Button variant="destructive" onClick={handleRevoke}>Revoke sessions</Button>
    </PopupFooter>
  </PopupContent>
</Popup>
```

This is the preferred way to build a destructive / blocking confirmation
in this codebase — you get `AlertDialog` semantics on desktop automatically,
and the drawer adapts the same UI to mobile. Only reach for `AlertDialog`
directly when you want the centered-modal treatment on mobile too.

## When to reach for `Dialog` or `Drawer` directly

99% of the time, use `Popup`. Reach for the underlying primitive only when:

- **`Dialog` directly** — the content must stay a centered modal on all viewports (e.g. a tiny sign-in step where the bottom-sheet treatment would feel heavy, or a wizard that's specifically designed for desktop).
- **`Drawer` directly** — you want a drawer on desktop too (e.g. a side navigation panel, a persistent filter panel). Configure `position="right"` / `"left"` / etc. via the Drawer root.
- You need drawer-only features like `DrawerSwipeArea` or a nested drawer menu (`DrawerMenu`) — these aren't part of the Popup surface.

If the answer isn't obvious, **ask before implementing**. Popup is the default; deviating is a product choice the human should make.

## Rules of thumb

- Reach for `Popup` first. Only downgrade to `Dialog` or `Drawer` when you specifically need one layout on all viewports.
- `PopupFooter` defaults to the muted bordered variant — that's the common style. Use `variant="bare"` only for single-action acknowledgements.
- For forms, put fields inside `PopupBody`, never inside `PopupPanel` (scroll behavior interferes with input focus).
- For scrollable bodies, set an explicit height on `PopupContent` (e.g. `h-[80vh]`) — ScrollArea needs a bounded height on desktop.
- For destructive / blocking flows that should adapt to mobile, use
  `Popup dismissible={false}`. Use `AlertDialog` directly only when the
  centered alert treatment must be preserved on every viewport.

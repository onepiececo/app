# Dialog

Source: [`src/components/ui/dialog.tsx`](../../src/components/ui/dialog.tsx).
Base UI primitive: [Dialog](https://base-ui.com/react/components/dialog).

> **Default to [`Popup`](./popup.md) instead.** `Popup` renders a `Dialog` on
> desktop and a bottom `Drawer` on mobile with the same API. Reach for
> `Dialog` directly only when the modal must stay centered on every
> viewport. If you're unsure which to use, ask the human first.

## Anatomy

```tsx
<Dialog>                         {/* Dialog.Root */}
  <DialogTrigger />              {/* Dialog.Trigger */}
  <DialogPopup>                  {/* wraps Portal + Backdrop + Viewport + Popup */}
    <DialogHeader>
      <DialogTitle />            {/* Dialog.Title */}
      <DialogDescription />      {/* Dialog.Description */}
      {/* close X auto-rendered */}
    </DialogHeader>
    <DialogBody />               {/* non-scrolling content (custom) */}
    <DialogPanel />              {/* scrollable ScrollArea body (custom) */}
    <DialogFooter>               {/* action row (custom) */}
      <DialogClose />            {/* Dialog.Close */}
    </DialogFooter>
  </DialogPopup>
</Dialog>
```

Lower-level primitives are also exported: `DialogPortal`, `DialogBackdrop`,
`DialogViewport`. `DialogPopup` mounts all three for you — only reach for
them when you need a custom backdrop / viewport.

Styling is centralized in the exported slot recipe `dialogVariants`.

## Parts

- Recipe slots: `backdrop`, `viewport`, `popup`, `header`, `body`, `panelRoot`, `panel`, `footer`, `title`, `description`.
- `DialogHeader` — title + optional description + close X. Grid layout (`grid-cols-[1fr_auto]`); description spans both columns. `showCloseButton` defaults to `true`; set it to `false` if the dialog is non-dismissable from the corner.
- `DialogBody` — simple padded body (`px-6 pb-5`) for non-scrolling content like form fields.
- `DialogPanel` — **scrollable** body. Wraps its content in `ScrollArea` inside a `min-h-0 flex-1 border-t` slot. For scrolling to actually work, the popup must have a bounded height — set `className="h-[80vh]"` (or a fixed `h-[value]`) on `DialogPopup`. `max-h` alone is not enough; ScrollArea needs an explicit height constraint.
- `DialogFooter` — action row. Two variants:
  - `variant="default"` (the default — use this most of the time): full-width bordered strip with a muted tint. `color-mix(fg 7%, bg)` light, `color-mix(fg 12%, bg)` dark.
  - `variant="bare"`: no border, no tint — just bottom padding. Reach for this when the dialog is tiny and a strip would feel heavy.

## Scenarios

### 1. Classic confirmation (most common)

Header + muted footer. No body, no panel. The description does the explaining; the footer does the deciding.

```tsx
<Dialog>
  <DialogTrigger render={<Button variant="destructive">Delete workspace</Button>} />
  <DialogPopup>
    <DialogHeader>
      <DialogTitle>Delete workspace</DialogTitle>
      <DialogDescription>
        This removes all projects, data, and invites. This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
      <DialogClose render={<Button variant="destructive" />}>Delete workspace</DialogClose>
    </DialogFooter>
  </DialogPopup>
</Dialog>
```

### 2. Form dialog

Header + `DialogBody` with `Input` / `Select` fields + muted footer. This is the second-most-common shape after classic confirmation.

```tsx
<Dialog>
  <DialogTrigger render={<Button>Invite teammate</Button>} />
  <DialogPopup>
    <DialogHeader>
      <DialogTitle>Invite a teammate</DialogTitle>
      <DialogDescription>
        They&apos;ll get an email with a link to join this workspace.
      </DialogDescription>
    </DialogHeader>
    <DialogBody>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="invite-email">Email</Label>
          <Input id="invite-email" type="email" placeholder="person@company.com" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="invite-role">Role</Label>
          <Select defaultValue="member">
            <SelectTrigger id="invite-role">
              <SelectValue />
            </SelectTrigger>
            <SelectPopup>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
            </SelectPopup>
          </Select>
        </div>
      </div>
    </DialogBody>
    <DialogFooter>
      <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
      <Button>Send invite</Button>
    </DialogFooter>
  </DialogPopup>
</Dialog>
```

### 3. Scrollable content

Use `DialogPanel` for bodies that can overflow (terms of service, change logs, long lists). Set an explicit height on `DialogPopup`.

```tsx
<Dialog>
  <DialogTrigger render={<Button variant="outline">View terms</Button>} />
  <DialogPopup className="h-[80vh]">
    <DialogHeader>
      <DialogTitle>Terms of service</DialogTitle>
      <DialogDescription>Last updated April 23, 2026.</DialogDescription>
    </DialogHeader>
    <DialogPanel>
      <p className="mb-3">1. Acceptance…</p>
      <p className="mb-3">2. Accounts…</p>
      <p className="mb-3">3. Content…</p>
      <p className="mb-3">4. Termination…</p>
      <p>5. Changes…</p>
    </DialogPanel>
    <DialogFooter>
      <DialogClose render={<Button variant="outline" />}>Decline</DialogClose>
      <Button>I agree</Button>
    </DialogFooter>
  </DialogPopup>
</Dialog>
```

### 4. Minimal (bare footer)

No border between body and footer — tight, calm layout. Prefer this for single-action acknowledgements.

```tsx
<Dialog>
  <DialogPopup>
    <DialogHeader>
      <DialogTitle>You&apos;re all set</DialogTitle>
      <DialogDescription>
        We&apos;ve sent a confirmation to your inbox.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter variant="bare">
      <DialogClose render={<Button className="w-full sm:w-auto" />}>Got it</DialogClose>
    </DialogFooter>
  </DialogPopup>
</Dialog>
```

## Rules of thumb

- Default to `variant="default"` on `DialogFooter`. `variant="bare"` is the exception.
- Put form `Input` / `Select` / `Textarea` inside `DialogBody`, never inside `DialogPanel` (scroll behavior interferes with field focus).
- Titles stay concise (1 line). Descriptions are one sentence. Long copy goes in `DialogPanel`.
- For destructive / blocking flows where the user must pick an action, use [`AlertDialog`](./alert-dialog.md) instead of `Dialog`.

## API reference

### `Dialog` (Dialog.Root)
- `open?: boolean` / `defaultOpen?: boolean` — controlled / uncontrolled state.
- `onOpenChange?: (open, details) => void` — state callback.
- `modal?: boolean` (default `true`) — backdrop + focus trap.
- `dismissible?: boolean` (default `true`) — Esc / outside click closes.
- `handle?: DialogHandle` — pair with `DialogCreateHandle()` for detached triggers.
- `triggerId?: string | null` — active trigger when multiple share one Root.
- Function-as-child: `<Dialog>{({ payload }) => …}</Dialog>` (handle pattern).

### `DialogTrigger` (Dialog.Trigger)
- `render={<Button … />}` to compose with the styled button.
- `handle`, `id`, `payload` for multi-trigger / handle scenarios.
- Data: `[data-open]`.

### `DialogPopup` (wraps Portal + Backdrop + Viewport + Dialog.Popup)
- Custom: `bottomStickOnMobile` (default `true`) — full-bleed sheet on `<sm`.
- Custom: `portalProps` — passed through to `DialogPortal` (`container`, `keepMounted`).
- `initialFocus?: RefObject` — element to focus on open.
- `finalFocus?: RefObject` — element to focus on close.
- Data: `[data-open]`, `[data-closed]`, `[data-starting-style]`, `[data-ending-style]`, `[data-nested-dialog-open]`.
- CSS var: `--nested-dialogs` (count of nested open dialogs).

### `DialogTitle` / `DialogDescription`
- Render `<h2>` / `<p>` by default. Standard heading / paragraph props.

### `DialogClose` (Dialog.Close)
- `render={<Button … />}`. Data: `[data-open]`.

### `DialogBackdrop` / `DialogViewport` / `DialogPortal`
- Backdrop data: `[data-starting-style]`, `[data-ending-style]`.
- Viewport: positioning container (the popup uses `grid-rows-[1fr_auto_1fr]` for vertical centering).
- Portal: `container?: HTMLElement`, `keepMounted?: boolean`.

### `DialogCreateHandle<T>()`
Factory for cross-tree imperative open/close: `handle.open(payload?)`, `handle.close()`. Pass to `<Dialog handle={…}>` and `<DialogTrigger handle={…}>`.

### Custom slots (no base-ui counterpart)
- `DialogHeader` — `showCloseButton?: boolean` (default `true`).
- `DialogBody` — non-scrolling padded body.
- `DialogPanel` — scrollable `ScrollArea`. `scrollFade?: boolean` (default `true`). Requires bounded popup height.
- `DialogFooter` — `variant?: "default" | "bare"` (default `"default"`).

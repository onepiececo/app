# AlertDialog

Source: [`src/components/ui/alert-dialog.tsx`](../../src/components/ui/alert-dialog.tsx).
Base UI primitive: [`@base-ui/react/alert-dialog`](https://base-ui.com/react/components/alert-dialog).

`AlertDialog` mirrors [`Dialog`](./dialog.md) part-for-part. The differences
are semantic and behavioral, not API-level:

- **No close X.** `AlertDialogHeader` doesn't render a corner close button. Users must pick an action.
- **Higher viewport bias.** Viewport grid is `1fr_auto_3fr` (vs Dialog's `1fr_auto_1fr`) so the dialog sits closer to the top of the screen — more urgent-feeling.
- Same parts (`AlertDialogHeader` / `AlertDialogBody` / `AlertDialogPanel` / `AlertDialogFooter`) with the same `variant="default" | "bare"` footer options.

Use `AlertDialog` when the outcome is destructive, irreversible, or blocks a
user flow until they acknowledge. Everything else is a regular
[`Dialog`](./dialog.md).

## Anatomy

| Base UI part | Project wrapper | Notes |
| --- | --- | --- |
| `AlertDialog.Root` | `AlertDialog` | Owns open state + payload handle. |
| `AlertDialog.Trigger` | `AlertDialogTrigger` | Use `render={<Button … />}` to style. |
| `AlertDialog.Portal` | `AlertDialogPortal` | Mounted by `AlertDialogPopup` automatically. |
| `AlertDialog.Backdrop` | `AlertDialogBackdrop` (also `AlertDialogOverlay`) | `bg-black/32 backdrop-blur-sm`. |
| `AlertDialog.Viewport` | `AlertDialogViewport` | `1fr_auto_3fr` grid (vs Dialog's `1fr_auto_1fr`) — sits higher. |
| `AlertDialog.Popup` | `AlertDialogPopup` (also `AlertDialogContent`) | Bundles Portal + Backdrop + Viewport. |
| `AlertDialog.Title` | `AlertDialogTitle` | — |
| `AlertDialog.Description` | `AlertDialogDescription` | — |
| `AlertDialog.Close` | `AlertDialogClose` | Cancel button. No corner X is rendered. |
| — | `AlertDialogHeader` / `AlertDialogBody` / `AlertDialogPanel` / `AlertDialogFooter` | Project layout primitives (no Base UI counterpart). |
| `AlertDialog.createHandle` | `AlertDialogCreateHandle` | Imperative open/close + payload (see [`ai/popup.md`](./popup.md)). |

## API reference

### `AlertDialog` (Root)

| Prop | Type | Notes |
| --- | --- | --- |
| `open` / `defaultOpen` | `boolean` | Controlled / uncontrolled. |
| `onOpenChange` | `(open, details) => void` | — |
| `onOpenChangeComplete` | `(open) => void` | After enter/exit animation finishes. |
| `handle` | `AlertDialog.Handle` | Pair with `createHandle()` for detached triggers. |
| `triggerId` / `defaultTriggerId` | `string \| null` | Active trigger when using `handle`. |
| `actionsRef` | `RefObject` | Imperative `{ unmount }` handle. |
| `children` | `ReactNode \| ({ payload }) => ReactNode` | Render-fn form receives payload from `openWithPayload`. |

### `AlertDialogTrigger`

| Prop | Type | Notes |
| --- | --- | --- |
| `render` | `ReactElement \| fn` | Wrap a styled button (Base UI replacement for `asChild`). |
| `handle` | `AlertDialog.Handle` | Associate with a shared dialog. |
| `id` | `string` | Required when multiple triggers share one dialog. |
| `payload` | `any` | Forwarded to the dialog via `({ payload }) =>`. |
| `nativeButton` | `boolean` (default `true`) | Set `false` if `render` is a non-button. |

Data attrs: `data-popup-open`, `data-disabled`.

### `AlertDialogPopup` (project wrapper)

Renders `Portal → Backdrop → Viewport → Popup` in one go.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `bottomStickOnMobile` | `boolean` | `true` | Below `sm`, slide up from the bottom edge. |
| `portalProps` | `AlertDialog.Portal.Props` | — | Pass through `keepMounted`, `container`. |
| `initialFocus` | `boolean \| RefObject \| fn` | — | Focus target when opening. |
| `finalFocus` | `boolean \| RefObject \| fn` | — | Focus target on close. |

Data attrs on the underlying popup: `data-open`, `data-closed`, `data-nested`,
`data-nested-dialog-open`, `data-starting-style`, `data-ending-style`.
CSS var: `--nested-dialogs` (depth count; the popup already scales/fades by it).

### `AlertDialogClose`

| Prop | Type | Notes |
| --- | --- | --- |
| `render` | `ReactElement \| fn` | Wrap a styled button. |
| `nativeButton` | `boolean` (default `true`) | — |

### `AlertDialogCreateHandle<Payload>()`

Returns `{ isOpen, open(triggerId), openWithPayload(payload), close() }` — see
[`ai/popup.md`](./popup.md) for the full payload-driven pattern.

## Scenario — Destructive confirmation

The canonical use case.

```tsx
<AlertDialog>
  <AlertDialogTrigger render={<Button variant="destructive">Revoke sessions</Button>} />
  <AlertDialogPopup>
    <AlertDialogHeader>
      <AlertDialogTitle>Revoke all sessions?</AlertDialogTitle>
      <AlertDialogDescription>
        Everyone signed in on any device will be logged out immediately.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogClose render={<Button variant="outline" />}>Cancel</AlertDialogClose>
      <Button variant="destructive" onClick={handleRevoke}>Revoke sessions</Button>
    </AlertDialogFooter>
  </AlertDialogPopup>
</AlertDialog>
```

## Scenario — Blocking acknowledgement

Single-action alert where the user must confirm they've read something.

```tsx
<AlertDialog open={maintenanceMode}>
  <AlertDialogPopup>
    <AlertDialogHeader>
      <AlertDialogTitle>Scheduled maintenance</AlertDialogTitle>
      <AlertDialogDescription>
        The workspace will be read-only from 11pm to midnight UTC tonight.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter variant="bare">
      <AlertDialogClose render={<Button className="w-full sm:w-auto" />}>Got it</AlertDialogClose>
    </AlertDialogFooter>
  </AlertDialogPopup>
</AlertDialog>
```

## Rules of thumb

- Cancel lives in `AlertDialogClose` (closes the dialog). The destructive / primary action is a plain `Button` that calls your handler, which closes the dialog on success.
- Don't pass `showCloseButton={false}` — the alert header doesn't render an X in the first place.
- For form input inside an alert, prefer a regular [`Dialog`](./dialog.md). AlertDialog is for decisions, not data entry.
- Everything else about parts, scenarios, and footer variants: see [`ai/dialog.md`](./dialog.md).

# Toast

Source: [`src/components/ui/toast.tsx`](../../src/components/ui/toast.tsx).
Base UI primitive: [Toast](https://base-ui.com/react/components/toast) — `@base-ui/react/toast`.

## Anatomy

```
Toast.Provider              // owns the manager + global timing
└── Toast.Portal
    └── Toast.Viewport      // stacked container (corner-anchored)
        └── Toast.Root      // one per toast; carries swipe + state
            └── Toast.Content
                ├── Toast.Title
                ├── Toast.Description
                ├── Toast.Action     // single-action slot (we prefer data.actions / data.buttonActions)
                └── Toast.Close
```

For anchored toasts (see [Anchored toasts](#anchored-toasts)) the viewport
wraps `Toast.Positioner` (with `anchor` / `side` / `sideOffset` /
`align` / `alignOffset`) which then wraps a `Toast.Root`.

`toastVariants` is exported as the slot recipe for compact/rich layout,
stacked toast positioning, anchored toast surfaces, icon slots, action
rows, and typography. Keep new toast chrome in that recipe instead of
adding one-off utility strings inside render branches.

## API reference

**`Toast.Provider`** — `limit` (default 3), `timeout` (ms, default 5000),
`toastManager` (instance from `Toast.createToastManager()`).

**`Toast.Root`** — `toast` (the `ToastObject`, required), `swipeDirection`
(array, e.g. `['down', 'right']`).

**`Toast.Positioner`** (anchored only) — `anchor`, `side`, `sideOffset`,
`align`, `alignOffset`.

**`Toast.createToastManager()` / `Toast.useToastManager()`** return
`{ toasts, add, close, update, remove, promise }`.

- `add(options)` → returns id; pass an explicit `id` to upsert (dedup).
- `update(id, options)` mutates in place; bumps `updateKey`.
- `promise(promise, { loading, success, error })` — see [The promise pattern](#the-promise-pattern).

**Key data attributes** (read in CSS on `Toast.Root`):

- `data-expanded` — viewport hovered/focused; toasts take natural height.
- `data-limited` — over the `limit`; fading out.
- `data-swiping`, `data-swipe-direction=up|down|left|right`.
- `data-starting-style` / `data-ending-style` — enter/exit phases.
- `data-behind` — non-frontmost toasts (used to fade content on collapse).

**CSS variables** on `Toast.Root`: `--toast-height`, `--toast-index`,
`--toast-offset-y`, `--toast-swipe-movement-x` / `-y`. Our wrapper also
defines `--toast-calc-height`, `--toast-gap`, `--toast-peek`,
`--toast-scale` for the stack transform math.

Tooltip-DNA surface (shadow ring + inset highlight) painted with the
theme's popover colors. Two modes — **compact** (no title, single-line
description) and **rich** (title + description + timestamp + actions) —
with four rich layout variants.

## Setup

`ToastProvider` is mounted once in `src/components/providers.tsx`. From
any client component, import the manager and call `.add()`:

```tsx
import { toastManager } from "@/components/ui/toast";

toastManager.add({
  type: "success",
  description: "Invite sent to john.doe@glacier.net",
});
```

No hooks, no context, no `<Toaster />` child — just a function call from
anywhere (same DX as Sonner's `toast()`).

## Modes

A toast renders as **compact** when you don't pass a `title`, and as
**rich** when you do. For rich toasts, pick the layout with
`data.variant`.

### Compact

One line. Defaults to a filled-tone circle icon derived from `type` and
a closable X. Auto-dismisses at `timeout`.

```tsx
toastManager.add({
  type: "success",
  description: "Invite sent to john.doe@glacier.net",
  timeout: 4000,
});
```

Replace the close X with an inline action (Cancel / Undo / Retry).
When `data.action` is present the close X is suppressed — the action is
the dismissal affordance.

```tsx
const id = toastManager.add({
  type: "info",
  description: "Generating an image…",
  timeout: 0, // persistent; the action is the escape hatch
  data: {
    action: {
      label: "Cancel",
      onClick: () => toastManager.close(id),
    },
  },
});
```

A hairline `Separator` divides the description from the ghost Button.

### Rich

Has a `title`. Pick one of four layouts via `data.variant`:

| `variant` | When |
| --- | --- |
| `"stroke"` | **Default.** Tonal stroke icon on the left. Most informational. |
| `"filled"` | Filled-tone circle icon (matches compact's icon). Unifies compact + rich into one visual family. |
| `"inline-meta"` | Title + vertical `Separator` + timestamp share the top row. Chat-feed feel. Shorter vertical. |
| `"tonal-title"` | No icon. Title text takes the tone color. Minimalist; best for dense feeds. |

```tsx
toastManager.add({
  type: "success",
  title: "Task completed",
  description:
    "I've finished generating the result based on your instructions.",
  timeout: 6000,
  data: {
    variant: "stroke",
    timestamp: "1 Jan 2026, 9:23 pm",
    actions: [{ label: "Review output" }, { label: "Refine result" }],
  },
});
```

### Actions

Two styles, pick per-toast:

- **`data.actions`** — inline link-buttons, dot-separated. Renders as
  `<Button variant="link">` with a `·` between them. Use for soft /
  navigational follow-ups ("View", "Manage", "Learn why").
- **`data.buttonActions`** — real Buttons. Use for decision / recovery
  flows ("Retry", "Undo", "Delete"). Each item takes a Button `variant` —
  `"destructive"` for red (Delete), `"default"` for the primary action.

```tsx
// Decision toast — button actions
toastManager.add({
  type: "warning",
  title: "Delete this workspace?",
  description: "Members will lose access immediately.",
  timeout: 0,
  data: {
    variant: "stroke",
    buttonActions: [
      { label: "Delete", variant: "destructive", onClick: confirmDelete },
      { label: "Cancel", variant: "ghost" },
    ],
  },
});
```

### Type / tones

`type` drives the leading icon, the icon color, and — for the
`tonal-title` variant — the title color.

| `type` | Purpose |
| --- | --- |
| `"info"` | Announcements, context updates, benign changes. Sky. |
| `"success"` | Post-success confirmation. Emerald. |
| `"warning"` | Non-blocking caution. Amber. |
| `"error"` | Failed / blocking. Rose. |
| `"loading"` | In-flight — `promise()` sets this automatically. Animated spinner. |

## The promise pattern

For async work, use `toastManager.promise()`. It fires a compact
loading toast up-front and updates the same toast in place to a rich
success (or error) when the promise settles. Same DOM element — height
animates automatically; the exit animation plays correctly on eventual
dismiss because the original toast instance is retained.

```tsx
toastManager
  .promise<string, ToastData>(sendInvite(email), {
    loading: {
      description: "Sending invite…",
      data: { variant: "stroke" },
    },
    success: (email) => ({
      title: "Invite sent",
      description: `An invite was delivered to ${email}.`,
      timeout: 5000,
      data: {
        variant: "stroke",
        timestamp: "just now",
        actions: [{ label: "View invite" }, { label: "Copy link" }],
      },
    }),
    error: (err: Error) => ({
      title: "Couldn't send invite",
      description: err.message,
      timeout: 0,
      data: {
        variant: "stroke",
        buttonActions: [{ label: "Retry", variant: "default" }],
      },
    }),
  })
  // promise() returns the underlying promise — its rejection bubbles up
  // by default. Swallow it so React doesn't surface an unhandled-rejection
  // warning; the error toast already shows the failure.
  .catch(() => {});
```

**Hover-pause caveat.** base-ui pauses every toast's dismiss timer
while the viewport is hovered or focused (standard — you don't want
a toast vanishing while the user is reading it). If the cursor is
parked over the stack when a promise settles, the success toast stays
open until the user moves away. Not a bug.

**Don't replace `promise()` with manual `add({ id, ... })` upserts.**
It looks tempting but the exit animation on the frontmost toast can
fail to play after an id-based upsert. `promise()` handles this
correctly.

## Deduplication

Pass an explicit `id` to upsert instead of stacking. The same DOM
element updates in place and its dismiss timer restarts.

```tsx
toastManager.add({ id: "save", description: "Saving…", timeout: 0 });
// …later, same id:
toastManager.add({
  id: "save",
  title: "Saved",
  description: "Your changes were saved.",
  timeout: 3000,
  data: { variant: "filled" },
});
```

## Imperative updates

`toastManager.update(id, options)` mutates a live toast in place
without restarting the timer. `updateKey` increments on every update —
include it in a React `key` if you want entrance animations to replay.

## Anchored toasts

A second manager is exported for contextual toasts attached to a
trigger element (e.g. "Copied!" next to a copy button). Wrap the
subtree that needs it in `AnchoredToastProvider`, then pass
`positionerProps` with an `anchor`:

```tsx
import { anchoredToastManager } from "@/components/ui/toast";

anchoredToastManager.add({
  description: "Copied to clipboard!",
  positionerProps: {
    anchor: buttonRef.current,
    side: "top",
    sideOffset: 8,
  },
});
```

Anchored toasts share the full API (compact / rich / variants /
actions) with stacked toasts — they just render at the anchor instead
of in the viewport corner.

## `ToastManagerUpdateOptions` reference

Shape accepted by `toastManager.add()` / `.update()` / each state of
`.promise()`. Top-level fields are base-ui's; `data` is our payload.

```ts
type ToastManagerUpdateOptions<Data extends {} = ToastData> = {
  title?: React.ReactNode;
  type?: "info" | "success" | "warning" | "error" | "loading" | string;
  description?: React.ReactNode;
  timeout?: number;                   // ms; 0 = persistent
  priority?: "low" | "high";
  onClose?: () => void;               // fires on any close reason
  onRemove?: () => void;              // fires after unmount
  actionProps?: Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "ref"
  >;                                   // base-ui's single-action slot; prefer data.actions / data.buttonActions
  positionerProps?: {                 // anchored only
    anchor?: Element | null;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    sideOffset?: number;
    alignOffset?: number;
  };
  data?: Data;                        // see ToastData
};
```

Our `ToastData`:

```ts
type ToastData = {
  variant?: "stroke" | "filled" | "inline-meta" | "tonal-title";
  timestamp?: string;
  actions?: { label: string; onClick?: () => void }[];          // inline link-buttons, "·"-separated
  buttonActions?: {
    label: string;
    onClick?: () => void;
    variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  }[];
  action?: { label: string; onClick?: () => void };             // compact inline action (replaces close X)
  closable?: boolean;                                           // default true
  icon?: React.ReactNode;                                       // overrides the type-derived leading icon
  tooltipStyle?: boolean;                                       // anchored-only: tiny tooltip-shaped variant
};
```

## Animation principles

Lifted from Emil Kowalski's Sonner — the feel most users now expect:

- **CSS transitions, not keyframes.** Keyframes aren't interruptible
  mid-flight, so new toasts arriving during animation make older ones
  jump into place. base-ui uses transitions for transform / opacity /
  height that retarget smoothly when the stack shifts. Don't swap to
  `animation:` for stack motion.
- **Stack by index.** Each toast scales by `1 - 0.1 * index` and
  shifts up by a peek amount; behind toasts compress under the
  frontmost. Driven by `--toast-index` / `--toast-peek` /
  `--toast-scale`.
- **Match the frontmost height.** Collapsed, all toasts render at the
  frontmost's height (via `--toast-calc-height`). On hover / focus the
  viewport expands and each toast takes its natural height.
  `Toast.Content` has `overflow: hidden` so taller toasts behind the
  frontmost get clipped until expanded.
- **Gap-filling `::after`.** An invisible pseudo-element fills the
  gap above/below each toast so moving the cursor between toasts
  doesn't drop the expanded state.
- **Momentum swipe.** `swipeDirection` derives from the viewport
  position (bottom-right swipes right or down, etc.). Swipe fires on
  distance *or* velocity threshold, like Sonner.
- **Auto-dismiss with pause-on-hover.** base-ui pauses the dismiss
  timer while the viewport is hovered or focused. Intentional — toasts
  shouldn't vanish mid-read.

## Rules of thumb

- **One toast per user-facing event.** Don't fire a compact success
  and a rich "here's what we did" for the same save — pick one.
- **`timeout: 0` for anything the user MUST decide.** Destructive
  confirmations, permission prompts, "are you sure". Never auto-dismiss
  a consequential decision.
- **Use `promise()` for anything async.** Don't hand-roll
  `add()` + `update()` — `promise()` handles the loading → settled flow
  correctly including the exit animation.
- **`id` your retryable toasts.** If a save can be retried, always
  pass an explicit `id` so retries upsert instead of piling up.
- **Inline actions for reading, button actions for doing.** Links for
  "View in sidebar" / "See logs"; Buttons for "Retry" / "Undo" /
  "Delete".
- **Keep compact copy under ~60 chars.** It truncates otherwise. Longer
  copy → promote to rich.

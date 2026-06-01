# Button

Source: [`src/components/ui/button.tsx`](../../src/components/ui/button.tsx).
Base UI primitive: [Button](https://base-ui.com/react/components/button) (via
`useRender` from `@base-ui/react/use-render`, not `@base-ui/react/button`).

The single button component for the entire system. Seven variants × ten
sizes × loading state. The chrome here is the **shared design language**
that propagates to every interactive control: the `secondary` variant
produces the chrome shared by `Input` / `Slider` thumb / `NumberField`
buttons; the `default` (primary) variant matches the gradient + bevel
used by `Switch` checked / `Checkbox` checked / `Radio` checked.

The Figma-style shadow stack the system uses everywhere:

```
0 2px 4px rgba(0,0,0,.10)            ambient drop
0 0 0 1px <ring color>                crisp 1px ring (replaces border)
inset 0 1px 0 rgba(255,255,255,X)    subtle top highlight
```

## Anatomy

Single-part primitive — the project's `Button` is built on `useRender`
rather than the `Button` part directly, but the surface is equivalent.

| Base UI | Project wrapper | Renders |
| --- | --- | --- |
| `Button` (or `useRender({ defaultTagName: "button" })`) | `Button` | `<button>` (or whatever `render` swaps in) |

## Parts

- `Button` — the only export. Accepts `variant`, `size`, `loading`,
  plus everything `useRender` supports (so `render={<a … />}` /
  `render={<Link … />}` swaps the underlying element while keeping
  the chrome).
- `buttonVariants` — exported `tailwind-variants` recipe. Reuse it when you need a
  button-shaped element that isn't actually a button (e.g. a styled
  `<a>` outside of `render`, or composing the chrome into a custom
  element).

## API reference

### Button props

| Prop | Type | Description |
| --- | --- | --- |
| `variant` | `"default" \| "secondary" \| "outline" \| "ghost" \| "link" \| "destructive" \| "success"` | Chrome family. Default `"default"`. |
| `size` | `"xs" \| "sm" \| "default" \| "lg" \| "xl" \| "icon-xs" \| "icon-sm" \| "icon" \| "icon-lg" \| "icon-xl"` | Height + padding. Default `"default"`. |
| `loading` | `boolean` | Disables the button and overlays a `Spinner` while keeping width stable. |
| `disabled` | `boolean` | Standard disabled. `loading` implies disabled. |
| `render` | `ReactElement \| ((props, state) => ReactElement)` | Swap the underlying element (e.g. `<a>`, `<Link>`). Adopts button semantics. |
| `nativeButton` | `boolean` | Base UI flag — set to `false` when rendering a non-button element. Default `true`. |
| `focusableWhenDisabled` | `boolean` | Keep focusable while `disabled`. |
| `className` | `string \| ((state) => string)` | Static or state-derived classes. |
| `style` | `CSSProperties \| ((state) => CSSProperties)` | Static or state-derived inline styles. |

### Data attributes

| Attribute | When |
| --- | --- |
| `data-disabled` | Button is disabled. |
| `data-loading` | `loading` is true (project-specific — drives the spinner overlay via `group-data-loading/button:*`). |
| `data-pressed` | Active / pressed (toolbar-toggle pattern). |
| `data-popup-open` | Set by base-ui triggers (Menu / Popover / Dialog) when the button is acting as a trigger and the popup is open. |

### State

```ts
type ButtonState = { disabled: boolean };
```

## Variants

| Variant | Use for |
| --- | --- |
| `default` (primary) | The single most important action on the surface. Solid `bg-primary` with gradient + ring + top highlight. |
| `secondary` | Sibling of primary. Tinted `foreground/7` mix with the same gradient + ring. Same chrome family as `Input` / `NumberField` / `Slider` thumb. |
| `outline` | Quiet action with structure. `bg-background` with a 1px ring. The default `Open menu` / `Trigger` style. |
| `ghost` | Icon buttons in toolbars, hover-only affordances, list rows. Transparent until hovered. |
| `link` | Inline text actions. Underlined, color-only feedback. |
| `destructive` | Delete / archive / remove. `bg-destructive` with the same gradient pattern. **Always confirm via `AlertDialog` for irreversible actions.** |
| `success` | Confirmed positive action such as publish, approve, or activate. Same solid chrome as destructive with `bg-success`. |

## Sizes

| Size | h × px | Use for |
| --- | --- | --- |
| `xs` | 7 (mobile) / 6 (sm+), `text-xs` on sm+ | dense table rows, tag-like actions |
| `sm` | 8 / 7 | secondary buttons in compact toolbars |
| `default` | 9 / 8 | the default for everything |
| `lg` | 10 / 9 | primary CTA on landing-page sections |
| `xl` | 11 / 10 | hero CTAs |
| `icon-xs` | 7 / 6 (square) | tag-close, kbd hints |
| `icon-sm` | 8 / 7 | toolbar icons next to a label button |
| `icon` | 9 / 8 | the default icon-button size (matches `default` height) |
| `icon-lg` | 10 / 9 | floating action buttons |
| `icon-xl` | 11 / 10 | mobile-first hero icon |

## Scenarios

### 1. Primary / secondary pair

```tsx
<div className="flex gap-2">
  <Button variant="secondary">Cancel</Button>
  <Button>Save</Button>
</div>
```

The default is primary, so the most-emphatic button is just `<Button>`.

### 2. Icon button

```tsx
<Button variant="ghost" size="icon">
  <SettingsIcon />
</Button>
```

### 3. Loading state

```tsx
<Button loading>Saving…</Button>
```

When `loading` is true: button is disabled, content is invisible (kept
in flow to preserve width), and a `Spinner` overlays in the same
grid cell. Stays the same width — no layout shift.

### 4. As a link / Next.js Link

```tsx
import Link from "next/link";

<Button render={<Link href="/dashboard" />}>Dashboard</Button>
```

`useRender` swaps the underlying element. Chrome / size / loading
all still work. The button-loading state is gracefully ignored on
non-button renders.

### 5. Inside `MenuTrigger` / `PopoverTrigger` / `DialogTrigger`

```tsx
<MenuTrigger render={<Button variant="outline" />}>Open menu</MenuTrigger>
```

base-ui's triggers all accept `render` for adopting button semantics.
The trigger handles the open state via `data-popup-open`; you don't
have to manage anything.

### 6. Destructive with confirmation

```tsx
<AlertDialog>
  <AlertDialogTrigger render={<Button variant="destructive">Delete project</Button>} />
  <AlertDialogPopup>…</AlertDialogPopup>
</AlertDialog>
```

### 7. Pressed state (toolbar toggles)

```tsx
<Button variant="ghost" size="icon" data-pressed={isBold ? "" : undefined}>
  <BoldIcon />
</Button>
```

`data-pressed` triggers the same press visual as `:active` —
useful for toggle buttons in editors / toolbars.

### 8. Composing the chrome onto a custom element via `buttonVariants`

```tsx
<Tag asChild className={buttonVariants({ variant: "secondary", size: "sm" })}>
  …
</Tag>
```

Reach for this only when `render` won't work (third-party component
that doesn't forward refs, custom DOM structure).

## Pitfalls

- **`type` defaults to `"button"`** when not using `render` — this
  prevents accidental form submits. When using `render={<a … />}`,
  the type is omitted automatically.
- **`loading` implies `disabled`.** Don't pass both.
- **Icons inside the button auto-size** to `size-4.5` (mobile) /
  `size-4` (sm+) at 80% opacity, with `-mx-0.5` so they tuck in
  tight. Override per-icon with `className="size-…"` if you need a
  larger icon.
- **Press feedback translates down by 1px** via `active:not-disabled:translate-y-px` and `data-pressed:not-disabled:translate-y-px`. Don't add another press transform.
- **Don't wrap a `Button` in another link / button** — base-ui's
  `useRender` collapses the elements when you use `render`. A
  `<Link><Button>…</Button></Link>` produces nested interactive
  elements that screen readers complain about; `<Button render={<Link
  />}>…</Button>` is correct.

## Rules of thumb

- **One `default` (primary) button per surface.** The whole point of
  `bg-primary` is that there's exactly one most-important action
  visible at a time.
- **Cancel / Close → `secondary` or `ghost`.** Never `outline` for
  the cancel half of a confirm pair — the visual weight competes
  with the primary.
- **Icon buttons need a label.** Either `aria-label="…"` directly
  on the button, or wrap with a `Tooltip`.
- **`destructive` is rare.** Use for irreversible actions only —
  delete, archive, remove. Don't use red for "stop / cancel".
- **`link` is for inline text actions** that look like links —
  reach for `outline` or `ghost` for any standalone action.
- **Size scales with surface.** `default` for forms / panels, `lg`
  for landing-page sections, `xl` for hero CTAs, `sm` for compact
  toolbars, `xs` for dense table rows.

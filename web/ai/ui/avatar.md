# Avatar

Source: [`src/components/ui/avatar.tsx`](../../src/components/ui/avatar.tsx).
Built on [`@base-ui/react/avatar`](https://base-ui.com/react/components/avatar).

A compact identity marker. Supports image, initials, and default-icon
fallbacks; two shapes × six sizes × eight tones; corner badges (status
dot, count, verified check, brand logo, custom icons); overlapping
groups with `+N` overflow; and an empty-state "add user" variant.

Exports `avatarVariants`, a slot-based `tailwind-variants` recipe for root,
image, fallback, icon, badge/status, empty-state, and group styling.

## Anatomy

| Base UI part | Project wrapper | Element | Notes |
| --- | --- | --- | --- |
| `Avatar.Root` | `Avatar` | `<span>` | Adds `size` + `shape` variants and the surrounding ring. |
| `Avatar.Image` | `AvatarImage` | `<img>` | Hides on error → `AvatarFallback` takes over. |
| `Avatar.Fallback` | `AvatarFallback` | `<span>` | Tinted via `tone`. |
| `Avatar.Fallback` | `AvatarIconFallback` | `<span>` | Shorthand for the person-silhouette icon. |
| — | `AvatarBadge` | `<span>` | Project addition. Generic corner badge. |
| — | `AvatarStatus` | `<span>` | Project addition. Colored status dot (built on `AvatarBadge`). |
| — | `AvatarEmpty` | `<button>` | Project addition. Dashed "add user" tile. |
| — | `AvatarGroup` | `<div>` | Project addition. Overlapping stack with `+N` overflow. |

## API reference

### `Avatar` (Root)

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `size` | `"xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl"` | `"md"` | Drives diameter + text size. |
| `shape` | `"circle" \| "square"` | `"circle"` | Square uses `rounded-[25%]`; badges follow shape. |
| `render` | `ReactElement \| (props, state) => ReactElement` | — | Replace the rendered element. |

State exposed to `className`/`render` functions: `{ imageLoadingStatus: "idle" | "loading" | "loaded" | "error" }`.

### `AvatarImage`

| Prop | Type | Notes |
| --- | --- | --- |
| `src`, `alt` | standard `<img>` | — |
| `onLoadingStatusChange` | `(status) => void` | Hook into `idle / loading / loaded / error` transitions. |

Data attrs: `data-starting-style`, `data-ending-style` for image fade in/out.

### `AvatarFallback`

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `tone` | `AvatarTone` | `"neutral"` | Tints background + text. Use `avatarToneFromSeed(name)` for stable per-user color. |
| `delay` | `number` | — | Milliseconds to wait before showing fallback (avoid flash on fast loads). |

### `AvatarBadge` (project)

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `position` | `"top-right" \| "bottom-right" \| "top-left" \| "bottom-left"` | `"bottom-right"` | — |
| `children` | `ReactNode` | — | Count, icon, brand mark, etc. |

### `AvatarStatus` (project)

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `tone` | `"online" \| "offline" \| "busy" \| "away"` | `"online"` | — |
| `position` | same as `AvatarBadge` | `"bottom-right"` | — |

### `AvatarGroup` (project)

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `size`, `shape` | same as `Avatar` | `"md"` / `"circle"` | Forwarded to children. |
| `max` | `number` | — | Truncates to a `+N` tile. |
| `spacing` | `"tight" \| "default" \| "loose"` | `"default"` | Overlap distance. |
| `items` | `AvatarGroupItem[]` | — | Data-driven shorthand (wins over children). |

## Tones and seed-based color

Fallbacks take a `tone`: `neutral / amber / emerald / sky / blue /
violet / pink / rose`. For deterministic-from-name coloring, use
`avatarToneFromSeed(name)` — it hashes the string and returns a stable
tone so "Amelia" always picks the same color across renders and
sessions.

```tsx
import { Avatar, AvatarFallback, avatarToneFromSeed } from "@/components/ui/avatar";

<Avatar>
  <AvatarFallback tone={avatarToneFromSeed(user.name)}>
    {user.initials}
  </AvatarFallback>
</Avatar>
```

## Scenarios

### 1. Image with initials fallback

```tsx
<Avatar size="md">
  <AvatarImage src={user.avatarUrl} alt={user.name} />
  <AvatarFallback tone={avatarToneFromSeed(user.name)}>
    {user.initials}
  </AvatarFallback>
</Avatar>
```

`AvatarImage` stops rendering if the URL fails; the fallback appears
automatically — no manual error handling.

### 2. Initials-only (no image)

```tsx
<Avatar size="md">
  <AvatarFallback tone="emerald">AM</AvatarFallback>
</Avatar>
```

### 3. Default icon fallback (unknown user)

```tsx
<Avatar size="md">
  <AvatarIconFallback tone="neutral" />
</Avatar>
```

### 4. With status dot

```tsx
<Avatar size="lg">
  <AvatarImage src={user.avatarUrl} alt={user.name} />
  <AvatarFallback tone={avatarToneFromSeed(user.name)}>
    {user.initials}
  </AvatarFallback>
  <AvatarStatus tone="online" />
</Avatar>
```

### 5. Custom corner badge (notification count, verified, brand)

```tsx
{/* Notification count */}
<Avatar>
  <AvatarFallback tone="sky">AM</AvatarFallback>
  <AvatarBadge position="top-right" className="size-[35%] bg-sky-500 text-[9px] text-white">
    3
  </AvatarBadge>
</Avatar>

{/* Verified check */}
<Avatar>
  <AvatarFallback tone="emerald">JD</AvatarFallback>
  <AvatarBadge position="bottom-right" className="size-[38%] bg-sky-500 text-white">
    <CheckIcon className="size-[60%]" strokeWidth={3.5} />
  </AvatarBadge>
</Avatar>
```

The badge inherits shape from the avatar (square avatar → rounded
square badge; circle avatar → circular badge).

### 6. Group — overlapping stack

Two equivalent APIs:

```tsx
{/* Composed children */}
<AvatarGroup size="md" max={3}>
  {members.map((m) => (
    <Avatar key={m.id}>
      <AvatarFallback tone={avatarToneFromSeed(m.name)}>
        {m.initials}
      </AvatarFallback>
    </Avatar>
  ))}
</AvatarGroup>

{/* Data-driven shorthand — same output */}
<AvatarGroup
  size="md"
  max={3}
  items={members.map((m) => ({ name: m.name, src: m.avatarUrl }))}
/>
```

`items` derives initials + tone from `name`; if `src` is set, the image
is rendered (with the derived fallback behind it).

### 7. Empty "add / invite" slot

```tsx
<AvatarEmpty size="md" shape="circle" onClick={openInviteDialog} />
```

Renders as a `<button>`, so `onClick`, `disabled`, focus ring, etc. all
work.

### 8. Interactive avatar (as a button or link)

Wrap the avatar — don't bake interactivity into the primitive:

```tsx
<button type="button" className="inline-flex rounded-full transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring ring-offset-2 ring-offset-background active:scale-95">
  <Avatar size="md">
    <AvatarFallback tone={avatarToneFromSeed(user.name)}>
      {user.initials}
    </AvatarFallback>
  </Avatar>
</button>
```

### 9. `+N` tile with popover menu

Use a `Menu` whose trigger is an `Avatar` rendered as the overflow tile:

```tsx
<Menu>
  <MenuTrigger
    openOnHover
    nativeButton={false}
    render={
      <Avatar size="md" className="cursor-pointer">
        <AvatarFallback tone="neutral">+{overflow.length}</AvatarFallback>
      </Avatar>
    }
  />
  <MenuPopup side="bottom" align="end">
    {overflow.map((m) => (
      <MenuItem key={m.id}>
        <Avatar size="xs">
          <AvatarFallback tone={avatarToneFromSeed(m.name)}>
            {m.initials}
          </AvatarFallback>
        </Avatar>
        {m.name}
      </MenuItem>
    ))}
  </MenuPopup>
</Menu>
```

`nativeButton={false}` tells base-ui the trigger is a non-`<button>`
element (Avatar renders a `<span>`), and it wires the ARIA accordingly.

### 10. Hover ring + tooltip on a group

```tsx
<TooltipProvider delay={250}>
  <div className="flex -space-x-2 [&_[data-slot=avatar]]:ring-2 [&_[data-slot=avatar]]:ring-background">
    {members.map((m) => (
      <Tooltip key={m.id}>
        <TooltipTrigger
          render={
            <Avatar
              size="md"
              className="cursor-pointer transition-[box-shadow,translate] duration-150 hover:z-10 hover:-translate-y-0.5 hover:ring-sky-500"
            >
              <AvatarFallback tone={avatarToneFromSeed(m.name)}>
                {m.initials}
              </AvatarFallback>
            </Avatar>
          }
        />
        <TooltipPopup side="bottom">{m.name}</TooltipPopup>
      </Tooltip>
    ))}
  </div>
</TooltipProvider>
```

## Rules of thumb

- **Always include a fallback.** Even when `AvatarImage` is set —
  `<AvatarFallback>` takes over on load error and on slow networks.
- **Use `avatarToneFromSeed(name)` for colored fallbacks.** Don't hard-
  code tones per user, and don't pick at random (avatars need to be
  stable across renders).
- **Size the leading icon relative to the avatar**, not in absolute
  px. `AvatarIconFallback` already does this (`[&_svg]:size-[58%]`).
- **`size-1/4` for status dots.** Matches Tailwind UI's proportional
  scaling. `AvatarStatus` handles this for you.
- **Compose tightly** for groups: `<AvatarGroup items={…} />` beats
  hand-written mapping when the data is already an array.
- **Don't use `+N` as a Menu trigger without `nativeButton={false}`** —
  base-ui will warn about button semantics.
- **Interactive avatars use a wrapper `<button>` or `<a>`** — keep the
  `Avatar` primitive presentational. That way any avatar (compact,
  rich, with badge, etc.) is trivially clickable without fighting the
  API.

# Breadcrumb

Source: [`src/components/ui/breadcrumb.tsx`](../../src/components/ui/breadcrumb.tsx).

Exports `breadcrumbVariants`, a slot-based `tailwind-variants` recipe for the
list, item, link, page, separator, slash separator, and ellipsis parts.

A breadcrumb trail using Tailwind UI's structure — **the separator
lives inside each crumb's `BreadcrumbItem`**, not as a sibling.
That means no double-separator gaps when you collapse middle
segments and no fragile spacing math.

Each `BreadcrumbItem` is `flex items-center gap-x-1.5` so a separator
+ link stay compact. The list itself uses `gap-x-1` with `flex-wrap` so
long trails can wrap on narrow viewports without `space-x-*` issues.

## Parts

- `Breadcrumb` — `<nav aria-label="Breadcrumb">` wrapper.
- `BreadcrumbList` — the `<ol role="list">`. `flex flex-wrap items-center gap-y-2 gap-x-1`.
- `BreadcrumbItem` — `<li className="flex items-center gap-x-1.5">`. Holds a `BreadcrumbSeparator` (optional, omit on the root) and a `BreadcrumbLink` / `BreadcrumbPage`.
- `BreadcrumbLink` — interactive segment. Built on `useRender` so
  it accepts `render={<Link href="…" />}` for Next.js routing.
  `text-sm font-medium text-muted-foreground hover:text-foreground`.
- `BreadcrumbPage` — the current page. `<span aria-current="page">`,
  `text-foreground` (no hover).
- `BreadcrumbSeparator` — chevron-right by default. Pass children
  to override (e.g. a custom slash SVG). `text-muted-foreground/55`.
- `BreadcrumbSlashSeparator` — pre-built 45° slash separator
  (Tailwind UI example 2). Renders the same custom path SVG with
  `text-muted-foreground/55`.
- `BreadcrumbEllipsis` — `MoreHorizontalIcon` for collapsed middles.
  Wrap inside a `BreadcrumbLink` to make it interactive ("expand
  the hidden segments").

## Scenarios

### 1. Plain text trail

```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Workspace</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbPage>Q4 launch plan</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

### 2. Home-icon root + chevron separators (Tailwind UI ex 1)

```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/" aria-label="Home">
        <HomeIcon />
      </BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbPage>Project Nero</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

`<HomeIcon />` is auto-sized via the `BreadcrumbLink`'s
`[&>svg]:size-5 [&>svg]:shrink-0` rule — don't pass an explicit size.

### 3. Slash separator (Tailwind UI ex 2)

```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/" aria-label="Home"><HomeIcon /></BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbItem>
      <BreadcrumbSlashSeparator />
      <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbItem>
      <BreadcrumbSlashSeparator />
      <BreadcrumbPage>Project Nero</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

### 4. Custom separator (e.g. middle dot)

```tsx
<BreadcrumbSeparator>
  <span aria-hidden>·</span>
</BreadcrumbSeparator>
```

The `BreadcrumbSeparator` accepts children — pass any node, the
wrapper handles `text-muted-foreground/55` + `inline-flex`.

### 5. Collapsed middle (with interactive ellipsis)

```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/" aria-label="Home"><HomeIcon /></BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbLink href="/expand" aria-label="Show hidden segments">
        <BreadcrumbEllipsis />
      </BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbPage>Q4 launch plan</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

The ellipsis is its own crumb with its own separator on the left
— same `flex items-center gap-x-1.5` math as any other item, no
empty gap.

### 6. With Next.js Link

```tsx
import Link from "next/link";

<BreadcrumbLink render={<Link href="/projects" />}>Projects</BreadcrumbLink>
```

## Pitfalls

- **The separator goes INSIDE `BreadcrumbItem`, not between items.**
  This is the breaking change from the legacy shadcn pattern. The
  upside is no fragile spacing — the item handles its own
  `flex items-center gap-x-4` and the list handles inter-item
  spacing.
- **Don't put a separator on the root item.** It reads as "left
  of nothing". If your first crumb is the root (no parent), it
  goes into a `BreadcrumbItem` with just the link / icon, no
  separator.
- **`aria-label="Home"` on icon-only link is required.** The
  `<HomeIcon />` is `aria-hidden`, so screen readers need a label
  to know what the link does.
- **Ellipsis should be wrapped in a `BreadcrumbLink`** if it's
  interactive ("show hidden segments"). If it's purely decorative
  (truncation), drop the link and use `BreadcrumbEllipsis` directly
  inside the item.
- **`BreadcrumbList` uses `gap-x-1` not `space-x-*`** so it works
  with `flex-wrap` (long trails wrap to a new line on narrow
  viewports).

## Rules of thumb

- **Always use the home-icon root** for app-level breadcrumbs —
  saves space and is universally recognized as "back to start."
- **Use plain text root** when the trail starts at a feature root
  (e.g. "Settings → General → Profile" inside a settings surface).
- **Chevron is the default**; reach for `BreadcrumbSlashSeparator`
  for URL-feel surfaces (dev tools, file paths, repo browsers).
- **Collapse the middle past 5 segments.** Past that, the trail
  becomes unreadable; replace middle segments with a clickable
  ellipsis.
- **Last item is `BreadcrumbPage`** (not `BreadcrumbLink`) — it's
  the current page, shouldn't be linked, and gets `text-foreground`
  for visual emphasis.

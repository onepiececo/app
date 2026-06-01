# Pagination

Source: [`src/components/ui/pagination.tsx`](../../src/components/ui/pagination.tsx).

A page-link row built on top of `Button`'s `outline` / `ghost`
variants. Two production patterns:

- **Status (default for most cases)** — `Previous` button on the
  left, `Page X of Y` centered, `Next` button on the right. No
  number row. For tables / lists with many pages where the user
  jumps page-by-page, not by direct page targeting.
- **Numbered** — `Previous` + `1 2 3 … N` + `Next`. For surfaces
  where users want to jump directly to a specific page (search
  results, archive index).

Both variants use **word-only** Previous/Next buttons (no chevrons).
Stacked icon-above-word designs were dropped in favor of a clean
text-only treatment.

## Parts

- `Pagination` — `<nav aria-label="pagination">` wrapper.
- `PaginationContent` — `<ul>` flex row by default. Pass
  `layout="spread"` for the Status pattern.
- `PaginationItem` — `<li>` wrapper for each link / status / ellipsis.
- `PaginationLink` — page link. Pass `isActive` for the current
  page (renders with `aria-current="page"` and the `outline`
  Button variant; non-active uses `ghost`).
- `PaginationPrevious` / `PaginationNext` — word-only "Previous" /
  "Next" links. Use `default` Button size so they match the row
  height.
- `PaginationStatus` — "Page X of Y" status text. Pass `current`
  and `total` numbers.
- `PaginationEllipsis` — `…` separator for collapsed page ranges.
- `paginationVariants` — exported slot recipe for root/content/status/
  ellipsis structure. Link chrome comes from `buttonVariants`.

## Scenarios

### 1. Status pattern (recommended default)

```tsx
<Pagination>
  <PaginationContent layout="spread">
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationStatus current={2} total={12} />
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

`layout="spread"` switches `PaginationContent` from its default flex
row to a 3-column grid (`1fr_auto_1fr`). First item lands left, middle
is **true-centered** regardless of Previous / Next button widths, last
lands right. Use this for the Status pattern.

(The older `className="w-full justify-between"` recipe also works but
the status text drifts off-center as soon as Previous and Next have
different widths — `layout="spread"` is the proper fix.)

### 2. Numbered pattern (when direct page targeting matters)

```tsx
<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">3</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">12</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

### 3. With Next.js Link

```tsx
import Link from "next/link";

<PaginationLink render={<Link href="/posts?page=2" />} isActive>2</PaginationLink>
```

`PaginationLink` is built on `useRender`, so swap the underlying element
to a `Link` and routing works. The button chrome is still applied to the
rendered element.

### 4. Disabled (first / last page)

```tsx
<PaginationPrevious href="#" aria-disabled className="pointer-events-none opacity-64" />
```

`PaginationLink` renders an `<a>`, so there's no native disabled
state. Apply `aria-disabled` + `pointer-events-none opacity-64`
yourself when the link should be inert.

### 5. Without `href` (button-style pagination)

```tsx
<PaginationLink render={<button type="button" onClick={() => goTo(2)} />}>2</PaginationLink>
```

For SPAs that handle pagination via state (no URL change), render
the link as a `<button>`. The chrome stays the same.

## Pitfalls

- **No icon-only previous/next.** The icon-stacked-above-word
  treatment was dropped — it wraps awkwardly at narrow widths and
  doesn't scan well at desktop widths either. If you need to save
  space, use the Status pattern (no number row) which already
  saves more horizontal space than icon buttons.
- **`PaginationPrevious` / `PaginationNext` are word-only.** Don't
  add chevron icons inside them. The hierarchy of "Previous · 1
  · 2 · 3 · Next" reads as a clean row of equal-weight items.
- **Numbered pattern needs an `aria-label="Pagination"`** on the
  outer `Pagination` (the wrapper sets this automatically).
- **`PaginationLink` is an `<a>` by default** — no native disabled.
  Use `aria-disabled` + the dim-and-block-pointer classes for
  disabled state.
- **For SPAs**, render PaginationLink with `render={<button … />}`
  or `render={<Link … />}` (Next.js). Don't put `<button>` content
  inside an `<a>`.

## Rules of thumb

- **Use the Status pattern** (Page X of Y) for ~80% of cases —
  table footers, log lists, comment threads. Users jump
  page-by-page, not by direct number.
- **Use the Numbered pattern** when users actually browse by
  number — search results ("page 7 was where the good link was"),
  archive listings, paginated browse pages.
- **5 numbers max in the numbered pattern**: `[Previous] 1 2 3 … N [Next]`.
  Past that, the row becomes noise. The `…` ellipsis collapses
  middle pages.
- **`PaginationStatus` has tabular-nums + foreground for numbers**
  — the page count is the focus. Don't override the typography.
- **For SPAs / dynamic pages**, swap `PaginationLink` to a button
  via `render` and bind your `onClick` to a router push.

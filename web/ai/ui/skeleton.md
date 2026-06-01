# Skeleton

Source: [`src/components/ui/skeleton.tsx`](../../src/components/ui/skeleton.tsx).

One canonical animation: a horizontal light sweep across a tinted track
(same `color-mix` formula as the `Progress` track — a 14% foreground mix
in light mode, 18% in dark), running at the same time as an opacity
breathe. No variants, no props beyond `className` — pass width / height /
radius there.

`skeletonVariants` is exported for custom loading layouts that need the
same shimmer track without rendering the `Skeleton` wrapper directly.

The animation is registered in [`src/styles/globals.css`](../../src/styles/globals.css)
as `--animate-skeleton-breathe` (composing two keyframes: the horizontal
background-position sweep and the opacity breathe).

## Scenarios

### 1. Text lines

Three bars at varying widths. The classic "loading paragraph" placeholder.

```tsx
<div className="flex flex-col gap-2">
  <Skeleton className="h-4 w-3/5" />
  <Skeleton className="h-4 w-4/5" />
  <Skeleton className="h-4 w-2/5" />
</div>
```

### 2. User row

Avatar placeholder + two lines.

```tsx
<div className="flex items-center gap-3">
  <Skeleton className="size-10 rounded-full" />
  <div className="flex flex-1 flex-col gap-2">
    <Skeleton className="h-4 w-40" />
    <Skeleton className="h-3 w-28" />
  </div>
</div>
```

### 3. Card

Cover image + title + body lines. Match the real card's shape so the
skeleton → content transition doesn't reflow.

```tsx
<div className="flex flex-col gap-3 rounded-xl border border-border bg-background p-3">
  <Skeleton className="h-32 w-full rounded-lg" />
  <Skeleton className="h-4 w-4/5" />
  <Skeleton className="h-3 w-full" />
  <Skeleton className="h-3 w-3/5" />
</div>
```

### 4. Table rows

Keep the same column structure and spacing as the real table so the layout
doesn't jump when the data arrives.

```tsx
<div className="flex flex-col gap-2">
  {[0, 1, 2].map((i) => (
    <div key={i} className="grid grid-cols-[1fr_auto_auto] items-center gap-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-6 w-12 rounded-md" />
    </div>
  ))}
</div>
```

## Rules of thumb

- Match the real content's shape as closely as possible — width, height, gap, radius. The point is zero layout shift when the data loads.
- Use `rounded-full` for avatars, `rounded-sm` (default) for text, `rounded-lg` for images/covers, `rounded-md` for buttons/chips.
- Don't nest skeletons inside each other — they'll run two sweep animations at slightly different phases and look busy. Flatten to a grid or flex row of siblings.
- For indeterminate loading where no shape is predictable (a network call before the container renders), use [`Spinner`](../../src/components/ui/spinner.tsx) instead.
- Keep skeletons on screen for at least ~200ms. Flashing one in and immediately swapping it for content looks broken; it's better to skip the skeleton entirely if the fetch is that fast.

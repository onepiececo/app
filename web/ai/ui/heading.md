# Heading

Source: [`src/components/ui/heading.tsx`](../../src/components/ui/heading.tsx).

Two styled heading components — `Heading` for surface titles and
`Subheading` for subsection labels. Both take a `level` prop
(`1`–`6`) that picks which `<h?>` tag is rendered (defaulting to `h1`
for `Heading`, `h2` for `Subheading`). The visual size is fixed by the
component, decoupled from the semantic level — so you can render an
`h2`-tagged section title that looks the same as an `h1`-tagged page
title.

Both use `font-heading font-semibold tracking-tight text-foreground`.
Sizes shrink slightly on `sm+` (consistent with the rest of the
system's text-base → sm:text-sm convention).

## Parts

- `Heading` — the surface title. `text-2xl` → `sm:text-xl`. Defaults
  to `<h1>`.
- `Subheading` — the subsection title. `text-base` → `sm:text-sm`.
  Defaults to `<h2>`.
- `headingVariants` — exported slot recipe with `heading` and
  `subheading` slots.

Both share `font-heading font-semibold tracking-tight text-foreground`.

## Scenarios

### 1. Page title (default `h1`)

```tsx
<Heading>Workspace settings</Heading>
```

### 2. Section title that's actually an h2

```tsx
<Heading level={2}>Members</Heading>
```

Same visual weight as the page title above, but rendered as `<h2>`
for outline / a11y purposes.

### 3. Subheading inside a section

```tsx
<Subheading>Pending invites</Subheading>
```

Defaults to `<h2>`. Smaller visual weight than `Heading`.

### 4. Stack — page title + subhead

```tsx
<div className="flex flex-col gap-1">
  <Heading>Members</Heading>
  <p className="text-sm text-muted-foreground">Manage who has access to this workspace.</p>
</div>
```

### 5. With supporting controls inline

```tsx
<div className="flex items-center justify-between gap-4">
  <Heading level={2}>Pending invites</Heading>
  <Button variant="outline" size="sm">Invite members</Button>
</div>
```

### 6. Inside a Card

```tsx
<Card>
  <CardHeader>
    <Subheading>Plan</Subheading>
  </CardHeader>
  …
</Card>
```

## Pitfalls

- **The `level` prop controls the tag, NOT the visual size.** If you
  want a smaller heading, use `Subheading`. If you want an even
  smaller heading, override with `className="text-xs"` or compose a
  custom heading directly.
- **Don't skip levels.** A page should have one `h1`, then `h2`s
  underneath, then `h3`s — visually identical headings can have
  different `level` values to keep the document outline sane.
- **`text-foreground`** is the default — override with `className`
  for muted titles inside cards / panels (`text-muted-foreground`).

## Rules of thumb

- **One `Heading` per surface** acting as the title. Use `level`
  to drop the semantic tag without changing the visual.
- **Use `Subheading` inside cards / panels / sections** that already
  have a parent `Heading`.
- **Pair with a `<p>` description** for any non-trivial title — the
  description tells the user what they can do here, the title tells
  them where they are.
- **Never use Heading for inline labels.** Reach for `Label` for
  form controls, `Subheading` for section-level dividers within a
  surface.

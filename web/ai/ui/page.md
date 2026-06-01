# Page

Source: [`src/components/ui/page.tsx`](../../src/components/ui/page.tsx).

Page-shell primitives for full-height panes that need a consistent header
bar and scrollable body. `Page` owns `--page-gutter`; `PageHeader` and
`PageBody` consume it so spacing can be retuned in one place.

## Parts

- `Page` — outer flex column. Sets `--page-gutter` to `--spacing(4)`.
- `PageHeader` — fixed-height header row with optional bottom divider.
- `PageBody` — scrollable body with configurable padding bleed.
- `pageVariants` — exported slot recipe with `root`, `header`, and `body`
  slots plus `divider` and `bleed` variants.

## Examples

```tsx
<Page>
  <PageHeader>
    <SidebarTrigger />
    <h2 className="flex-1 font-semibold text-sm">Dashboard</h2>
  </PageHeader>
  <PageBody>Content</PageBody>
</Page>
```

Use `bleed` when a table, chat transcript, or media region needs to reach
the pane edge:

```tsx
<PageBody bleed="bottom">Table with sticky footer</PageBody>
<PageBody bleed="x">Full-bleed media</PageBody>
<PageBody bleed="all">Custom scroll container</PageBody>
```

## API

- `PageHeader divider?: boolean` — default `true`.
- `PageBody bleed?: "none" | "x" | "y" | "top" | "bottom" | "left" | "right" | "all"` — default `"none"`.

## Rules Of Thumb

- Use `Page` inside app shells or `SidebarInset` surfaces.
- Use `divider={false}` when the shell already has its own visual boundary.
- Prefer `bleed` over local negative margins for edge-to-edge scroll areas.

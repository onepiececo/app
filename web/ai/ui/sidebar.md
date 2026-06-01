# Sidebar

App-shell sidebar built on shadcn's primitive. Default tone uses
`var(--popover)` so the sidebar reads as part of the same surface family
as `Select` / `Popover` / `Card`. Three layout variants (`plain` /
`floating` / `inset`) plus an opt-in `SidebarMenuCollapsible` group
helper.

Styling is split across two recipes:

- `sidebarVariants` — public layout recipe for external shell tuning
  (`panel`, `page`, visual variant, side, flush flags).
- `sidebarUiVariants` — internal slot recipe for wrapper, desktop shell,
  rail, inset page, groups, menu rows, actions, badges, skeletons, and sub
  menu rows.

## Parts

- `SidebarProvider` — wraps everything; owns the open/collapsed state.
- `Sidebar` — left or right panel. `variant`, `side`, `collapsible` props.
- `SidebarHeader` / `SidebarContent` / `SidebarFooter` — three vertical
  slots inside `Sidebar`.
- `SidebarGroup` / `SidebarGroupLabel` / `SidebarGroupContent` — a
  section. Use multiple `SidebarGroup` siblings for visual gaps between
  sections (no spacer needed).
- `SidebarMenu` / `SidebarMenuItem` / `SidebarMenuButton` /
  `SidebarMenuBadge` — leaf nav row with optional badge.
- `SidebarMenuCollapsible` — built-in collapsible group (label + icon +
  chevron + animated panel + tooltip + auto-close on icon-mode
  collapse). Wraps a `SidebarMenuSub` of children.
- `SidebarMenuSub` / `SidebarMenuSubItem` / `SidebarMenuSubButton` —
  child rows inside a `SidebarMenuCollapsible`.
- `SidebarInset` — the page card next to the sidebar; pair with
  [`Page` / `PageHeader` / `PageBody`](./page.md) for the inside-shell
  layout.
- `SidebarTrigger` — the `PanelLeft` toggle button.
- `SidebarRail` — thin rail along the sidebar edge for plain variant.

## Layout variants

```tsx
<SidebarProvider defaultOpen>
  <Sidebar variant="inset" collapsible="icon">…</Sidebar>
  <SidebarInset>
    <Page>
      <PageHeader>
        <SidebarTrigger />
        <h2 className="text-sm font-semibold">Dashboard</h2>
      </PageHeader>
      <PageBody>…</PageBody>
    </Page>
  </SidebarInset>
</SidebarProvider>
```

Swap the `variant` prop:

- `variant="sidebar"` (alias **plain**) — sidebar hugs the page; hairline
  border between them. Use when the sidebar is the dominant chrome.
- `variant="floating"` — sidebar is a rounded card with `m-2` margin
  and a soft layered drop shadow (no 1px ring); page sits beside it on
  the wrapper bg. Use for marketing-style app shells.
- `variant="inset"` — sidebar disappears into a unified `bg-sidebar`
  tray; page is a rounded card recessed inside it with a 1px
  `color-mix(--foreground, --background)` ring + soft drop + dual-edge
  inset highlight (the same outline-button recipe used in
  `Button variant="outline"`). Use when the sidebar nav and the page
  card should feel like co-equal cards on a tray. **This is the
  default layout for this project's app shell.**

## Behavior variants (collapse / interaction)

The `variant` prop above controls visual chrome. Independently, the
`collapsible` prop and the optional `rail` boolean control how the
sidebar collapses and what the user grabs to toggle it:

- **Rail** — `<Sidebar variant="sidebar" collapsible="icon" rail />` with
  `defaultOpen={false}` on the provider. Permanent ultra-narrow
  icon-only strip. Click the rail handle (built-in via `rail` prop) to
  expand. Pattern: VS Code activity bar.
- **Drawer** — `<Sidebar variant="sidebar" collapsible="offcanvas" />`.
  When closed, the sidebar slides off-screen entirely instead of
  collapsing to icons. Pattern: Stripe details pane.
- **Hover-expand** — `<Sidebar variant="sidebar" collapsible="icon" />`
  with `defaultOpen={false}` plus controlled `open` driven by
  `onMouseEnter`/`onMouseLeave`. Add a 200ms close-delay timer to avoid
  flicker on quick mouse passes. Pattern: macOS Dock, Linear collapsed.

The `rail?` boolean prop on `Sidebar` auto-renders `<SidebarRail />`
inside — saves the consumer from importing and placing it. Skip the
prop for `drawer` (offcanvas) — the rail floats with no sidebar
attached when offscreen.

## Alternative shells (no `Sidebar` component)

These two layouts are structurally different from the Sidebar shell —
they don't use `<Sidebar>` at all, just hand-rolled chrome:

- **Top nav** — horizontal app bar at the top, no side sidebar. Free
  vertical real estate for editor / dashboard surfaces. Pattern:
  GitHub, Vercel.
- **Split** — narrow icon rail (sections) + wider sub-nav column (the
  active section's items) + page. Two stacked sidebars side-by-side.
  Pattern: Slack, Mail.app, Notion two-column.

See `src/app/test/page.tsx` for both shells inline.

## Default surface (color-mix lift)

`globals.css` sets `--sidebar: color-mix(in srgb, var(--foreground) 4%,
var(--background))` for both light and dark mode. The sidebar reads as
a subtle 4% lift above the page bg — enough contrast in light mode,
matches the project's depth scale (same recipe as input bg / button
secondary surface) in dark mode. No surface variant override is needed
for the common case.

## PageHeader divider per layout

The page-shell `PageHeader` has a default `divider` (bottom hairline)
that anchors the header to a card edge. Drop it for the **floating**
layout — the page has no card chrome around it, so the divider would
float in space:

```tsx
<PageHeader divider={layout !== "floating"}>
  <SidebarTrigger />
  <ThemeToggle />
</PageHeader>
```

For `plain` and `inset`, the default `divider` is correct (anchors to
the page card / page edge).

## Color variant — "bone" sidebar

Override `--sidebar` on the `SidebarProvider` to retune the tray /
sidebar color in one place. Borders and accents derive from it
automatically (they're alpha-based off the foreground). Pair with a
matching dark value:

```tsx
<SidebarProvider
  defaultOpen
  className="[--sidebar:#fafaf8] dark:[--sidebar:#16140f]"
>
  <Sidebar variant="inset">…</Sidebar>
  <SidebarInset>…</SidebarInset>
</SidebarProvider>
```

Because the inset variant fills the wrapper area with `bg-sidebar`, the
override automatically paints the recess **and** the sidebar itself.
For floating / plain layouts the override only changes the sidebar
panel (the page area stays `bg-background`).

For palettes that follow the project's depth scale, use the
`color-mix(in srgb, var(--foreground) X%, var(--background))` recipe:

```tsx
className="[--sidebar:color-mix(in_srgb,var(--foreground)_4%,var(--background))]"   // subtle raise
className="[--sidebar:color-mix(in_srgb,var(--foreground)_12%,var(--background))]"  // recessed tray
```

The recipe inverts cleanly between modes since `--foreground` and
`--background` flip — no `dark:` override needed.

## Collapsible group

`SidebarMenuCollapsible` is the canonical collapsible nav item. It
handles the chevron rotation (via base-ui's `data-panel-open`), the
height animation (via `CollapsibleContent`'s
`--collapsible-panel-height`), the icon-mode close (closes itself when
`useSidebar().state === "collapsed"`), and the tooltip default.

```tsx
<SidebarMenu>
  <SidebarMenuItem>
    <SidebarMenuButton tooltip="Dashboard">
      <LayoutDashboard />
      <span>Dashboard</span>
    </SidebarMenuButton>
  </SidebarMenuItem>

  <SidebarMenuCollapsible label="Projects" icon={FolderClosed} defaultOpen>
    <SidebarMenuSub>
      <SidebarMenuSubItem>
        <SidebarMenuSubButton isActive>Active</SidebarMenuSubButton>
      </SidebarMenuSubItem>
      <SidebarMenuSubItem>
        <SidebarMenuSubButton>Archived</SidebarMenuSubButton>
      </SidebarMenuSubItem>
    </SidebarMenuSub>
  </SidebarMenuCollapsible>
</SidebarMenu>
```

`mt-1.5 first:mt-0` is baked in so a collapsible group sitting below
leaf items gets natural breathing room without a spacer. For a bigger
section break, wrap groups in separate `<SidebarGroup>` blocks.

## Right panel pattern

shadcn's `Sidebar` supports `side="right"` for a second panel — but its
open state is shared with the left via `SidebarProvider`. For an
independent right panel (Activity dock, chat, inspector), hand-roll a
sibling `<aside>` and mirror the same `variant` chrome.

A minimal pattern:

```tsx
type PanelSide = "left" | "right";

const [panels, setPanels] = useState<Record<PanelSide, boolean>>({
  left: true,
  right: false,
});
const togglePanel = (side: PanelSide) =>
  setPanels((p) => ({ ...p, [side]: !p[side] }));

<SidebarProvider defaultOpen>
  <Sidebar variant="inset">…</Sidebar>
  <SidebarInset>
    <Page>
      <PageHeader>
        <SidebarTrigger />
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => togglePanel("right")}
        >
          <PanelRight />
        </Button>
      </PageHeader>
      <PageBody>…</PageBody>
    </Page>
  </SidebarInset>
  <ActivityPanel open={panels.right} variant="inset" />
</SidebarProvider>
```

`ActivityPanel` is a thin `<aside>` that animates `width: 18rem ↔ 0`
with `overflow-hidden`, plus an inner card that mirrors the left
sidebar's chrome per variant (no chrome for inset, `rounded-lg border
shadow-sm/5` for floating, side seam for plain).

### Without the right panel

If you don't need a second panel, just drop the `ActivityPanel`. The
state map and toggle button can also go.

```tsx
<SidebarProvider defaultOpen>
  <Sidebar variant="inset">…</Sidebar>
  <SidebarInset>
    <Page>
      <PageHeader>
        <SidebarTrigger />
        <h2 className="text-sm font-semibold">Dashboard</h2>
      </PageHeader>
      <PageBody>…</PageBody>
    </Page>
  </SidebarInset>
</SidebarProvider>
```

## Conventions

- Every file rendering a `Sidebar` must wrap children in
  `SidebarProvider` (mobile sheet + open state need it).
- Wrap the page-side action buttons in a `TooltipProvider` so collapsed
  sidebar tooltips share timing — see [`tooltip.md`](./tooltip.md).
- Always use `Button size="icon"` (not `icon-sm`) for header buttons so
  they match `SidebarTrigger`'s footprint.
- For brand / account "icon block + label" patterns, use
  `SidebarMenuButton size="lg"` + the `ICON_SLOT_BUTTON` className
  pattern (`group-data-[collapsible=icon]:justify-center
  group-data-[collapsible=icon]:px-0`) so the icon block centers when
  the sidebar collapses.
- For RTL safety, the inset / flush class strings use `ms` / `me`
  (logical) rather than `ml` / `mr` (physical).

## Reference

Full live shell at `src/app/test/page.tsx`. Primitive at
`src/components/ui/sidebar.tsx`.

# Frame

Source: [`src/components/ui/frame.tsx`](../../src/components/ui/frame.tsx).

A **section tray** for settings-style pages. Borderless `bg-muted/72`
container with a subtle inset shadow that holds `FrameHeader` text +
multiple `FramePanel` cards + `FrameFooter` text. Header / footer text
sits *on the tray surface*; panels are bordered-less raised cards
*inside the tray*.

## Frame vs. Card vs. CardFrame

- **`Card`** — single tile (pricing card, content panel, list row).
- **`CardFrame`** — single stat callout with a *sunken inner panel*
  (dashboard tile where the inner data should feel weighted).
- **`Frame`** — section tray that holds *multiple* inner panels with
  shared header + footer text on the tray. Use for settings pages,
  workspace section groupings, multi-section preference forms.

If you only need one panel with a heading and footer, reach for
`Card`. If you need a stat tile with one inner data area, reach for
`CardFrame`. Frame earns its weight when there are *two or more*
related sub-sections that belong to the same logical group.

## Parts

- Exports `frameVariants`, a slot-based `tailwind-variants` recipe with `root`, `panel`, `header`, `title`, `description`, and `footer` slots.
- `Frame` — outer tray. `bg-muted/72`, `rounded-2xl`, `p-1`, light inset shadow. No outer border. Auto-spaces direct `FramePanel` children with a 4px (`mt-1`) gap via the `*:[[data-slot=frame-panel]+[data-slot=frame-panel]]:mt-1` selector.
- `FramePanel` — inner card surface. `bg-background`, `rounded-xl`, `p-5`, soft `shadow-xs/5`, plus a 1px `before` pseudo top-line highlight (matches Card / CardFrame chrome). **No visible border** — the bg contrast against the muted tray does the lifting.
- `FrameHeader` — `header` element with `px-5 py-4` padding. Sits on the tray surface above the first panel. Use for the section's title + description.
- `FrameTitle` — `font-semibold text-sm`. Pairs with `FrameDescription`.
- `FrameDescription` — muted helper text below the title.
- `FrameFooter` — `footer` element with `px-5 py-4` padding + `text-muted-foreground text-sm`. Sits on the tray below the last panel.

## Scenarios

### 1. Workspace settings (the canonical use)

Title + description on the tray, two `FramePanel`s with form controls,
"last updated" footer.

```tsx
<Frame>
  <FrameHeader>
    <FrameTitle>Workspace settings</FrameTitle>
    <FrameDescription>
      Manage your workspace name, region, and team.
    </FrameDescription>
  </FrameHeader>

  <FramePanel>
    <h3 className="font-semibold text-sm">General</h3>
    <p className="text-muted-foreground text-sm">
      Workspace name and default region.
    </p>
    <div className="mt-4 flex flex-col gap-1.5">
      <Label htmlFor="ws-name" className="text-xs">Workspace name</Label>
      <Input id="ws-name" defaultValue="Template" />
    </div>
  </FramePanel>

  <FramePanel>
    <h3 className="font-semibold text-sm">Members</h3>
    <p className="text-muted-foreground text-sm">
      People with access to this workspace.
    </p>
    <div className="mt-4 flex items-center justify-between gap-3">
      <AvatarGroup items={members} max={3} size="sm" />
      <Button variant="outline" size="sm">Invite</Button>
    </div>
  </FramePanel>

  <FrameFooter>Last updated 2 hours ago.</FrameFooter>
</Frame>
```

### 2. Just panels, no header / footer

Header and footer are optional. A bare `Frame` with two `FramePanel`s
still reads correctly — the muted tray groups them visually.

```tsx
<Frame>
  <FramePanel>…</FramePanel>
  <FramePanel>…</FramePanel>
</Frame>
```

### 3. Single panel — don't use Frame

If you only have one panel, use `Card` (or `CardFrame` if it needs
emphasis). Frame's tray reads as "container for *multiple* things"; a
solo panel inside a tray feels redundant.

## Rules of thumb

- **Frame is for sections with 2+ sub-panels.** One panel → `Card`.
- **No border on `FramePanel`.** The contrast between `bg-background`
  (panel) and `bg-muted/72` (tray) does the visual lifting. Adding a
  visible border on top of the contrast made the panels feel "too
  obvious" in design rounds — the chrome competes with itself.
- **Header / footer text lives on the tray, not in a panel.** That's
  the whole point of the FrameHeader / FrameFooter slots — letting the
  title breathe directly on the muted surface.
- **Don't nest `Frame`s.** A Frame inside a Frame inverts the contrast
  (light-on-light) and the inset shadow stacks weirdly. If you have
  hierarchy, use `Frame` for the outer section and `Card` (not nested
  Frame) for any inner grouping.
- **Don't add an outer border to `Frame`.** The borderless bg + light
  inset is the picked direction (rounds 10–13). Adding a hairline
  border on top fights the inset and makes Frame look like a Card with
  shadow — losing its identity.

### What to avoid (banned across rounds 1–13)

- **No corner brackets, crop marks, or L-shaped accents** on a rounded tray. They fight the curved corners.
- **No color-tone variants** (info / success / warning / destructive). Frame is a structural section container, not a semantic surface.
- **No numbered indices on panels** (`01`, `02`). Reads as TOC, not settings.
- **No eyebrow tags** (`SECTION`, `EMPTY`) above the title.
- **No drop shadows, halos, vignettes, frosted blur, gradient backgrounds, dashed borders, or pattern overlays** on the tray. All explored, all rejected — they push Frame away from its quiet section-container identity.
- **No floating / standalone-panel layouts** (no tray, panels with their own drop shadows). Loses the grouping that's the whole point.
- **No CardFrame-style sunken inner panels.** That treatment belongs to `CardFrame` (single stat callout). Frame's panels are *raised* against a *recessed* tray — the inverse.

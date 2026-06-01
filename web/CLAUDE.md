# CLAUDE.md

@AGENTS.md

See [AGENTS.md](./AGENTS.md) — the full instructions for coding agents in this repo (stack, commands, server/client rules, Next.js 16 specifics, Better-Auth wiring, Apsara conventions). Everything applies to Claude.

## Always use `cn()` for className

`cn()` (from [`@/lib/utils`](./src/lib/utils.ts)) merges Tailwind classes with
`tailwind-merge` so later utilities win conflicts cleanly. **Never** build a
className with template literals (``` `${a} ${b}` ```) or string concatenation
when you have two or more class fragments — that path doesn't dedupe and lets
duplicate or conflicting utilities collide.

```tsx
// Yes
className={cn(
  "h-7 px-2 rounded-md",
  isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
  className,
)}

// No
className={`h-7 px-2 rounded-md ${isActive ? "bg-muted" : "hover:text-foreground"} ${className}`}
```

The single-class case (no concatenation) is fine to leave as a plain string
attribute. The moment you have two or more fragments to combine, reach for
`cn()`.

## UI component usage — `ai/` folder

Per-component usage docs live in [`ai/`](./ai/) at the repo root, one file per
component. Before editing or using a UI component from `src/components/ui/`,
read `ai/<component-name>.md` first — it lists the parts, variants, common
scenarios, and house conventions.

File naming matches the component: `src/components/ui/popup.tsx` →
[`ai/popup.md`](./ai/popup.md). See [`ai/README.md`](./ai/README.md) for the
full index and how to contribute a new file.

When you introduce a new UI component or a new variant, add or update the
corresponding `ai/` file in the same change.

## Modals — default to `Popup`

For dialog-style UI and any menu popup that's expected to work on mobile,
**default to [`Popup`](./ai/popup.md)**. `Popup` renders a centered `Dialog`
on `md+` viewports and a bottom `Drawer` on `< md` — same API, best-in-class
mobile feel with no extra code from the caller.

Reach for [`Dialog`](./ai/dialog.md) or [`Drawer`](./src/components/ui/drawer.tsx)
directly **only** when the UI must keep the same layout on every viewport
(for example: a marketing modal that should never become a bottom sheet, a
persistent side panel that should stay a drawer on desktop, or a feature that
needs drawer-specific affordances like `DrawerSwipeArea` or nested
`DrawerMenu`).

For destructive / blocking confirmations, use
[`AlertDialog`](./ai/alert-dialog.md) — there isn't an adaptive equivalent
because alert dialogs don't translate to drawers cleanly.

**If you're not sure which to use, ask before implementing.** Popup is the
default; deviating is a product choice the human should make.

## Variant rounds — `/test` page

When restyling a component to match the new design language, use the `/test`
route as a scratchpad and iterate in **rounds**:

1. **Round 1** — generate **5 clearly distinct variants** (A–E) of the target
   component on `/test`. Each variant must be a genuinely different direction,
   not a tonal tweak. Show every variant against the **same sample content**
   (same labels, same colors, same states) so only the *styling* differs. Label
   each block `Variant A`, `Variant B`, …
2. **User votes** — the user replies with what they liked and disliked. A
   dislike can be a whole variant or a specific trait ("the gradient fill",
   "the uppercase text"). When the user says they **never** want something
   again, that trait is permanently banned — it must not reappear in any
   future round, including in combination with liked traits.
3. **Round N+1** — produce 5 new variants built **only** from liked traits,
   remixed in new combinations, and introducing fresh ideas that don't
   overlap with the banned list. Losing variants from prior rounds must not
   re-appear as-is or as a near-copy.
4. **Converge** — repeat until the user picks a winner. Then promote the
   winning styling to `src/components/ui/<component>.tsx`, update
   `ai/<component>.md`, wire any new examples into the components showcase,
   and reset `/test` for the next component.

Track the running **liked / banned** list across rounds in the conversation
(and persist to memory if it's likely to matter for future components — e.g.
"user dislikes uppercase badge text" is a cross-component preference worth
remembering).

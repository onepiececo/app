# Variant rounds — the `/test` workflow

How we iterate on a component's visual design before promoting it to
`src/components/ui/`. Referenced from [`CLAUDE.md`](../CLAUDE.md).

The `/test` route is a **scratchpad**. It is never imported elsewhere and its
contents are overwritten every round. Styling lives *locally* on the page
until a winner is picked — only then does it move into the component file.

## The loop

1. **Set up the page.** Put the `COMPONENT` name and current `ROUND` number
   in the file header. Reuse the template below so every round reads the
   same way.
2. **Round 1 — five genuinely distinct directions.** Not tonal tweaks of one
   idea; five *different* takes. Label them `Variant A` through `Variant E`.
   Render each against the **same sample content** so only the styling
   differs.
3. **User votes.** The reply will identify likes, dislikes, and anything to
   **ban**. Track these across rounds in the conversation. A ban is
   permanent — the trait does not reappear in any future round, including
   in combination with liked traits.
4. **Round N+1 — five new variants.** Built only from liked traits, remixed
   in new combinations, plus fresh ideas that don't overlap with the banned
   list. Losing variants from prior rounds must not re-appear as-is or as
   near-copies.
5. **Converge.** Repeat until the user picks a single winner.
6. **Promote.**
   - Rewrite `src/components/ui/<component>.tsx` to match the winning
     direction. Restructure the API if the new styling justifies it (e.g.
     adding an `appearance` prop).
   - Update `src/app/components/page.tsx` so the showcase row exercises the
     new surface (every appearance × key variant).
   - Create or update `ai/<component>.md` with props, scenarios, and rules
     of thumb.
   - Reset `/test` back to the template (empty round, no variants) ready for
     the next component.

## Guardrails

- **Use the real components.** Build with the production primitives from
  `src/components/ui/` first-hand — `Button`, `Input`, `Select`, `Switch`,
  `Table`, and friends — not hand-rolled `<button>` / `<input>` / `<select>`.
  Before reaching for one, read its doc in [`ai/ui/`](./ui/)
  (`ai/ui/<component>.md`), or open the component source in
  `src/components/ui/<component>.tsx` to confirm the props. The *only* thing
  that stays local on the page is the styling of the surface actually under
  test — every surrounding control should be the real component so the vote
  reflects the production surface.
- **One file, no cross-imports of variant styling.** Keep the under-test
  variant styling inline on the page. Don't edit the production component
  until a winner is chosen — otherwise the "compare" step is lying. (Importing
  the shipped components above is expected, that's not the same as editing the
  component you're iterating on.)
- **Identical sample content across variants.** If Variant A shows a
  success + warning + danger row, *every* variant shows the same row.
  Otherwise the vote compares content, not design.
- **Five variants per round, no more.** Forces commitment to distinct
  directions and keeps the voting surface scannable on one screen.
- **Preserve the winning DNA.** In Round N+1, every variant should still
  carry the traits the user explicitly liked. "Five new directions" doesn't
  mean "start from scratch".
- **Document bans.** After the final round, drop anything worth keeping
  into memory (e.g. "user dislikes uppercase badge text") if it's a
  cross-component preference.

## The `/test` template

`src/app/test/page.tsx` is always the current round page. Between rounds it
resets to the skeleton below. Per-round, replace the placeholder variant
block with five real variants and set `COMPONENT` / `ROUND`.

```tsx
import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const COMPONENT = "Badge";
const ROUND = 2;

// Shared sample content — EVERY variant renders this identical data so only
// styling differs.
const SAMPLES = [
  { tone: "neutral", label: "GMT+3" },
  { tone: "success", label: "Verified" },
  { tone: "warning", label: "Review" },
  { tone: "info", label: "Pending" },
  { tone: "danger", label: "High Risk" },
];

// One small presentational component per variant. Styles stay local to
// /test until a winner is promoted into src/components/ui/<component>.tsx.
function VariantA({ sample }: { sample: (typeof SAMPLES)[number] }) {
  return <span className="...">{sample.label}</span>;
}
// …VariantB, VariantC, VariantD, VariantE

function VariantBlock({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
      <header className="flex items-baseline justify-between gap-4">
        <h2 className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
          Variant {id}
        </h2>
        <span className="text-sm font-medium">{title}</span>
      </header>
      <p className="text-xs text-muted-foreground">{description}</p>
      <div className="flex flex-wrap items-center gap-2 pt-1">{children}</div>
    </section>
  );
}

export default function TestPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-background/80 px-4 py-3 backdrop-blur sm:px-6">
        <Link href="/" className="text-sm font-medium">← Template</Link>
        <span className="text-sm text-muted-foreground">
          {COMPONENT} · Round {ROUND}
        </span>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            {COMPONENT} — Round {ROUND}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            One-line framing of what this round is exploring.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <VariantBlock id="A" title="…" description="…">
            {SAMPLES.map((s) => <VariantA key={s.label} sample={s} />)}
          </VariantBlock>
          {/* …Variant B–E */}
        </div>
      </main>
    </div>
  );
}
```

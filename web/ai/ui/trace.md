# Trace

Source: [`src/components/ui/trace.tsx`](../../src/components/ui/trace.tsx).

A Gantt-style run-trace visualization. Each top-level step renders as a row
with a label on the left and a time-positioned bar on the right; nested
sub-steps appear as collapsible children that share the parent's indent.
The signature visual move: every top-level step **cascades** 14px further
right than the previous one, so the eye reads the run as a staircase down
the rows rather than a uniform table.

Built for run-detail pages (Inngest concept lives at
[`/concepts/inngest`](../../src/app/concepts/inngest/page.tsx)). Use it
anywhere you have a sequence of timed steps to visualize.

`traceVariants` is exported as the slot recipe for the header, gridlines,
rows, labels, chevrons, and status bars. Status and active-row styling
live in the recipe rather than inline conditionals.

## Data shape

```ts
type TraceStatus = "done" | "running" | "queued" | "failed";

type TraceStep = {
  id: string;
  label: string;
  startMs: number;        // absolute, from start of the run
  durationMs: number;     // self-time
  status?: TraceStatus;   // controls bar color (default "done" → success green)
  active?: boolean;       // highlights the row + bolds the label
  children?: TraceStep[]; // nested sub-steps
};

type TraceProps = {
  totalMs: number;
  steps: TraceStep[];
  cascadePx?: number;     // px the next top-level step indents past the previous. Default 14.
  labelColPx?: number;    // label-column width in px. Default 320.
  title?: ReactNode;      // rendered in the timeline header above the cascade
  className?: string;
};
```

`startMs` and `durationMs` drive the bar's left + width as a percentage of
`totalMs`. The bar order reflects timing, not array order — overlapping
parallel steps render with overlapping bars.

## Layout

```
┌── label column (320px) ──┐  ┌── bar column ──────────────────┐
│ Trace                    │  │ 0ms     1.3s    2.6s    3.9s   │
│                          │  │  ┊       ┊       ┊       ┊     │
│ Run                  5.2s│  │  ███████████████████████████   │
│  ▾ parse-search    180ms │  │  ▒                             │
│      normalize…     60ms │  │  ▌                             │
│      resolve-pro…  120ms │  │  ▌                             │
│   find-destinati… 820ms  │  │   ████████                     │
│    ▾ match-flights 1.5s  │  │      ▒▒▒▒▒▒▒▒▒                 │
│        quote-skys… 700ms │  │      ████████                  │
│        quote-amad… 700ms │  │              ████████          │
│        merge-fligh 100ms │  │                       █        │
│     match-hotels   1.18s │  │                ████████████    │
│      bundle-pkgs   640ms │  │                            ████│
│       rank-by-pre… 320ms │  │                              ██│ ← active
│        format-iti… 180ms │  │                               █│
│         deliver-r… 240ms │  │                                ██│
└──────────────────────────┘  └────────────────────────────────┘
```

- Each top-level step indents 14px further right than the previous (the
  "cascade").
- Children of a group sit at the **same indent** as their parent — they're
  distinguished only by smaller `text-xs` and dimmer `text-foreground/75`,
  not by extra indentation.
- Group parents have a chevron; non-groups have an empty placeholder. The
  parent's bar uses the faded `bg-foreground/35` style and fades to `0`
  opacity when the group is expanded (children's bars take over the visual
  load).
- Time ruler at the top + dotted gridlines down the bar column anchor every
  bar to the same time scale.

## Scenarios

### 1. Basic

```tsx
<Trace
  totalMs={5220}
  steps={[
    { id: "run", label: "Run", startMs: 0, durationMs: 5220, status: "done" },
    {
      id: "parse-search",
      label: "parse-search",
      startMs: 0,
      durationMs: 180,
      status: "done",
      children: [
        { id: "normalize", label: "normalize-criteria", startMs: 0,  durationMs: 60,  status: "done" },
        { id: "resolve",   label: "resolve-traveler",  startMs: 60, durationMs: 120, status: "done" },
      ],
    },
    { id: "find-destinations", label: "find-destinations", startMs: 200, durationMs: 820, status: "done" },
    // …
  ]}
/>
```

### 2. With a header label

```tsx
<Trace
  totalMs={5220}
  steps={steps}
  title={
    <div className="flex items-center gap-1.5">
      <span className="font-semibold text-foreground text-sm">Trace</span>
      <Tooltip>
        <TooltipTrigger render={<button type="button" aria-label="About"><Info className="size-3.5" /></button>} />
        <TooltipPopup>Each row is a step in this run — click one to inspect it.</TooltipPopup>
      </Tooltip>
    </div>
  }
/>
```

### 3. Highlight an active step

Set `active: true` on the step the right panel is currently inspecting:

```tsx
{ id: "rank", label: "rank-by-preferences", startMs: 4420, durationMs: 320, status: "done", active: true }
```

The row gets a subtle `bg-foreground/6%` and the label goes `font-medium`.

### 4. Tighter / wider cascade

```tsx
<Trace totalMs={5220} steps={steps} cascadePx={10} />   {/* gentler stair */}
<Trace totalMs={5220} steps={steps} cascadePx={20} />   {/* steeper stair */}
```

`cascadePx={0}` collapses to a flat indent (no cascade) — useful when the
run has many top-level steps and the staircase would push label space too
narrow.

### 5. Custom label column

```tsx
<Trace totalMs={5220} steps={steps} labelColPx={260} />
```

Bump down when bars matter more than long step names; bump up when names
are long.

## Pitfalls

- **`startMs` is absolute**, not relative to the parent. A child that
  starts 60ms into its parent group has `startMs: parent.startMs + 60`.
- **`totalMs` controls the timeline scale**, not the sum of step
  durations. Pass the full run wall-clock duration.
- **Children's bars use `startMs` / `durationMs` directly** — they're
  positioned against the same `totalMs` as the parent, not the parent's
  span. This keeps every bar time-aligned to the ruler.
- **Active should be set on at most one step** at a time. Multiple actives
  visually compete and the inspector pattern only makes sense for one
  selection.
- **Bars render at minimum 0.5% width** so very-short steps stay visible
  on wide timelines. Don't chase pixel-perfect zero-width bars.
- **The cascade reads best with ≤ ~12 top-level steps**. Past that, the
  rightmost rows lose label space. Drop `cascadePx` or split the run.
- **`status="running"` uses the info color (blue), not green.** Mark steps
  as `done` once they complete, otherwise the bar reads as still in flight.

## Rules of thumb

- **One trace per run-detail panel.** Don't render side-by-side traces;
  the cascading staircase only makes sense as a single column.
- **Always include a leading "Run" / summary row** at depth 0 with the full
  duration. It anchors the timeline and gives the cascade a base step.
- **Status drives color, not duration.** Long doesn't mean bad. Use
  `status="failed"` to flag failures (red) and `running` for in-flight
  steps (blue).
- **Group only what's semantically nested**. Don't group sibling steps
  just to save vertical space — the chevron + bar-fade pattern is meant
  for parent→child relationships, not arbitrary clustering.

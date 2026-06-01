"use client";

import { ChevronDown } from "lucide-react";
import type * as React from "react";
import { tv } from "tailwind-variants";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export type TraceStatus = "done" | "running" | "queued" | "failed";

export type TraceStep = {
  id: string;
  label: string;
  startMs: number;
  durationMs: number;
  status?: TraceStatus;
  active?: boolean;
  children?: TraceStep[];
};

export type TraceProps = {
  totalMs: number;
  steps: TraceStep[];
  /** px the next top-level step indents past the previous one. Default 14. */
  cascadePx?: number;
  /** label-column width in px. Default 320. */
  labelColPx?: number;
  /** Optional content rendered in the timeline header above the cascade. */
  title?: React.ReactNode;
  className?: string;
};

const TICKS = [0, 0.25, 0.5, 0.75, 1];

export const traceVariants = tv({
  slots: {
    root: "flex flex-col gap-2",
    header:
      "grid items-end gap-3 text-muted-foreground text-[11px] tabular-nums",
    tickRow: "flex items-baseline justify-between",
    tickMarks: "mt-1 flex justify-between",
    tickMark: "h-1.5 w-px bg-border",
    rows: "relative flex flex-col gap-0.5",
    gridlines: "pointer-events-none absolute inset-y-0 right-0",
    gridline: "absolute inset-y-0 w-px border-border border-l border-dotted",
    barTrack: "relative h-2 w-full",
    bar: "absolute inset-y-0 rounded-sm",
    rowButton:
      "grid h-8 w-full items-center gap-3 rounded-md text-left outline-hidden hover:bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)]",
    groupButton:
      "grid h-8 w-full items-center gap-3 rounded-md text-left outline-hidden hover:bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)] [&:not([data-panel-open])_.chev]:-rotate-90",
    labelWrap: "flex items-baseline gap-1.5",
    iconPlaceholder: "size-3.5 shrink-0",
    chevron: "chev size-3.5 shrink-0 self-center opacity-60 transition-transform",
    label: "truncate font-mono text-foreground text-sm",
    childLabel: "truncate font-mono text-foreground/75 text-xs",
    duration: "ms-1 text-muted-foreground/70 text-xs tabular-nums",
    groupBar: "transition-opacity duration-200 ease-out [[data-panel-open]_&]:opacity-0 motion-reduce:transition-none",
    childRows: "flex flex-col gap-0.5",
  },
  variants: {
    active: {
      true: {
        rowButton: "bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)]",
        label: "font-medium",
        childLabel: "font-medium",
      },
      false: {},
    },
    status: {
      done: { bar: "bg-success" },
      failed: { bar: "bg-destructive" },
      queued: { bar: "bg-muted-foreground/40" },
      running: { bar: "bg-info" },
    },
    faded: {
      true: { bar: "bg-foreground/35" },
      false: {},
    },
  },
  defaultVariants: {
    active: false,
    faded: false,
    status: "done",
  },
});

const traceStyles = traceVariants();

export const formatTraceDuration = (ms: number): string =>
  ms >= 1000 ? `${(ms / 1000).toFixed(ms >= 10000 ? 1 : 2)}s` : `${ms}ms`;

export const Trace = (props: TraceProps) => {
  const cascadePx = props.cascadePx ?? 14;
  const labelCol = `${props.labelColPx ?? 320}px`;
  return (
    <div className={traceStyles.root({ class: props.className })}>
      <Header totalMs={props.totalMs} labelCol={labelCol} title={props.title} />
      <ul className={traceStyles.rows()}>
        <Gridlines labelCol={labelCol} />
        {props.steps.map((s, i) => (
          <Row
            key={s.id}
            step={s}
            indent={i * cascadePx}
            totalMs={props.totalMs}
            labelCol={labelCol}
          />
        ))}
      </ul>
    </div>
  );
};

const Header = (props: {
  totalMs: number;
  labelCol: string;
  title?: React.ReactNode;
}) => (
  <div
    className={traceStyles.header()}
    style={{ gridTemplateColumns: `${props.labelCol} 1fr` }}
  >
    <div>{props.title}</div>
    <div className="relative">
      <div className={traceStyles.tickRow()}>
        {TICKS.map((t) => (
          <span key={t}>{formatTraceDuration(props.totalMs * t)}</span>
        ))}
      </div>
      <div className={traceStyles.tickMarks()}>
        {TICKS.map((t) => (
          <span key={t} className={traceStyles.tickMark()} />
        ))}
      </div>
    </div>
  </div>
);

const Gridlines = (props: { labelCol: string }) => (
  <div
    aria-hidden
    className={traceStyles.gridlines()}
    style={{ left: `calc(${props.labelCol} + 0.75rem)` }}
  >
    {TICKS.map((t) => (
      <span
        key={t}
        className={traceStyles.gridline()}
        style={{ left: `${t * 100}%` }}
      />
    ))}
  </div>
);

const Bar = (props: {
  step: TraceStep;
  totalMs: number;
  faded?: boolean;
}) => {
  const left = (props.step.startMs / props.totalMs) * 100;
  const width = Math.max((props.step.durationMs / props.totalMs) * 100, 0.5);
  const styles = traceVariants({
    faded: !!props.faded,
    status: props.step.status ?? "done",
  });

  return (
    <div className={traceStyles.barTrack()}>
      <div
        className={styles.bar()}
        style={{ left: `${left}%`, width: `${width}%` }}
      />
    </div>
  );
};

type RowProps = {
  step: TraceStep;
  indent: number;
  totalMs: number;
  labelCol: string;
};

const Row = (props: RowProps) => {
  if (props.step.children?.length) return <Group {...props} />;
  return <Leaf {...props} />;
};

const Leaf = (props: RowProps) => (
  <li>
    <button
      type="button"
      className={traceVariants({ active: !!props.step.active }).rowButton()}
      style={{ gridTemplateColumns: `${props.labelCol} 1fr` }}
    >
      <span
        className={traceStyles.labelWrap()}
        style={{ paddingLeft: `${props.indent}px` }}
      >
        <span className={traceStyles.iconPlaceholder()} />
        <span
          className={traceVariants({ active: !!props.step.active }).label()}
        >
          {props.step.label}
        </span>
        <span className={traceStyles.duration()}>
          {formatTraceDuration(props.step.durationMs)}
        </span>
      </span>
      <Bar step={props.step} totalMs={props.totalMs} />
    </button>
  </li>
);

const Group = (props: RowProps) => {
  const children = props.step.children ?? [];
  return (
    <li>
      <Collapsible defaultOpen>
        <CollapsibleTrigger
          render={
            <button
              type="button"
              className={traceStyles.groupButton()}
              style={{ gridTemplateColumns: `${props.labelCol} 1fr` }}
            />
          }
        >
          <span
            className={traceStyles.labelWrap()}
            style={{ paddingLeft: `${props.indent}px` }}
          >
            <ChevronDown className={traceStyles.chevron()} />
            <span className={traceStyles.label()}>
              {props.step.label}
            </span>
            <span className={traceStyles.duration()}>
              {formatTraceDuration(props.step.durationMs)}
            </span>
          </span>
          <div className={traceStyles.groupBar()}>
            <Bar step={props.step} totalMs={props.totalMs} faded />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul className={traceStyles.childRows()}>
            {children.map((c) => (
              <ChildRow
                key={c.id}
                step={c}
                indent={props.indent}
                totalMs={props.totalMs}
                labelCol={props.labelCol}
              />
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
};

const ChildRow = (props: RowProps) => (
  <li>
    <button
      type="button"
      className={traceVariants({ active: !!props.step.active }).rowButton()}
      style={{ gridTemplateColumns: `${props.labelCol} 1fr` }}
    >
      <span
        className={traceStyles.labelWrap()}
        style={{ paddingLeft: `${props.indent}px` }}
      >
        <span className={traceStyles.iconPlaceholder()} />
        <span
          className={traceVariants({ active: !!props.step.active }).childLabel()}
        >
          {props.step.label}
        </span>
        <span className={traceStyles.duration()}>
          {formatTraceDuration(props.step.durationMs)}
        </span>
      </span>
      <Bar step={props.step} totalMs={props.totalMs} />
    </button>
  </li>
);

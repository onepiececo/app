"use client";

import { useState } from "react";
import { ChevronDown, Info, Plug, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Menu,
  MenuCheckboxItem,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip";
import { Trace, type TraceStep } from "@/components/ui/trace";

const COLS = "grid-cols-[24px_120px_1fr_220px_220px_180px_180px]";

export const FilterRow = () => (
  <div className="flex items-center gap-2 border-b border-border px-4 py-2">
    <Button size="sm" variant="secondary">
      <Search />
      Show search
    </Button>
    <FilterChip
      label="Queued at"
      options={["Queued at", "Started at", "Ended at"]}
    />
    <FilterChip
      label="Last 1d"
      options={["Last 1h", "Last 1d", "Last 7d", "Last 30d"]}
    />
    <FilterChip
      label="Status"
      value="All"
      options={["All", "Completed", "Running", "Failed", "Cancelled"]}
    />
    <FilterChip
      label="App"
      value="All"
      options={["All", "atobeach-api", "inventory-worker", "email-service"]}
    />
    <span className="ml-auto text-muted-foreground text-xs tabular-nums">
      576 runs
    </span>
    <TableColumnsMenu />
  </div>
);

type FilterChipProps = {
  label: string;
  options: string[];
  value?: string;
};

const FilterChip = (props: FilterChipProps) => {
  const [current, setCurrent] = useState(props.value ?? props.label);
  const hasSeparateValue = props.value !== undefined;

  return (
    <Menu>
      <MenuTrigger size="sm" variant="secondary">
        <span className={hasSeparateValue ? "text-muted-foreground" : undefined}>
          {hasSeparateValue ? props.label : current}
        </span>
        {hasSeparateValue ? <span>{current}</span> : null}
        <ChevronDown />
      </MenuTrigger>
      <MenuPopup align="start">
        {props.options.map((option) => (
          <MenuItem key={option} onClick={() => setCurrent(option)}>
            {option}
          </MenuItem>
        ))}
      </MenuPopup>
    </Menu>
  );
};

const TableColumnsMenu = () => {
  const [columns, setColumns] = useState({
    status: true,
    trigger: true,
    function: true,
    queued: true,
    ended: true,
  });

  return (
    <Menu>
      <MenuTrigger size="sm" variant="secondary">
        Table columns
        <ChevronDown />
      </MenuTrigger>
      <MenuPopup align="end" className="w-52">
        <MenuGroup>
          <MenuGroupLabel>Visible columns</MenuGroupLabel>
          {Object.entries({
            status: "Status",
            trigger: "Trigger",
            function: "Function",
            queued: "Queued at",
            ended: "Ended at",
          }).map(([key, label]) => (
            <MenuCheckboxItem
              checked={columns[key as keyof typeof columns]}
              key={key}
              onCheckedChange={(checked) =>
                setColumns((current) => ({
                  ...current,
                  [key]: checked === true,
                }))
              }
            >
              {label}
            </MenuCheckboxItem>
          ))}
        </MenuGroup>
        <MenuSeparator />
        <MenuItem
          onClick={() =>
            setColumns({
              status: true,
              trigger: true,
              function: true,
              queued: true,
              ended: true,
            })
          }
        >
          Reset columns
        </MenuItem>
      </MenuPopup>
    </Menu>
  );
};

export const RunsTable = (props: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) => (
  <div className="flex flex-col">
    <div
      className={`grid ${COLS} items-center gap-3 border-b border-border px-4 py-2 text-muted-foreground text-xs uppercase tracking-wide`}
    >
      <span />
      <span>Status</span>
      <span>Run ID</span>
      <span>Trigger</span>
      <span>Function</span>
      <span>Queued at</span>
      <span>Ended at</span>
    </div>
    <RunRow open={props.open} onOpenChange={props.onOpenChange} />
  </div>
);

const RunRow = (props: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) => (
  <Collapsible open={props.open} onOpenChange={props.onOpenChange}>
    <CollapsibleTrigger
      render={
        <button
          type="button"
          className={`grid w-full ${COLS} items-center gap-3 border-b border-border px-4 py-2 text-left text-sm outline-hidden hover:bg-[color-mix(in_srgb,var(--foreground)_3%,transparent)] data-[panel-open]:border-transparent data-[panel-open]:bg-[color-mix(in_srgb,var(--foreground)_2%,var(--background))] [&:not([data-panel-open])_.chev]:-rotate-90`}
        />
      }
    >
      <ChevronDown className="chev size-3.5 opacity-60 transition-transform" />
      <span className="flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-success" />
        Completed
      </span>
      <span className="font-mono text-xs">01JZ8TQK9AMHRP2VQGD3X4R5Y7</span>
      <span>
        <Badge appearance="soft" variant="default">
          <Plug className="size-3" />
          inventory/sync
        </Badge>
      </span>
      <span>Sync Inventory Snapshot</span>
      <span className="text-muted-foreground">4/26/2026, 2:00:08 PM</span>
      <span className="text-muted-foreground">4/26/2026, 2:00:09 PM</span>
    </CollapsibleTrigger>
    <CollapsibleContent>
      <div className="flex flex-col gap-4 border-b border-border bg-[color-mix(in_srgb,var(--foreground)_2%,var(--background))] p-4">
        <div className="flex items-start gap-4">
          <div className="grid flex-1 grid-cols-3 gap-x-6 gap-y-3 text-sm">
            <Field label="Run ID" mono value="01JZ8TQK9AMHRP2VQGD3X4R5Y7" />
            <Field label="App" link value="atobeach-api" />
            <Field label="Function" link value="Sync Inventory Snapshot" />
            <Field label="Duration" value="5.220s" />
            <Field label="Queued at" value="4/26/2026, 2:00:08 PM" />
            <Field label="Started at" value="4/26/2026, 2:00:08 PM" />
            <Field label="Ended at" value="4/26/2026, 2:00:09 PM" />
          </div>
          <div className="flex shrink-0 gap-2">
            <Button size="sm" variant="success">
              Rerun
            </Button>
            <Button size="sm" variant="destructive" disabled>
              Cancel
            </Button>
          </div>
        </div>
        <TraceSection />
      </div>
    </CollapsibleContent>
  </Collapsible>
);

export const Field = (props: {
  label: string;
  value: string;
  mono?: boolean;
  link?: boolean;
}) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-muted-foreground text-xs">{props.label}</span>
    <span
      className={`text-sm ${props.mono ? "font-mono text-xs" : ""} ${
        props.link ? "text-info-foreground" : ""
      }`}
    >
      {props.value}
    </span>
  </div>
);

const TRACE_STEPS: TraceStep[] = [
  {
    id: "run",
    label: "Run",
    startMs: 0,
    durationMs: 5220,
    status: "done",
  },
  {
    id: "parse-search",
    label: "parse-search",
    startMs: 0,
    durationMs: 180,
    status: "done",
    children: [
      { id: "normalize-criteria", label: "normalize-criteria", startMs: 0, durationMs: 60, status: "done" },
      { id: "resolve-traveler-profile", label: "resolve-traveler-profile", startMs: 60, durationMs: 120, status: "done" },
    ],
  },
  { id: "find-destinations", label: "find-destinations", startMs: 200, durationMs: 820, status: "done" },
  {
    id: "match-flights",
    label: "match-flights",
    startMs: 1040,
    durationMs: 1500,
    status: "done",
    children: [
      { id: "quote-skyscanner", label: "quote-skyscanner", startMs: 1040, durationMs: 700, status: "done" },
      { id: "quote-amadeus", label: "quote-amadeus", startMs: 1740, durationMs: 700, status: "done" },
      { id: "merge-flight-results", label: "merge-flight-results", startMs: 2440, durationMs: 100, status: "done" },
    ],
  },
  { id: "match-hotels", label: "match-hotels", startMs: 2560, durationMs: 1180, status: "done" },
  { id: "bundle-packages", label: "bundle-packages", startMs: 3760, durationMs: 640, status: "done" },
  { id: "rank-by-preferences", label: "rank-by-preferences", startMs: 4420, durationMs: 320, status: "done", active: true },
  { id: "format-itineraries", label: "format-itineraries", startMs: 4760, durationMs: 180, status: "done" },
  { id: "deliver-results", label: "deliver-results", startMs: 4960, durationMs: 240, status: "done" },
];

const TraceSection = () => (
  <Trace
    totalMs={5220}
    steps={TRACE_STEPS}
    title={
      <div className="flex items-center gap-1.5">
        <span className="font-semibold text-foreground text-sm">Trace</span>
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                aria-label="About the trace timeline"
                className="inline-flex items-center text-muted-foreground outline-hidden hover:text-foreground"
              />
            }
          >
            <Info className="size-3.5" />
          </TooltipTrigger>
          <TooltipPopup>
            Each row is a step in this run — click one to inspect it.
          </TooltipPopup>
        </Tooltip>
      </div>
    }
  />
);

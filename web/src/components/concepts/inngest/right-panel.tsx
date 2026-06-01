import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Field } from "./runs-table";

type InngestRightPanelProps = {
  open: boolean;
  output: ReactNode;
};

export const InngestRightPanel = (props: InngestRightPanelProps) => (
  <aside
    className={`sticky top-0 hidden h-dvh shrink-0 self-start overflow-hidden border-sidebar-border bg-sidebar transition-[width,border-left-width] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none md:block ${
      props.open ? "w-96 border-l" : "w-0 border-l-0"
    }`}
  >
    <div className="flex h-full w-96 flex-col">
      <StepDetail output={props.output} />
    </div>
  </aside>
);

const StepDetail = (props: { output: ReactNode }) => (
  <div className="flex flex-col">
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-sidebar-border bg-[color-mix(in_srgb,var(--foreground)_3%,var(--sidebar))] px-4">
      <span className="size-2 rounded-full bg-success" />
      <span className="font-mono text-sm">rank-by-preferences</span>
    </header>
    <div className="flex flex-col gap-5 p-4">
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <Field label="Queued at" value="4/26/2026, 2:00:08 PM" />
        <Field label="Started at" value="4/26/2026, 2:00:08 PM" />
        <Field label="Ended at" value="4/26/2026, 2:00:09 PM" />
        <Field label="Delay" value="0ms" />
        <Field label="Duration" value="320ms" />
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">Step Type</span>
          <Badge appearance="soft" variant="info" className="w-fit font-mono">
            step.run
          </Badge>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-sm">Output</span>
        {props.output}
      </div>
    </div>
  </div>
);

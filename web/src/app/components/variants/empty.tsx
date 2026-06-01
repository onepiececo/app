"use client";

import { Globe, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyActions,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

const Focal = () => (
  <div className="relative grid size-10 place-items-center rounded-full border border-border bg-card shadow-sm">
    <Globe className="size-4.5 text-foreground/80" />
  </div>
);

const PulseRings = () => (
  <div className="relative grid size-24 place-items-center">
    <div className="absolute inset-0 rounded-full border border-border/30" />
    <div className="absolute inset-2 rounded-full border border-border/50" />
    <div className="absolute inset-4 rounded-full border border-border/70" />
    <Focal />
  </div>
);

export function EmptyVariants() {
  return (
    <div className="rounded-xl border border-border bg-background/70">
      <Empty>
        <EmptyMedia><PulseRings /></EmptyMedia>
        <EmptyTitle>No domains added</EmptyTitle>
        <EmptyDescription>
          Add your first domain to start managing routes.
        </EmptyDescription>
        <EmptyActions>
          <Button variant="outline">Learn more</Button>
          <Button>
            <Plus />
            Create domain
          </Button>
        </EmptyActions>
      </Empty>
    </div>
  );
}

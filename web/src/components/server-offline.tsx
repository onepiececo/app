"use client";

import { ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, EmptyActions, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

const Focal = () => (
  <div className="relative grid size-10 place-items-center rounded-full border border-border bg-card shadow-sm">
    <ServerCrash className="size-4.5 text-foreground/80" />
  </div>
);

export const ServerOffline = () => (
  <main className="grid h-dvh place-items-center bg-background text-foreground">
    <Empty>
      <EmptyMedia>
        <Focal />
      </EmptyMedia>
      <EmptyTitle>We can't reach the server</EmptyTitle>
      <EmptyDescription>
        The day list, puzzles, and catalog all live on the Go API, refresh once it comes back up.
      </EmptyDescription>
      <EmptyActions>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </EmptyActions>
    </Empty>
  </main>
);

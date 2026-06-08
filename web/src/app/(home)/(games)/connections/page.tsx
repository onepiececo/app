"use client";

import { cn } from "@/lib/utils";
import { connections } from "@/components/games/connections";

export default function ConnectionsPage() {
  const Body = connections.variants[0].Component;
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h1 className={cn("font-semibold text-2xl tracking-tight", connections.accent)}>{connections.name}</h1>
        <p className="text-muted-foreground text-sm">{connections.tagline}</p>
      </div>
      <div className="pt-2">
        <Body />
      </div>
    </>
  );
}

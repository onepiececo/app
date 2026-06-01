"use client";

import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export function SeparatorVariants() {
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <Separator>Actions</Separator>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm">Copy link</Button>
        <Separator orientation="vertical" className="h-5" />
        <Button variant="ghost" size="sm">Share</Button>
        <span className="ms-auto flex items-center gap-2 text-sm text-muted-foreground">
          Close with
          <KbdGroup>
            <Kbd>Esc</Kbd>
          </KbdGroup>
        </span>
      </div>
      <div className="flex h-24 items-center gap-4 text-sm text-muted-foreground">
        <span>Source</span>
        <Separator orientation="vertical">to</Separator>
        <span>Destination</span>
      </div>
    </div>
  );
}

"use client";

import { Heading, Subheading } from "@/components/ui/heading";

export function HeadingVariants() {
  return (
    <div className="flex flex-col gap-3">
      <Heading level={1}>Dashboard</Heading>
      <Subheading level={2}>Operations overview</Subheading>
      <p className="text-sm text-muted-foreground">
        Use <code className="font-mono">level</code> to set the tag (1–6) independently of the visual size.
      </p>
    </div>
  );
}

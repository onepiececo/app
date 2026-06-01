"use client";

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";
import type React from "react";
import { tv } from "tailwind-variants";
import { mergeBaseUiClassName } from "@/lib/base-ui-class-name";

export const collapsibleVariants = tv({
  slots: {
    root: "",
    trigger: "cursor-pointer",
    panel:
      "h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 data-ending-style:h-0 data-starting-style:h-0",
  },
});

export function Collapsible({
  className,
  ...props
}: CollapsiblePrimitive.Root.Props): React.ReactElement {
  const styles = collapsibleVariants();

  return (
    <CollapsiblePrimitive.Root
      className={mergeBaseUiClassName(styles.root, className)}
      data-slot="collapsible"
      {...props}
    />
  );
}

export function CollapsibleTrigger({
  className,
  ...props
}: CollapsiblePrimitive.Trigger.Props): React.ReactElement {
  const styles = collapsibleVariants();

  return (
    <CollapsiblePrimitive.Trigger
      className={mergeBaseUiClassName(styles.trigger, className)}
      data-slot="collapsible-trigger"
      {...props}
    />
  );
}

export function CollapsiblePanel({
  className,
  ...props
}: CollapsiblePrimitive.Panel.Props): React.ReactElement {
  const styles = collapsibleVariants();

  return (
    <CollapsiblePrimitive.Panel
      className={mergeBaseUiClassName(styles.panel, className)}
      data-slot="collapsible-panel"
      {...props}
    />
  );
}

export { CollapsiblePrimitive, CollapsiblePanel as CollapsibleContent };

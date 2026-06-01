"use client";

import { Fieldset as FieldsetPrimitive } from "@base-ui/react/fieldset";
import type React from "react";
import { tv } from "tailwind-variants";
import { mergeBaseUiClassName } from "@/lib/base-ui-class-name";

export const fieldsetVariants = tv({
  slots: {
    legend: "font-semibold text-foreground",
  },
});

const fieldsetStyles = fieldsetVariants();

export function Fieldset({
  className,
  ...props
}: FieldsetPrimitive.Root.Props): React.ReactElement {
  return (
    <FieldsetPrimitive.Root
      className={className}
      data-slot="fieldset"
      {...props}
    />
  );
}

export function FieldsetLegend({
  className,
  ...props
}: FieldsetPrimitive.Legend.Props): React.ReactElement {
  return (
    <FieldsetPrimitive.Legend
      className={mergeBaseUiClassName(fieldsetStyles.legend, className)}
      data-slot="fieldset-legend"
      {...props}
    />
  );
}

export { FieldsetPrimitive };

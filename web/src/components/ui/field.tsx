"use client";

import { Field as FieldPrimitive } from "@base-ui/react/field";
import type React from "react";
import { tv } from "tailwind-variants";
import { mergeBaseUiClassName } from "@/lib/base-ui-class-name";

export const fieldVariants = tv({
  slots: {
    root: "flex flex-col items-start gap-2",
    label:
      "inline-flex items-center gap-2 font-medium text-base/4.5 text-foreground data-disabled:opacity-64 sm:text-sm/4",
    item: "flex",
    description: "text-muted-foreground text-xs",
    error: "text-destructive-foreground text-xs",
  },
});

const fieldStyles = fieldVariants();

export function Field({
  className,
  ...props
}: FieldPrimitive.Root.Props): React.ReactElement {
  return (
    <FieldPrimitive.Root
      className={mergeBaseUiClassName(fieldStyles.root, className)}
      data-slot="field"
      {...props}
    />
  );
}

export function FieldLabel({
  className,
  ...props
}: FieldPrimitive.Label.Props): React.ReactElement {
  return (
    <FieldPrimitive.Label
      className={mergeBaseUiClassName(fieldStyles.label, className)}
      data-slot="field-label"
      {...props}
    />
  );
}

export function FieldItem({
  className,
  ...props
}: FieldPrimitive.Item.Props): React.ReactElement {
  return (
    <FieldPrimitive.Item
      className={mergeBaseUiClassName(fieldStyles.item, className)}
      data-slot="field-item"
      {...props}
    />
  );
}

export function FieldDescription({
  className,
  ...props
}: FieldPrimitive.Description.Props): React.ReactElement {
  return (
    <FieldPrimitive.Description
      className={mergeBaseUiClassName(fieldStyles.description, className)}
      data-slot="field-description"
      {...props}
    />
  );
}

export function FieldError({
  className,
  ...props
}: FieldPrimitive.Error.Props): React.ReactElement {
  return (
    <FieldPrimitive.Error
      className={mergeBaseUiClassName(fieldStyles.error, className)}
      data-slot="field-error"
      {...props}
    />
  );
}

export const FieldControl: typeof FieldPrimitive.Control =
  FieldPrimitive.Control;
export const FieldValidity: typeof FieldPrimitive.Validity =
  FieldPrimitive.Validity;

export { FieldPrimitive };

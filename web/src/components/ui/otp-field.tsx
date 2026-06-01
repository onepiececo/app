"use client";

import { OTPFieldPreview as OTPFieldPrimitive } from "@base-ui/react/otp-field";
import type * as React from "react";
import { cn } from "@/lib/utils";
import { inputSurfaceVariants } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export function OTPField({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof OTPFieldPrimitive.Root> & {
  size?: "default" | "lg";
}): React.ReactElement {
  return (
    <OTPFieldPrimitive.Root
      className={cn(
        "flex items-center gap-2 has-disabled:opacity-50",
        className,
      )}
      data-size={size}
      data-slot="otp-field"
      {...props}
    />
  );
}

export function OTPFieldInput({
  className,
  ...props
}: React.ComponentProps<typeof OTPFieldPrimitive.Input>): React.ReactElement {
  return (
    <OTPFieldPrimitive.Input
      className={cn(
        inputSurfaceVariants({ layout: "inline" }),
        "size-9 w-9 min-w-0 items-center justify-center px-0 text-center font-medium text-base tabular-nums caret-foreground in-[[data-slot=otp-field][data-size=lg]]:size-10 in-[[data-slot=otp-field][data-size=lg]]:w-10 in-[[data-slot=otp-field][data-size=lg]]:text-lg sm:size-8 sm:w-8 sm:text-sm sm:in-[[data-slot=otp-field][data-size=lg]]:size-9 sm:in-[[data-slot=otp-field][data-size=lg]]:w-9 sm:in-[[data-slot=otp-field][data-size=lg]]:text-base",
        className,
      )}
      data-slot="otp-field-input"
      spellCheck={false}
      {...props}
    />
  );
}

export function OTPFieldSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>): React.ReactElement {
  return (
    <OTPFieldPrimitive.Separator
      render={
        <Separator
          className={cn(
            "border-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-3",
            className,
          )}
          orientation="horizontal"
          {...props}
        />
      }
    />
  );
}

export { OTPFieldPrimitive };

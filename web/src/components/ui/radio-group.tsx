"use client";

import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import type React from "react";
import { cn } from "@/lib/utils";

export function RadioGroup({
  className,
  ...props
}: RadioGroupPrimitive.Props): React.ReactElement {
  return (
    <RadioGroupPrimitive
      className={cn("flex flex-col gap-3", className)}
      data-slot="radio-group"
      {...props}
    />
  );
}

export function Radio({
  className,
  ...props
}: RadioPrimitive.Root.Props): React.ReactElement {
  return (
    <RadioPrimitive.Root
      className={cn(
        // Base
        "group/radio relative inline-flex size-4.5 shrink-0 items-center justify-center rounded-full outline-none transition-[background-color,box-shadow,transform] duration-[120ms] ease-out active:not-data-disabled:scale-[.92] data-disabled:cursor-not-allowed data-disabled:opacity-50 sm:size-4",
        "bg-background shadow-[0_0_0_1px_color-mix(in_srgb,var(--foreground)_32%,var(--background)),0_1px_2px_rgb(0_0_0/0.06)] hover:not-data-checked:shadow-[0_0_0_1px_color-mix(in_srgb,var(--foreground)_44%,var(--background)),0_1px_2px_rgb(0_0_0/0.08)] dark:bg-[color-mix(in_srgb,var(--foreground)_5%,var(--background))] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.35)] dark:hover:not-data-checked:shadow-[0_0_0_1px_rgb(255_255_255/0.22),0_1px_2px_rgb(0_0_0/0.35)]",
        "data-checked:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_92%,white),var(--primary))] data-checked:shadow-[0_0_0_1px_color-mix(in_srgb,var(--primary)_48%,black),0_1px_2px_color-mix(in_srgb,var(--primary)_20%,transparent)] data-checked:inset-shadow-[0_1px_0_rgb(255_255_255/0.28),0_-1px_0_rgb(0_0_0/0.12)]",
        "dark:data-checked:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary-foreground)_88%,black),color-mix(in_srgb,var(--primary-foreground)_72%,black))] dark:data-checked:shadow-[0_0_0_1px_rgb(255_255_255/0.15),0_1px_2px_rgb(0_0_0/0.46)]",
        // Focus
        "focus-visible:shadow-[0_0_0_1px_var(--ring),0_0_0_3px_color-mix(in_srgb,var(--ring)_24%,transparent)] focus-visible:inset-shadow-none dark:focus-visible:shadow-[0_0_0_1px_var(--ring),0_0_0_3px_color-mix(in_srgb,var(--ring)_28%,transparent)]",
        // Invalid
        "aria-invalid:shadow-[0_0_0_1px_var(--destructive),0_0_0_3px_color-mix(in_srgb,var(--destructive)_18%,transparent)] focus-visible:aria-invalid:shadow-[0_0_0_1px_var(--destructive),0_0_0_3px_color-mix(in_srgb,var(--destructive)_22%,transparent)] dark:aria-invalid:shadow-[0_0_0_1px_var(--destructive),0_0_0_3px_color-mix(in_srgb,var(--destructive)_24%,transparent)]",
        className,
      )}
      data-slot="radio"
      {...props}
    >
      <RadioPrimitive.Indicator
        keepMounted
        className="pointer-events-none absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-[140ms] ease-out opacity-0 scale-50 group-data-checked/radio:opacity-100 group-data-checked/radio:scale-100"
        data-slot="radio-indicator"
      >
        <span className="block size-2 rounded-full bg-primary-foreground dark:bg-white sm:size-1.5" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  );
}

export { RadioGroupPrimitive, RadioPrimitive, Radio as RadioGroupItem };

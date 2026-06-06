"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/lib/utils";

export const toggleVariants = tv({
  base: cn(
    "relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-transparent font-semibold outline-none",
    "transition-[box-shadow,background-color,border-color,color,filter,transform] duration-[120ms] ease-out",
    "active:not-disabled:translate-y-px data-pressed:not-disabled:translate-y-px",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:inset-shadow-none",
    "pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11",
    "[&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:-mx-0.5 [&_svg]:shrink-0",
  ),
  defaultVariants: {
    size: "default",
    variant: "ghost",
  },
  variants: {
    size: {
      default: "h-9 min-w-9 px-[calc(--spacing(3)-1px)] text-base sm:h-8 sm:min-w-8 sm:text-sm",
      lg: "h-10 min-w-10 px-[calc(--spacing(3.5)-1px)] text-base sm:h-9 sm:min-w-9 sm:text-sm",
      sm: "h-8 min-w-8 gap-1.5 px-[calc(--spacing(2.5)-1px)] text-sm sm:h-7 sm:min-w-7 sm:text-xs",
    },
    variant: {
      ghost: cn(
        "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
        "data-pressed:bg-accent/80 data-pressed:text-foreground",
      ),
      secondary: cn(
        "bg-[linear-gradient(180deg,color-mix(in_srgb,var(--foreground)_8%,var(--background)),color-mix(in_srgb,var(--foreground)_4%,var(--background)))] text-foreground shadow-[0_0_0_1px_color-mix(in_srgb,var(--foreground)_22%,var(--background)),0_1px_2px_rgb(0_0_0/0.08)] inset-shadow-[0_1px_0_rgb(255_255_255/0.68),0_-1px_0_rgb(0_0_0/0.05)]",
        "hover:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--foreground)_14%,var(--background)),color-mix(in_srgb,var(--foreground)_7%,var(--background)))] hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--foreground)_34%,var(--background)),0_2px_4px_rgb(0_0_0/0.16)] hover:inset-shadow-[0_1px_0_rgb(255_255_255/0.78),0_-1px_0_rgb(0_0_0/0.08)]",
        "data-pressed:bg-[color-mix(in_srgb,var(--foreground)_14%,var(--background))] data-pressed:shadow-[0_0_0_1px_color-mix(in_srgb,var(--foreground)_34%,var(--background))] data-pressed:inset-shadow-none",
        "dark:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--foreground)_18%,var(--background)),color-mix(in_srgb,var(--foreground)_8%,var(--background)))] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.13),0_1px_2px_rgb(0_0_0/0.4)] dark:inset-shadow-[0_1px_0_rgb(255_255_255/0.14),0_-1px_0_rgb(0_0_0/0.2)] dark:hover:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--foreground)_26%,var(--background)),color-mix(in_srgb,var(--foreground)_14%,var(--background)))] dark:hover:shadow-[0_0_0_1px_rgb(255_255_255/0.2),0_2px_6px_rgb(0_0_0/0.5)] dark:hover:inset-shadow-[0_1px_0_rgb(255_255_255/0.22),0_-1px_0_rgb(0_0_0/0.24)] dark:data-pressed:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--foreground)_26%,var(--background)),color-mix(in_srgb,var(--foreground)_18%,var(--background)))] dark:data-pressed:shadow-[0_0_0_1px_rgb(0_0_0/0.54)]",
      ),
      default: cn(
        "bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_92%,white),var(--primary))] text-primary-foreground shadow-[0_0_0_1px_color-mix(in_srgb,var(--primary)_54%,black),0_2px_4px_color-mix(in_srgb,var(--primary)_24%,transparent)] inset-shadow-[0_1px_0_rgb(255_255_255/0.28),0_-1px_0_rgb(0_0_0/0.18)]",
        "hover:bg-[linear-gradient(90deg,var(--primary),color-mix(in_srgb,var(--primary)_78%,white))] hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--primary)_66%,black),0_2px_5px_color-mix(in_srgb,var(--primary)_34%,transparent)] hover:inset-shadow-[0_1px_0_rgb(255_255_255/0.34),0_-1px_0_rgb(0_0_0/0.22)]",
        "data-pressed:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_86%,black),color-mix(in_srgb,var(--primary)_68%,black))] data-pressed:shadow-[0_0_0_1px_color-mix(in_srgb,var(--primary)_66%,black)] data-pressed:inset-shadow-none",
        "dark:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary-foreground)_88%,black),color-mix(in_srgb,var(--primary-foreground)_72%,black))] dark:text-white dark:shadow-[0_0_0_1px_rgb(255_255_255/0.15),0_2px_6px_rgb(0_0_0/0.46)] dark:inset-shadow-[0_1px_0_rgb(255_255_255/0.2),0_-1px_0_rgb(0_0_0/0.3)] dark:hover:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--primary-foreground)_78%,black),color-mix(in_srgb,var(--primary-foreground)_94%,black))] dark:hover:shadow-[0_0_0_1px_rgb(255_255_255/0.22),0_2px_7px_rgb(0_0_0/0.56)] dark:data-pressed:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary-foreground)_74%,black),color-mix(in_srgb,var(--primary-foreground)_58%,black))] dark:data-pressed:shadow-[0_0_0_1px_rgb(255_255_255/0.14),0_1px_1px_rgb(0_0_0/0.64)]",
      ),
    },
  },
});

export type ToggleVariant = NonNullable<VariantProps<typeof toggleVariants>["variant"]>;
export type ToggleSize = NonNullable<VariantProps<typeof toggleVariants>["size"]>;

export function Toggle({
  className,
  variant,
  size,
  ...props
}: TogglePrimitive.Props &
  VariantProps<typeof toggleVariants>): React.ReactElement {
  const base = toggleVariants({ size, variant });
  return (
    <TogglePrimitive
      className={
        typeof className === "function"
          ? (state) => cn(base, className(state))
          : cn(base, className)
      }
      data-slot="toggle"
      {...props}
    />
  );
}

export const ToggleGroupContext: React.Context<
  VariantProps<typeof toggleVariants>
> = React.createContext<VariantProps<typeof toggleVariants>>({
  size: "default",
  variant: "ghost",
});

export function ToggleGroup({
  className,
  variant = "ghost",
  size = "default",
  orientation = "horizontal",
  children,
  ...props
}: ToggleGroupPrimitive.Props &
  VariantProps<typeof toggleVariants>): React.ReactElement {
  return (
    <ToggleGroupPrimitive
      className={cn(
        "flex w-fit gap-1 *:focus-visible:z-10",
        orientation === "vertical" && "flex-col",
        className,
      )}
      data-size={size}
      data-slot="toggle-group"
      data-variant={variant}
      orientation={orientation}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ size, variant }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  );
}

export function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: TogglePrimitive.Props &
  VariantProps<typeof toggleVariants>): React.ReactElement {
  const context = React.useContext(ToggleGroupContext);
  const resolvedVariant = variant ?? context.variant;
  const resolvedSize = size ?? context.size;

  return (
    <Toggle
      className={className}
      data-size={resolvedSize}
      data-variant={resolvedVariant}
      size={resolvedSize}
      variant={resolvedVariant}
      {...props}
    >
      {children}
    </Toggle>
  );
}

export { TogglePrimitive, ToggleGroupPrimitive };

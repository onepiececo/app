"use client";

import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import type React from "react";
import { cn } from "@/lib/utils";

export function Progress({
  className,
  children,
  surface = "standard",
  variant = "default",
  ...props
}: ProgressPrimitive.Root.Props & {
  surface?: ProgressSurface;
  variant?: ProgressVariant;
}): React.ReactElement {
  return (
    <ProgressPrimitive.Root
      className={cn("flex w-full flex-col gap-2", className)}
      data-slot="progress"
      {...props}
    >
      {children ? (
        children
      ) : (
        <ProgressTrack surface={surface}>
          <ProgressIndicator surface={surface} variant={variant} />
        </ProgressTrack>
      )}
    </ProgressPrimitive.Root>
  );
}

export function ProgressLabel({
  className,
  ...props
}: ProgressPrimitive.Label.Props): React.ReactElement {
  return (
    <ProgressPrimitive.Label
      className={cn("font-medium text-sm", className)}
      data-slot="progress-label"
      {...props}
    />
  );
}

export function ProgressTrack({
  className,
  surface = "standard",
  ...props
}: ProgressPrimitive.Track.Props & {
  surface?: ProgressSurface;
}): React.ReactElement {
  return (
    <ProgressPrimitive.Track
      className={cn(
        "block h-4 w-full overflow-hidden rounded-full",
        surface === "soft"
          ? "bg-[color-mix(in_srgb,var(--foreground)_4%,var(--background))] shadow-[0_0_0_1px_color-mix(in_srgb,var(--foreground)_18%,var(--background))] dark:bg-white/5 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)]"
          : "bg-background shadow-[0_0_0_1px_color-mix(in_srgb,var(--foreground)_32%,var(--background)),0_1px_2px_rgb(0_0_0/0.06)] dark:bg-[color-mix(in_srgb,var(--foreground)_5%,var(--background))] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.35)]",
        className,
      )}
      data-slot="progress-track"
      {...props}
    />
  );
}

export type ProgressSurface = "standard" | "soft";
export type ProgressVariant = "default" | "striped";

export function ProgressIndicator({
  className,
  surface = "standard",
  variant = "default",
  ...props
}: ProgressPrimitive.Indicator.Props & {
  surface?: ProgressSurface;
  variant?: ProgressVariant;
}): React.ReactElement {
  return (
    <ProgressPrimitive.Indicator
      className={cn(
        "relative overflow-hidden rounded-full transition-all duration-500",
        surface === "soft"
          ? "bg-[color-mix(in_srgb,var(--primary)_22%,var(--background))] dark:bg-[color-mix(in_srgb,var(--primary)_22%,white)]"
          : "bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_92%,white),var(--primary))] dark:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_92%,black),color-mix(in_srgb,var(--primary)_76%,black))]",
        variant === "striped" &&
          "after:pointer-events-none after:absolute after:inset-0 after:animate-progress-stripe after:bg-[length:16px_16px] after:opacity-30 after:[background-image:linear-gradient(45deg,rgba(255,255,255,.5)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.5)_50%,rgba(255,255,255,.5)_75%,transparent_75%,transparent)]",
        className,
      )}
      data-slot="progress-indicator"
      {...props}
    />
  );
}

export function ProgressValue({
  className,
  ...props
}: ProgressPrimitive.Value.Props): React.ReactElement {
  return (
    <ProgressPrimitive.Value
      className={cn("text-sm tabular-nums", className)}
      data-slot="progress-value"
      {...props}
    />
  );
}

export { ProgressPrimitive };

"use client";

import { Meter as MeterPrimitive } from "@base-ui/react/meter";
import type React from "react";
import { tv } from "tailwind-variants";
import { mergeBaseUiClassName } from "@/lib/base-ui-class-name";

export const meterVariants = tv({
  slots: {
    root: "flex w-full flex-col gap-2",
    label: "font-medium text-foreground text-sm",
    track: [
      "block h-[18px] w-full overflow-hidden rounded-full",
      "bg-[color-mix(in_srgb,var(--foreground)_7%,var(--background))] not-dark:bg-clip-padding shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--foreground)_18%,var(--background)),inset_0_1px_0_rgb(255_255_255/0.55),inset_0_-1px_0_rgb(0_0_0/0.06)]",
      "dark:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--foreground)_22%,var(--background)),color-mix(in_srgb,var(--foreground)_6%,var(--background)))] dark:shadow-[inset_0_0_0_1px_rgb(0_0_0/0.5),inset_0_1px_0_rgb(255_255_255/0.14),inset_0_-1px_0_rgb(0_0_0/0.2)]",
    ],
    indicator: "bg-foreground/20 transition-all duration-500 dark:bg-foreground/30",
    value: "text-sm tabular-nums text-muted-foreground",
  },
});

const meterStyles = meterVariants();

export const Meter = ({
  className,
  children,
  ...props
}: MeterPrimitive.Root.Props): React.ReactElement => {
  return (
    <MeterPrimitive.Root
      className={mergeBaseUiClassName(meterStyles.root, className)}
      data-slot="meter"
      {...props}
    >
      {children ? (
        children
      ) : (
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      )}
    </MeterPrimitive.Root>
  );
};

export const MeterLabel = ({
  className,
  ...props
}: MeterPrimitive.Label.Props): React.ReactElement => {
  return (
    <MeterPrimitive.Label
      className={mergeBaseUiClassName(meterStyles.label, className)}
      data-slot="meter-label"
      {...props}
    />
  );
};

export const MeterTrack = ({
  className,
  ...props
}: MeterPrimitive.Track.Props): React.ReactElement => {
  return (
    <MeterPrimitive.Track
      className={mergeBaseUiClassName(meterStyles.track, className)}
      data-slot="meter-track"
      {...props}
    />
  );
};

export const MeterIndicator = ({
  className,
  ...props
}: MeterPrimitive.Indicator.Props): React.ReactElement => {
  return (
    <MeterPrimitive.Indicator
      className={mergeBaseUiClassName(meterStyles.indicator, className)}
      data-slot="meter-indicator"
      {...props}
    />
  );
};

export const MeterValue = ({
  className,
  ...props
}: MeterPrimitive.Value.Props): React.ReactElement => {
  return (
    <MeterPrimitive.Value
      className={mergeBaseUiClassName(meterStyles.value, className)}
      data-slot="meter-value"
      {...props}
    />
  );
};

export { MeterPrimitive };

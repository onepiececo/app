"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { createContext, useContext } from "react";
import type React from "react";
import { cn } from "@/lib/utils";

// Two promoted treatments from /test Round 4:
//   - ink   — full-width baseline with a primary active rule
//   - inset — input-like shell with a quiet raised active segment
export type TabsVariant = "ink" | "inset";

const TabsVariantContext = createContext<TabsVariant>("ink");

export function Tabs({
  className,
  ...props
}: TabsPrimitive.Root.Props): React.ReactElement {
  return (
    <TabsPrimitive.Root
      className={cn(
        "flex flex-col gap-2 data-[orientation=vertical]:flex-row",
        className,
      )}
      data-slot="tabs"
      {...props}
    />
  );
}

// Indicator base — fill the active tab exactly.
const FILL_INDICATOR_BASE =
  "absolute bottom-0 left-0 z-0 h-(--active-tab-height) w-(--active-tab-width) translate-x-(--active-tab-left) -translate-y-(--active-tab-bottom) transition-[width,height,translate] duration-[200ms] [transition-timing-function:cubic-bezier(.22,.61,.36,1)] motion-reduce:transition-none";

// Indicator base — thin bar under (horizontal) or beside (vertical) the tab.
const BAR_INDICATOR_BASE =
  "absolute bg-primary transition-[width,height,translate] duration-[200ms] [transition-timing-function:cubic-bezier(.22,.61,.36,1)] motion-reduce:transition-none data-[orientation=horizontal]:-bottom-px data-[orientation=horizontal]:left-0 data-[orientation=horizontal]:h-0.5 data-[orientation=horizontal]:w-(--active-tab-width) data-[orientation=horizontal]:translate-x-(--active-tab-left) data-[orientation=vertical]:top-0 data-[orientation=vertical]:-left-px data-[orientation=vertical]:w-0.5 data-[orientation=vertical]:h-(--active-tab-height) data-[orientation=vertical]:translate-y-(--active-tab-top)";

export function TabsList({
  variant = "ink",
  fullWidth = false,
  className,
  children,
  ...props
}: TabsPrimitive.List.Props & {
  variant?: TabsVariant;
  /**
   * When `true`, the list stretches to fill its horizontal container. For
   * the `underline` variant this extends the bottom border past the tabs
   * out to the container edges. Ignored in vertical orientation.
   */
  fullWidth?: boolean;
}): React.ReactElement {
  const listClass = cn(
    "relative z-0 flex items-center text-muted-foreground data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
    fullWidth
      ? "w-fit data-[orientation=horizontal]:w-full data-[orientation=horizontal]:justify-start"
      : "w-fit justify-center",
    variant === "ink" &&
      "gap-4 data-[orientation=horizontal]:border-b data-[orientation=horizontal]:border-border data-[orientation=horizontal]:pb-1 data-[orientation=vertical]:border-l data-[orientation=vertical]:border-border data-[orientation=vertical]:pl-1",
    variant === "inset" &&
      "gap-x-0.5 rounded-lg bg-[color-mix(in_srgb,var(--foreground)_3%,var(--background))] p-0.5 shadow-[0_0_0_1px_color-mix(in_srgb,var(--foreground)_12%,var(--background)),inset_0_1px_2px_rgb(0_0_0/0.035)] dark:bg-white/5 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1),inset_0_1px_2px_rgb(0_0_0/0.28)]",
    className,
  );

  const indicatorClass = cn(
    variant === "inset" &&
      cn(
        FILL_INDICATOR_BASE,
        "rounded-md bg-background shadow-[0_0_0_1px_color-mix(in_srgb,var(--foreground)_10%,var(--background)),0_1px_2px_rgb(0_0_0/0.04)] dark:bg-white/10 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1),0_1px_2px_rgb(0_0_0/0.28)]",
      ),
    variant === "ink" && BAR_INDICATOR_BASE,
  );

  return (
    <TabsVariantContext.Provider value={variant}>
      <TabsPrimitive.List
        className={listClass}
        data-slot="tabs-list"
        data-variant={variant}
        {...props}
      >
        {children}
        <TabsPrimitive.Indicator
          className={indicatorClass}
          data-slot="tab-indicator"
        />
      </TabsPrimitive.List>
    </TabsVariantContext.Provider>
  );
}

export function TabsTab({
  className,
  ...props
}: TabsPrimitive.Tab.Props): React.ReactElement {
  const variant = useContext(TabsVariantContext);
  return (
    <TabsPrimitive.Tab
      className={cn(
        "relative shrink-0 cursor-pointer whitespace-nowrap rounded-md font-medium outline-none transition-[color,background-color] duration-[120ms] ease-out focus-visible:ring-2 focus-visible:ring-ring data-disabled:pointer-events-none data-disabled:opacity-64 flex items-center justify-center gap-1.5 text-sm data-[orientation=vertical]:justify-start sm:text-sm [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:-mx-0.5 [&_svg]:shrink-0",
        variant === "ink" &&
          "h-8 rounded-sm px-1 hover:text-foreground data-active:text-foreground data-[orientation=vertical]:px-2 data-[orientation=vertical]:py-1",
        variant === "inset" &&
          "relative z-10 h-8 px-3 hover:text-foreground data-active:text-foreground sm:h-7",
        className,
      )}
      data-slot="tabs-tab"
      {...props}
    />
  );
}

export function TabsPanel({
  className,
  ...props
}: TabsPrimitive.Panel.Props): React.ReactElement {
  return (
    <TabsPrimitive.Panel
      className={cn("flex-1 outline-none", className)}
      data-slot="tabs-content"
      {...props}
    />
  );
}

export { TabsPrimitive, TabsTab as TabsTrigger, TabsPanel as TabsContent };

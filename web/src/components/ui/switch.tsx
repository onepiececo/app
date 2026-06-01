"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import type React from "react";
import { cn } from "@/lib/utils";

export function Switch({
  className,
  ...props
}: SwitchPrimitive.Root.Props): React.ReactElement {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "group/switch relative inline-flex h-6 w-10 shrink-0 cursor-pointer rounded-full p-[3px] outline-none transition-[background-color,box-shadow,transform] duration-[120ms] ease-out",
        "data-unchecked:bg-zinc-200 data-unchecked:ring-1 data-unchecked:ring-black/5 data-unchecked:ring-inset dark:data-unchecked:bg-white/5 dark:data-unchecked:ring-white/15",
        "data-checked:bg-zinc-900 data-checked:ring-1 data-checked:ring-zinc-950 data-checked:shadow-[0_1px_2px_rgb(0_0_0/0.18)] dark:data-checked:bg-white/25 dark:data-checked:ring-transparent dark:data-checked:shadow-[0_1px_2px_rgb(0_0_0/0.35)]",
        "hover:data-unchecked:ring-black/15 dark:hover:data-unchecked:ring-white/25 hover:data-checked:brightness-110 dark:hover:data-checked:bg-white/30",
        "active:not-data-disabled:scale-[.97] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:active:scale-100",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none absolute top-1/2 left-[3px] block size-4.5 -translate-y-1/2 rounded-full bg-white transition-[transform,width,height] duration-[140ms] ease-out will-change-transform shadow-[0_0_0_1px_rgb(0_0_0/0.12),0_1px_2px_rgb(0_0_0/0.2)]",
          "group-data-checked/switch:translate-x-4",
          "group-hover/switch:not-group-data-disabled/switch:w-5 group-data-checked/switch:group-hover/switch:not-group-data-disabled/switch:translate-x-3.5",
          "group-active/switch:not-group-data-disabled/switch:h-4 group-active/switch:not-group-data-disabled/switch:w-[22px] group-data-checked/switch:group-active/switch:not-group-data-disabled/switch:translate-x-[13px]",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { SwitchPrimitive };

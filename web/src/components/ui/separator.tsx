import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";
import type React from "react";
import { cn } from "@/lib/utils";

const separatorClass =
  "shrink-0 border-zinc-950/10 dark:border-white/10 data-[orientation=horizontal]:w-full data-[orientation=horizontal]:border-t data-[orientation=vertical]:border-l data-[orientation=vertical]:not-[[class^='h-']]:not-[[class*='_h-']]:self-stretch";

export function Separator({
  className,
  orientation = "horizontal",
  children,
  ...props
}: SeparatorPrimitive.Props & {
  children?: React.ReactNode;
}): React.ReactElement {
  if (children !== undefined && children !== null && children !== false) {
    if (orientation === "vertical") {
      return (
        <div
          className={cn(
            "inline-flex flex-col items-center gap-3 self-stretch text-xs text-muted-foreground",
            className,
          )}
          data-slot="separator-with-label"
        >
          <SeparatorPrimitive
            className="w-px flex-1 shrink border-l border-zinc-950/10 dark:border-white/10"
            data-slot="separator"
            orientation="vertical"
            {...props}
          />
          <span className="uppercase tracking-wider">{children}</span>
          <SeparatorPrimitive
            className="w-px flex-1 shrink border-l border-zinc-950/10 dark:border-white/10"
            data-slot="separator"
            orientation="vertical"
            {...props}
          />
        </div>
      );
    }
    return (
      <div
        className={cn(
          "flex items-center gap-3 text-xs text-muted-foreground",
          className,
        )}
        data-slot="separator-with-label"
      >
        <SeparatorPrimitive
          className="h-px flex-1 shrink border-t border-zinc-950/10 dark:border-white/10"
          data-slot="separator"
          orientation="horizontal"
          {...props}
        />
        <span className="uppercase tracking-wider">{children}</span>
        <SeparatorPrimitive
          className="h-px flex-1 shrink border-t border-zinc-950/10 dark:border-white/10"
          data-slot="separator"
          orientation="horizontal"
          {...props}
        />
      </div>
    );
  }

  return (
    <SeparatorPrimitive
      className={cn(
        separatorClass,
        className,
      )}
      data-slot="separator"
      orientation={orientation}
      {...props}
    />
  );
}

export { SeparatorPrimitive };

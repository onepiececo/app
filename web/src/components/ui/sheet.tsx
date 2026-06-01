"use client";

import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { XIcon } from "lucide-react";
import type React from "react";
import { tv } from "tailwind-variants";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mergeBaseUiClassName } from "@/lib/base-ui-class-name";

type SheetSide = "right" | "left" | "top" | "bottom";
type SheetVariant = "default" | "inset";

export const sheetVariants = tv({
  slots: {
    backdrop:
      "fixed inset-0 z-50 bg-black/32 backdrop-blur-sm transition-all duration-200 data-starting-style:opacity-0 data-ending-style:opacity-0",
    viewport: "fixed inset-0 z-50 grid",
    popup: [
      "relative flex max-h-full min-h-0 w-full min-w-0 flex-col bg-popover not-dark:bg-clip-padding text-popover-foreground transition-[opacity,translate] duration-200 ease-in-out will-change-transform data-starting-style:opacity-0 data-ending-style:opacity-0",
      "shadow-[0_0_24px_rgb(0_0_0/0.08),0_0_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_24px_rgb(0_0_0/0.4),0_0_2px_rgb(0_0_0/0.2),0_0_0_1px_rgb(255_255_255/0.06)]",
    ],
    header:
      "grid grid-cols-[1fr_auto] items-start gap-x-4 p-6 [&_[data-slot=sheet-description]]:col-span-full in-[[data-slot=sheet-popup]:has([data-slot=sheet-panel])]:pb-3 max-sm:pb-4",
    headerContent: "flex flex-col gap-2",
    close: "col-start-2 row-start-1 -mt-1 -mr-1",
    footer: "flex flex-col-reverse gap-2 px-6 sm:flex-row sm:justify-end",
    title: "font-heading font-semibold text-xl leading-none",
    description: "text-muted-foreground text-sm",
    panel:
      "p-6 in-[[data-slot=sheet-popup]:has([data-slot=sheet-header])]:pt-1 in-[[data-slot=sheet-popup]:has([data-slot=sheet-footer]:not(.border-t))]:pb-1",
  },
  variants: {
    side: {
      bottom: {
        viewport: "grid grid-rows-[1fr_auto] pt-12",
        popup:
          "row-start-2 data-starting-style:translate-y-8 data-ending-style:translate-y-8",
      },
      top: {
        viewport: "grid grid-rows-[auto_1fr] pb-12",
        popup:
          "data-starting-style:-translate-y-8 data-ending-style:-translate-y-8",
      },
      left: {
        viewport: "flex justify-start",
        popup:
          "w-[calc(100%-(--spacing(12)))] max-w-md data-starting-style:-translate-x-8 data-ending-style:-translate-x-8",
      },
      right: {
        viewport: "flex justify-end",
        popup:
          "col-start-2 w-[calc(100%-(--spacing(12)))] max-w-md data-starting-style:translate-x-8 data-ending-style:translate-x-8",
      },
    },
    variant: {
      default: {},
      inset: {
        viewport: "sm:p-4",
        popup:
          "sm:rounded-2xl sm:**:data-[slot=sheet-footer]:rounded-b-[calc(var(--radius-2xl)-1px)]",
      },
    },
    footerVariant: {
      default: {
        footer: "border-t bg-muted/72 py-4",
      },
      bare: {
        footer:
          "in-[[data-slot=sheet-popup]:has([data-slot=sheet-panel])]:pt-3 pt-4 pb-6",
      },
    },
  },
  defaultVariants: {
    footerVariant: "default",
    side: "right",
    variant: "default",
  },
});

const sheetStyles = sheetVariants();

export const Sheet: typeof SheetPrimitive.Root = SheetPrimitive.Root;

export const SheetPortal: typeof SheetPrimitive.Portal = SheetPrimitive.Portal;

export function SheetTrigger(
  props: SheetPrimitive.Trigger.Props,
): React.ReactElement {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

export function SheetClose(
  props: SheetPrimitive.Close.Props,
): React.ReactElement {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

export function SheetBackdrop({
  className,
  ...props
}: SheetPrimitive.Backdrop.Props): React.ReactElement {
  return (
    <SheetPrimitive.Backdrop
      className={mergeBaseUiClassName(sheetStyles.backdrop, className)}
      data-slot="sheet-backdrop"
      {...props}
    />
  );
}

export function SheetViewport({
  className,
  side,
  variant = "default",
  ...props
}: SheetPrimitive.Viewport.Props & {
  side?: SheetSide;
  variant?: SheetVariant;
}): React.ReactElement {
  const styles = sheetVariants({ side, variant });

  return (
    <SheetPrimitive.Viewport
      className={mergeBaseUiClassName(styles.viewport, className)}
      data-slot="sheet-viewport"
      {...props}
    />
  );
}

export function SheetPopup({
  className,
  children,
  side = "right",
  variant = "default",
  portalProps,
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: SheetSide;
  variant?: SheetVariant;
  portalProps?: SheetPrimitive.Portal.Props;
}): React.ReactElement {
  const styles = sheetVariants({ side, variant });

  return (
    <SheetPortal {...portalProps}>
      <SheetBackdrop />
      <SheetViewport side={side} variant={variant}>
        <SheetPrimitive.Popup
          className={mergeBaseUiClassName(styles.popup, className)}
          data-slot="sheet-popup"
          {...props}
        >
          {children}
        </SheetPrimitive.Popup>
      </SheetViewport>
    </SheetPortal>
  );
}

export function SheetHeader({
  className,
  children,
  showCloseButton = true,
  closeProps,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
  closeProps?: SheetPrimitive.Close.Props;
}): React.ReactElement {
  return (
    <div
      className={sheetStyles.header({ class: className })}
      data-slot="sheet-header"
      {...props}
    >
      <div className={sheetStyles.headerContent()}>{children}</div>
      {showCloseButton ? (
        <SheetPrimitive.Close
          aria-label="Close"
          className={sheetStyles.close()}
          render={<Button size="icon-sm" variant="ghost" />}
          {...closeProps}
        >
          <XIcon />
        </SheetPrimitive.Close>
      ) : null}
    </div>
  );
}

export function SheetFooter({
  className,
    variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"div"> & {
  variant?: "default" | "bare";
}): React.ReactElement {
  const defaultProps = {
    className: sheetVariants({ footerVariant: variant }).footer({
      class: className,
    }),
    "data-slot": "sheet-footer",
  };

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

export function SheetTitle({
  className,
  ...props
}: SheetPrimitive.Title.Props): React.ReactElement {
  return (
    <SheetPrimitive.Title
      className={mergeBaseUiClassName(sheetStyles.title, className)}
      data-slot="sheet-title"
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props): React.ReactElement {
  return (
    <SheetPrimitive.Description
      className={mergeBaseUiClassName(sheetStyles.description, className)}
      data-slot="sheet-description"
      {...props}
    />
  );
}

export function SheetPanel({
  className,
  scrollFade = true,
  render,
  ...props
}: useRender.ComponentProps<"div"> & {
  scrollFade?: boolean;
}): React.ReactElement {
  const defaultProps = {
    className: sheetStyles.panel({ class: className }),
    "data-slot": "sheet-panel",
  };

  return (
    <ScrollArea scrollFade={scrollFade}>
      {useRender({
        defaultTagName: "div",
        props: mergeProps<"div">(defaultProps, props),
        render,
      })}
    </ScrollArea>
  );
}

export {
  SheetPrimitive,
  SheetBackdrop as SheetOverlay,
  SheetPopup as SheetContent,
};

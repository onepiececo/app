"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { XIcon } from "lucide-react";
import type React from "react";
import { tv } from "tailwind-variants";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mergeBaseUiClassName } from "@/lib/base-ui-class-name";

export const dialogVariants = tv({
  slots: {
    backdrop:
      "fixed inset-0 z-50 bg-black/32 backdrop-blur-sm transition-opacity duration-[200ms] ease-out data-ending-style:opacity-0 data-starting-style:opacity-0",
    viewport:
      "fixed inset-0 z-50 grid grid-rows-[1fr_auto_1fr] justify-items-center p-4",
    popup:
      "relative row-start-2 flex max-h-full min-h-0 w-full min-w-0 max-w-lg origin-center flex-col rounded-2xl bg-popover not-dark:bg-clip-padding text-popover-foreground opacity-[calc(1-var(--nested-dialogs))] outline-none overflow-hidden shadow-[0_0_0_1px_color-mix(in_srgb,var(--foreground)_18%,var(--background)),0_22px_52px_rgb(0_0_0/0.22)] inset-shadow-[0_1px_0_rgb(255_255_255/0.3)] transition-[scale,opacity,translate] duration-[200ms] ease-out data-ending-style:duration-[160ms] will-change-transform data-ending-style:opacity-0 data-starting-style:opacity-0 sm:scale-[calc(1-0.1*var(--nested-dialogs))] sm:data-ending-style:scale-98 sm:data-starting-style:scale-98 dark:shadow-[0_0_0_1px_rgb(0_0_0/0.6),0_22px_52px_rgb(0_0_0/0.6)] dark:inset-shadow-[0_1px_0_rgb(255_255_255/0.06)]",
    header:
      "grid grid-cols-[1fr_auto] items-start gap-x-4 p-6 [&_[data-slot=dialog-description]]:col-span-full in-[[data-slot=dialog-popup]:has([data-slot=dialog-panel-root])]:pb-4 max-sm:pb-4",
    body: "px-6 pb-5",
    panelRoot: "min-h-0 flex-1 border-t border-border",
    panel: "px-6 py-4",
    footer:
      "flex flex-col-reverse gap-2 px-6 sm:flex-row sm:justify-end",
    title: "font-semibold text-lg leading-none",
    description: "mt-1 text-muted-foreground text-sm",
  },
  defaultVariants: {
    footer: "default",
    mobile: "bottom",
  },
  variants: {
    footer: {
      default: {
        footer:
          "border-t border-border bg-[color-mix(in_srgb,var(--foreground)_7%,var(--background))] py-3 dark:bg-[color-mix(in_srgb,var(--foreground)_12%,var(--background))]",
      },
      bare: {
        footer: "pb-6",
      },
    },
    mobile: {
      bottom: {
        viewport: "max-sm:grid-rows-[1fr_auto] max-sm:p-0 max-sm:pt-12",
        popup:
          "max-sm:max-w-none max-sm:origin-bottom max-sm:rounded-none max-sm:data-ending-style:translate-y-4 max-sm:data-starting-style:translate-y-4",
      },
      centered: {},
    },
  },
});

export const DialogCreateHandle: typeof DialogPrimitive.createHandle =
  DialogPrimitive.createHandle;

export const Dialog: typeof DialogPrimitive.Root = DialogPrimitive.Root;

export const DialogPortal: typeof DialogPrimitive.Portal =
  DialogPrimitive.Portal;

export function DialogTrigger(
  props: DialogPrimitive.Trigger.Props,
): React.ReactElement {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

export function DialogClose(
  props: DialogPrimitive.Close.Props,
): React.ReactElement {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

export function DialogBackdrop({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props): React.ReactElement {
  const styles = dialogVariants();

  return (
    <DialogPrimitive.Backdrop
      className={mergeBaseUiClassName(styles.backdrop, className)}
      data-slot="dialog-backdrop"
      {...props}
    />
  );
}

export function DialogViewport({
  className,
  ...props
}: DialogPrimitive.Viewport.Props): React.ReactElement {
  const styles = dialogVariants();

  return (
    <DialogPrimitive.Viewport
      className={mergeBaseUiClassName(styles.viewport, className)}
      data-slot="dialog-viewport"
      {...props}
    />
  );
}

export function DialogPopup({
  className,
  children,
  bottomStickOnMobile = true,
  portalProps,
  ...props
}: DialogPrimitive.Popup.Props & {
  bottomStickOnMobile?: boolean;
  portalProps?: DialogPrimitive.Portal.Props;
}): React.ReactElement {
  const styles = dialogVariants({
    mobile: bottomStickOnMobile ? "bottom" : "centered",
  });

  return (
    <DialogPortal {...portalProps}>
      <DialogBackdrop />
      <DialogPrimitive.Viewport
        className={styles.viewport()}
        data-slot="dialog-viewport"
      >
        <DialogPrimitive.Popup
          className={mergeBaseUiClassName(styles.popup, className)}
          data-slot="dialog-popup"
          {...props}
        >
          {children}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Viewport>
    </DialogPortal>
  );
}

export function DialogHeader({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
}): React.ReactElement {
  const styles = dialogVariants();

  return (
    <div
      className={styles.header({ class: className })}
      data-slot="dialog-header"
      {...props}
    >
      {children}
      {showCloseButton ? (
        <DialogPrimitive.Close
          aria-label="Close"
          className="col-start-2 row-start-1 -mt-1 -mr-1"
          render={<Button size="icon-sm" variant="ghost" />}
        >
          <XIcon />
        </DialogPrimitive.Close>
      ) : null}
    </div>
  );
}

export function DialogBody({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">): React.ReactElement {
  const styles = dialogVariants();

  const defaultProps = {
    className: styles.body({ class: className }),
    "data-slot": "dialog-body",
  };

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

export function DialogPanel({
  className,
  scrollFade = true,
  render,
  ...props
}: useRender.ComponentProps<"div"> & {
  scrollFade?: boolean;
}): React.ReactElement {
  const styles = dialogVariants();

  const defaultProps = {
    className: styles.panel({ class: className }),
    "data-slot": "dialog-panel",
  };

  return (
    <div
      className={styles.panelRoot()}
      data-slot="dialog-panel-root"
    >
      <ScrollArea scrollFade={scrollFade}>
        {useRender({
          defaultTagName: "div",
          props: mergeProps<"div">(defaultProps, props),
          render,
        })}
      </ScrollArea>
    </div>
  );
}

export function DialogFooter({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"div"> & {
  variant?: "default" | "bare";
}): React.ReactElement {
  const styles = dialogVariants({ footer: variant });

  const defaultProps = {
    className: styles.footer({ class: className }),
    "data-slot": "dialog-footer",
  };

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

export function DialogTitle({
  className,
  ...props
}: DialogPrimitive.Title.Props): React.ReactElement {
  const styles = dialogVariants();

  return (
    <DialogPrimitive.Title
      className={mergeBaseUiClassName(styles.title, className)}
      data-slot="dialog-title"
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props): React.ReactElement {
  const styles = dialogVariants();

  return (
    <DialogPrimitive.Description
      className={mergeBaseUiClassName(styles.description, className)}
      data-slot="dialog-description"
      {...props}
    />
  );
}

export {
  DialogPrimitive,
  DialogBackdrop as DialogOverlay,
  DialogPopup as DialogContent,
};

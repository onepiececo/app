import type * as React from "react";
import { tv } from "tailwind-variants";

export const frameVariants = tv({
  slots: {
    root: [
      "relative flex flex-col overflow-hidden rounded-2xl bg-muted/72 bg-clip-padding p-1",
      "shadow-[inset_0_1px_3px_rgb(0_0_0/0.06)] dark:shadow-[inset_0_1px_3px_rgb(0_0_0/0.3)]",
      "*:[[data-slot=frame-panel]+[data-slot=frame-panel]]:mt-1",
    ],
    panel: [
      "relative rounded-xl bg-background bg-clip-padding p-5 shadow-xs/5",
      "before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-xl)-1px)]",
      "before:shadow-[0_1px_--theme(--color-black/4%)] dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
    ],
    header: "flex flex-col px-5 py-4",
    title: "font-semibold text-sm",
    description: "text-muted-foreground text-sm",
    footer: "px-5 py-4 text-muted-foreground text-sm",
  },
});

const frameStyles = frameVariants();

export function Frame({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      className={frameStyles.root({ class: className })}
      data-slot="frame"
      {...props}
    />
  );
}

export function FramePanel({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      className={frameStyles.panel({ class: className })}
      data-slot="frame-panel"
      {...props}
    />
  );
}

export function FrameHeader({
  className,
  ...props
}: React.ComponentProps<"header">): React.ReactElement {
  return (
    <header
      className={frameStyles.header({ class: className })}
      data-slot="frame-panel-header"
      {...props}
    />
  );
}

export function FrameTitle({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      className={frameStyles.title({ class: className })}
      data-slot="frame-panel-title"
      {...props}
    />
  );
}

export function FrameDescription({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      className={frameStyles.description({ class: className })}
      data-slot="frame-panel-description"
      {...props}
    />
  );
}

export function FrameFooter({
  className,
  ...props
}: React.ComponentProps<"footer">): React.ReactElement {
  return (
    <footer
      className={frameStyles.footer({ class: className })}
      data-slot="frame-panel-footer"
      {...props}
    />
  );
}

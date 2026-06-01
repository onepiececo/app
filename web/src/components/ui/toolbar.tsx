"use client";

import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar";
import type React from "react";
import { tv } from "tailwind-variants";
import { Button, type ButtonProps } from "@/components/ui/button";
import { inputSurfaceVariants } from "@/components/ui/input";
import { mergeBaseUiClassName } from "@/lib/base-ui-class-name";

export const toolbarVariants = tv({
  slots: {
    root: "relative inline-flex w-fit items-center gap-2 rounded-lg bg-white p-1 text-foreground shadow-[0_0_0_1px_rgb(9_9_11/0.1),0_1px_2px_rgb(0_0_0/0.05)] dark:bg-white/5 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)]",
    input: `${inputSurfaceVariants({ layout: "inline" })} h-8 min-w-32 px-[calc(--spacing(3)-1px)] text-sm sm:h-7`,
    group: "flex items-center gap-1",
    separator:
      "shrink-0 bg-border data-[orientation=horizontal]:my-0.5 data-[orientation=vertical]:my-1.5 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-5 data-[orientation=vertical]:w-px",
  },
});

export function Toolbar({
  className,
  ...props
}: ToolbarPrimitive.Root.Props): React.ReactElement {
  const styles = toolbarVariants();

  return (
    <ToolbarPrimitive.Root
      className={mergeBaseUiClassName(styles.root, className)}
      data-slot="toolbar"
      {...props}
    />
  );
}

export function ToolbarButton({
  className,
  render,
  size = "icon-sm",
  variant = "ghost",
  children,
  ...props
}: ToolbarPrimitive.Button.Props & {
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
}): React.ReactElement {
  const button = render ?? <Button size={size} variant={variant} />;

  return (
    <ToolbarPrimitive.Button
      className={className}
      data-slot="toolbar-button"
      render={button}
      {...props}
    >
      {children}
    </ToolbarPrimitive.Button>
  );
}

export function ToolbarLink({
  className,
  ...props
}: ToolbarPrimitive.Link.Props): React.ReactElement {
  return (
    <ToolbarPrimitive.Link
      className={className}
      data-slot="toolbar-link"
      {...props}
    />
  );
}

export function ToolbarInput({
  className,
  ...props
}: ToolbarPrimitive.Input.Props): React.ReactElement {
  const styles = toolbarVariants();

  return (
    <ToolbarPrimitive.Input
      className={mergeBaseUiClassName(styles.input, className)}
      data-slot="toolbar-input"
      {...props}
    />
  );
}

export function ToolbarGroup({
  className,
  ...props
}: ToolbarPrimitive.Group.Props): React.ReactElement {
  const styles = toolbarVariants();

  return (
    <ToolbarPrimitive.Group
      className={mergeBaseUiClassName(styles.group, className)}
      data-slot="toolbar-group"
      {...props}
    />
  );
}

export function ToolbarSeparator({
  className,
  ...props
}: ToolbarPrimitive.Separator.Props): React.ReactElement {
  const styles = toolbarVariants();

  return (
    <ToolbarPrimitive.Separator
      className={mergeBaseUiClassName(styles.separator, className)}
      data-slot="toolbar-separator"
      {...props}
    />
  );
}

export { ToolbarPrimitive };

"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { useRender } from "@base-ui/react/use-render";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import type * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { mergeBaseUiClassName } from "@/lib/base-ui-class-name";
import { cn } from "@/lib/utils";

export const Select: typeof SelectPrimitive.Root = SelectPrimitive.Root;

export const selectVariants = tv({
  slots: {
    trigger:
      "relative inline-flex w-full min-w-36 select-none items-center justify-between gap-2 rounded-lg bg-background px-[calc(--spacing(3)-1px)] text-left text-base text-foreground outline-none transition-shadow shadow-[0_0_0_1px_color-mix(in_srgb,var(--foreground)_20%,var(--background)),0_1px_2px_rgb(0_0_0/0.04)] inset-shadow-[0_1px_0_rgb(255_255_255/0.6)] hover:bg-background hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--foreground)_30%,var(--background)),0_2px_4px_rgb(0_0_0/0.1)] hover:inset-shadow-[0_1px_0_rgb(255_255_255/0.8)] focus-visible:shadow-[0_0_0_1px_var(--ring),0_0_0_3px_color-mix(in_srgb,var(--ring)_24%,transparent),0_1px_2px_rgb(0_0_0/0.05)] data-pressed:bg-[color-mix(in_srgb,var(--foreground)_5%,var(--background))] data-pressed:shadow-[0_0_0_1px_var(--ring),0_0_0_3px_color-mix(in_srgb,var(--ring)_24%,transparent),0_1px_2px_rgb(0_0_0/0.05)] data-pressed:inset-shadow-none data-popup-open:shadow-[0_0_0_1px_var(--ring),0_0_0_3px_color-mix(in_srgb,var(--ring)_24%,transparent),0_1px_2px_rgb(0_0_0/0.05)] data-disabled:pointer-events-none data-disabled:opacity-50 pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 sm:text-sm dark:bg-[color-mix(in_srgb,var(--foreground)_2%,var(--background))] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.35)] dark:inset-shadow-[0_1px_0_rgb(255_255_255/0.1)] dark:hover:bg-[color-mix(in_srgb,var(--foreground)_5%,var(--background))] dark:hover:shadow-[0_0_0_1px_rgb(255_255_255/0.2),0_2px_5px_rgb(0_0_0/0.45)] dark:hover:inset-shadow-[0_1px_0_rgb(255_255_255/0.14)] dark:focus-visible:shadow-[0_0_0_1px_var(--ring),0_0_0_3px_color-mix(in_srgb,var(--ring)_26%,transparent)] dark:data-pressed:bg-[color-mix(in_srgb,var(--foreground)_8%,var(--background))] dark:data-pressed:shadow-[0_0_0_1px_var(--ring),0_0_0_3px_color-mix(in_srgb,var(--ring)_26%,transparent)] dark:data-popup-open:shadow-[0_0_0_1px_var(--ring),0_0_0_3px_color-mix(in_srgb,var(--ring)_26%,transparent)] [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    value: "flex-1 truncate data-placeholder:text-muted-foreground/72",
    icon: "-me-1 size-4.5 opacity-80 sm:size-4",
    positioner: "z-50 select-none",
    popup:
      "origin-(--transform-origin) min-w-(--anchor-width) overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground outline-none shadow-lg/5 transition-[scale,opacity] duration-[160ms] ease-out data-ending-style:duration-[140ms] data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0",
    list: "max-h-(--available-height) overflow-y-auto p-1",
    scrollArrow:
      "z-50 flex h-6 w-full cursor-default items-center justify-center before:pointer-events-none before:absolute before:inset-x-px before:h-[200%] before:from-50% before:from-popover [&_svg]:relative [&_svg]:size-4.5 sm:[&_svg]:size-4",
    item: "relative grid min-h-9 in-data-[side=none]:min-w-[calc(var(--anchor-width)+1.25rem)] cursor-default grid-cols-[1fr_1rem] items-center gap-2 rounded-sm ps-3 pe-2 py-1.5 text-base outline-none data-disabled:cursor-not-allowed data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-64 sm:min-h-8 sm:text-sm [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    itemText: "col-start-1 min-w-0 truncate",
    itemIndicator: "col-start-2",
    separator: "mx-2 my-1 h-px bg-border",
    label:
      "not-in-data-[slot=field]:mb-2 inline-flex cursor-default items-center gap-2 font-medium text-base/4.5 text-foreground sm:text-sm/4",
    groupLabel: "px-2 py-1.5 font-medium text-muted-foreground text-xs",
  },
  defaultVariants: {
    size: "md",
  },
  variants: {
    size: {
      lg: {
        trigger: "min-h-10 sm:min-h-9",
      },
      md: {
        trigger: "min-h-9 sm:min-h-8",
      },
      sm: {
        trigger: "min-h-8 gap-1.5 px-[calc(--spacing(2.5)-1px)] sm:min-h-7",
      },
    },
  },
});

export interface SelectButtonProps extends useRender.ComponentProps<"button"> {
  size?: VariantProps<typeof selectVariants>["size"];
}

export function SelectButton({
  className,
  size,
  render,
  children,
  ...props
}: SelectButtonProps): React.ReactElement {
  const typeValue: React.ButtonHTMLAttributes<HTMLButtonElement>["type"] =
    render ? undefined : "button";
  const styles = selectVariants({ size });

  const defaultProps = {
    children: (
      <>
        <span className={styles.value()}>
          {children}
        </span>
        <ChevronsUpDownIcon className={styles.icon()} />
      </>
    ),
    className: styles.trigger({ class: cn("min-w-0", className) }),
    "data-slot": "select-button",
    type: typeValue,
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export function SelectTrigger({
  className,
  size,
  children,
  ...props
}: SelectPrimitive.Trigger.Props &
  VariantProps<typeof selectVariants>): React.ReactElement {
  const styles = selectVariants({ size });

  return (
    <SelectPrimitive.Trigger
      className={mergeBaseUiClassName(styles.trigger, className)}
      data-slot="select-trigger"
      {...props}
    >
      {children}
      <SelectPrimitive.Icon data-slot="select-icon">
        <ChevronsUpDownIcon className={styles.icon()} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectValue({
  className,
  ...props
}: SelectPrimitive.Value.Props): React.ReactElement {
  const styles = selectVariants();

  return (
    <SelectPrimitive.Value
      className={mergeBaseUiClassName(styles.value, className)}
      data-slot="select-value"
      {...props}
    />
  );
}

export function SelectPopup({
  className,
  children,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  alignItemWithTrigger = false,
  anchor,
  portalProps,
  ...props
}: SelectPrimitive.Popup.Props & {
  portalProps?: SelectPrimitive.Portal.Props;
  side?: SelectPrimitive.Positioner.Props["side"];
  sideOffset?: SelectPrimitive.Positioner.Props["sideOffset"];
  align?: SelectPrimitive.Positioner.Props["align"];
  alignOffset?: SelectPrimitive.Positioner.Props["alignOffset"];
  alignItemWithTrigger?: SelectPrimitive.Positioner.Props["alignItemWithTrigger"];
  anchor?: SelectPrimitive.Positioner.Props["anchor"];
}): React.ReactElement {
  const styles = selectVariants();

  return (
    <SelectPrimitive.Portal {...portalProps}>
      <SelectPrimitive.Positioner
        align={align}
        alignItemWithTrigger={alignItemWithTrigger}
        alignOffset={alignOffset}
        anchor={anchor}
        className={styles.positioner()}
        data-slot="select-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <SelectPrimitive.Popup
          className={styles.popup()}
          data-slot="select-popup"
          {...props}
        >
          <SelectPrimitive.ScrollUpArrow
            className={styles.scrollArrow({ class: "top-0 before:top-px before:rounded-t-[calc(var(--radius-lg)-1px)] before:bg-linear-to-b" })}
            data-slot="select-scroll-up-arrow"
          >
            <ChevronUpIcon />
          </SelectPrimitive.ScrollUpArrow>
          <SelectPrimitive.List
            className={typeof className === "function" ? styles.list() : styles.list({ class: className })}
            data-slot="select-list"
          >
            {children}
          </SelectPrimitive.List>
          <SelectPrimitive.ScrollDownArrow
            className={styles.scrollArrow({ class: "bottom-0 before:bottom-px before:rounded-b-[calc(var(--radius-lg)-1px)] before:bg-linear-to-t" })}
            data-slot="select-scroll-down-arrow"
          >
            <ChevronDownIcon />
          </SelectPrimitive.ScrollDownArrow>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props): React.ReactElement {
  const styles = selectVariants();

  return (
    <SelectPrimitive.Item
      className={mergeBaseUiClassName(styles.item, className)}
      data-slot="select-item"
      {...props}
    >
      <SelectPrimitive.ItemText className={styles.itemText()}>
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className={styles.itemIndicator()}>
        <CheckIcon aria-hidden className="size-4 opacity-80" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

export function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props): React.ReactElement {
  const styles = selectVariants();

  return (
    <SelectPrimitive.Separator
      className={mergeBaseUiClassName(styles.separator, className)}
      data-slot="select-separator"
      {...props}
    />
  );
}

export function SelectGroup(
  props: SelectPrimitive.Group.Props,
): React.ReactElement {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

export function SelectLabel({
  className,
  ...props
}: SelectPrimitive.Label.Props): React.ReactElement {
  const styles = selectVariants();

  return (
    <SelectPrimitive.Label
      className={mergeBaseUiClassName(styles.label, className)}
      data-slot="select-label"
      {...props}
    />
  );
}

export function SelectGroupLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props): React.ReactElement {
  const styles = selectVariants();

  return (
    <SelectPrimitive.GroupLabel
      className={mergeBaseUiClassName(styles.groupLabel, className)}
      data-slot="select-group-label"
      {...props}
    />
  );
}

export const SelectContent = SelectPopup;

export { SelectPrimitive };

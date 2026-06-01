"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { ChevronsUpDownIcon, XIcon } from "lucide-react";
import * as React from "react";
import { tv } from "tailwind-variants";
import { Input, inputSurfaceVariants } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mergeBaseUiClassName } from "@/lib/base-ui-class-name";

export const comboboxVariants = tv({
  slots: {
    chipsInput:
      "min-w-24 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/72 sm:text-sm",
    inputGroup:
      "relative not-has-[>*.w-full]:w-fit w-full text-foreground has-disabled:opacity-64",
    inputStartAddon:
      "pointer-events-none absolute inset-y-0 start-px z-10 flex items-center ps-[calc(--spacing(3)-1px)] opacity-80 has-[+[data-size=sm]]:ps-[calc(--spacing(2.5)-1px)] [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:-mx-0.5",
    input: "",
    inputNative: "has-disabled:opacity-100",
    trigger:
      "absolute top-1/2 inline-flex size-8 shrink-0 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md border border-transparent opacity-80 outline-none transition-opacity pointer-coarse:after:absolute pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 hover:opacity-100 has-[+[data-slot=combobox-clear]]:hidden sm:size-7 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    clear:
      "absolute top-1/2 inline-flex size-8 shrink-0 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md border border-transparent opacity-80 outline-none transition-opacity pointer-coarse:after:absolute pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 hover:opacity-100 has-[+[data-slot=combobox-clear]]:hidden sm:size-7 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    positioner: "z-50 select-none",
    popup:
      "flex max-h-[min(var(--available-height),23rem)] min-w-(--anchor-width) max-w-(--available-width) origin-(--transform-origin) flex-col rounded-lg bg-white text-zinc-950 outline-none shadow-[0_0_0_1px_var(--color-zinc-300),0_8px_18px_rgb(0_0_0/0.12)] transition-[scale,opacity] duration-[160ms] ease-out inset-shadow-[0_1px_0_rgb(255_255_255/0.75)] data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 dark:bg-zinc-900 dark:text-white dark:shadow-[0_0_0_1px_rgb(255_255_255/0.14),0_8px_18px_rgb(0_0_0/0.45)] dark:inset-shadow-[0_1px_0_rgb(255_255_255/0.08)]",
    item:
      "grid min-h-9 in-data-[side=none]:min-w-[calc(var(--anchor-width)+1.25rem)] cursor-default grid-cols-[1fr_1rem] items-center gap-2 rounded-sm ps-3 pe-2 py-1.5 text-base outline-none data-disabled:pointer-events-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-64 sm:min-h-8 sm:text-sm [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    itemText: "col-start-1",
    itemIndicator: "col-start-2",
    separator: "mx-2 my-1 h-px bg-border last:hidden",
    group: "[[role=group]+&]:mt-1.5",
    groupLabel: "px-2 py-1.5 font-medium text-muted-foreground text-xs",
    empty: "not-empty:p-2 text-center text-base text-muted-foreground sm:text-sm",
    row: "",
    list:
      "not-empty:scroll-py-1 not-empty:px-1 not-empty:py-1 in-data-has-overflow-y:pe-3",
    status:
      "px-3 py-2 font-medium text-muted-foreground text-xs empty:m-0 empty:p-0",
    chips:
      `${inputSurfaceVariants({ layout: "inline" })} min-h-9 flex-wrap items-center gap-1 px-[calc(--spacing(3)-1px)] py-1 has-data-[size=lg]:min-h-10 has-data-[size=sm]:min-h-8 has-data-[size=lg]:*:min-h-8 has-data-[size=sm]:*:min-h-6 sm:min-h-8 sm:has-data-[size=lg]:min-h-9 sm:has-data-[size=sm]:min-h-7 sm:*:min-h-6 sm:has-data-[size=lg]:*:min-h-7 sm:has-data-[size=sm]:*:min-h-5 has-disabled:pointer-events-none`,
    chipsStartAddon:
      "flex shrink-0 items-center ps-2 opacity-80 has-[~[data-size=sm]]:has-[+[data-slot=combobox-chip]]:pe-1.5 has-[~[data-size=sm]]:ps-1.5 has-[+[data-slot=combobox-chip]]:pe-2 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:-ms-0.5 [&_svg]:-me-1.5",
    chip:
      "inline-flex items-center gap-0.5 rounded-md bg-[color-mix(in_srgb,var(--foreground)_6%,var(--background))] ps-2 pe-0.5 font-medium text-foreground text-xs outline-none shadow-[0_0_0_1px_color-mix(in_srgb,var(--foreground)_18%,var(--background))] dark:bg-white/8 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)] [&_svg:not([class*='size-'])]:size-3.5",
    chipRemove:
      "inline-flex size-4.5 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground outline-none transition-[background-color,color] duration-[120ms] ease-out hover:bg-destructive/12 hover:text-destructive-foreground dark:hover:bg-destructive/18 [&_svg:not([class*='size-'])]:size-3",
  },
  defaultVariants: {
    size: "md",
    startAddon: false,
  },
  variants: {
    size: {
      sm: {
        trigger: "end-0",
        clear: "end-0",
        input:
          "has-[+[data-slot=combobox-trigger],+[data-slot=combobox-clear]]:*:data-[slot=combobox-input]:pe-6.5",
      },
      md: {
        trigger: "end-0.5",
        clear: "end-0.5",
        input:
          "has-[+[data-slot=combobox-trigger],+[data-slot=combobox-clear]]:*:data-[slot=combobox-input]:pe-7",
      },
      lg: {
        trigger: "end-0.5",
        clear: "end-0.5",
        input:
          "has-[+[data-slot=combobox-trigger],+[data-slot=combobox-clear]]:*:data-[slot=combobox-input]:pe-7",
      },
    },
    startAddon: {
      true: {
        input:
          "data-[size=sm]:*:data-[slot=combobox-input]:ps-[calc(--spacing(7.5)-1px)] *:data-[slot=combobox-input]:ps-[calc(--spacing(8.5)-1px)] sm:data-[size=sm]:*:data-[slot=combobox-input]:ps-[calc(--spacing(7)-1px)] sm:*:data-[slot=combobox-input]:ps-[calc(--spacing(8)-1px)]",
      },
      false: {},
    },
  },
});

export const ComboboxContext: React.Context<{
  chipsRef: React.RefObject<Element | null> | null;
  multiple: boolean;
}> = React.createContext<{
  chipsRef: React.RefObject<Element | null> | null;
  multiple: boolean;
}>({
  chipsRef: null,
  multiple: false,
});

export function Combobox<Value, Multiple extends boolean | undefined = false>(
  props: ComboboxPrimitive.Root.Props<Value, Multiple>,
): React.ReactElement {
  const chipsRef = React.useRef<Element | null>(null);
  return (
    <ComboboxContext.Provider value={{ chipsRef, multiple: !!props.multiple }}>
      <ComboboxPrimitive.Root {...props} />
    </ComboboxContext.Provider>
  );
}

export function ComboboxChipsInput({
  className,
  size,
  ...props
}: Omit<ComboboxPrimitive.Input.Props, "size"> & {
  size?: "sm" | "default" | "lg" | number;
  ref?: React.Ref<HTMLInputElement>;
}): React.ReactElement {
  const sizeValue = (size ?? "default") as "sm" | "default" | "lg" | number;
  const styles = comboboxVariants();

  return (
    <ComboboxPrimitive.Input
      className={mergeBaseUiClassName(styles.chipsInput, className)}
      data-size={typeof sizeValue === "string" ? sizeValue : undefined}
      data-slot="combobox-chips-input"
      size={typeof sizeValue === "number" ? sizeValue : undefined}
      {...props}
    />
  );
}

export function ComboboxInput({
  className,
  showTrigger = true,
  showClear = false,
  startAddon,
  size,
  triggerProps,
  clearProps,
  ...props
}: Omit<ComboboxPrimitive.Input.Props, "size"> & {
  showTrigger?: boolean;
  showClear?: boolean;
  startAddon?: React.ReactNode;
  size?: "sm" | "default" | "lg" | number;
  ref?: React.Ref<HTMLInputElement>;
  triggerProps?: ComboboxPrimitive.Trigger.Props;
  clearProps?: ComboboxPrimitive.Clear.Props;
}): React.ReactElement {
  const sizeValue = (size ?? "default") as "sm" | "default" | "lg" | number;
  const sizeVariant = sizeValue === "sm" || sizeValue === "lg" ? sizeValue : "md";
  const styles = comboboxVariants({
    size: sizeVariant,
    startAddon: !!startAddon,
  });

  return (
    <ComboboxPrimitive.InputGroup
      className={styles.inputGroup()}
      data-slot="combobox-input-group"
    >
      {startAddon && (
        <div
          aria-hidden="true"
          className={styles.inputStartAddon()}
          data-slot="combobox-start-addon"
        >
          {startAddon}
        </div>
      )}
      <ComboboxPrimitive.Input
        className={mergeBaseUiClassName(styles.input, className)}
        data-slot="combobox-input"
        render={
          <Input
            className={styles.inputNative()}
            nativeInput
            size={sizeValue}
          />
        }
        {...props}
      />
      {showTrigger && (
        <ComboboxTrigger
          className={styles.trigger()}
          {...triggerProps}
        >
          <ComboboxPrimitive.Icon data-slot="combobox-icon">
            <ChevronsUpDownIcon />
          </ComboboxPrimitive.Icon>
        </ComboboxTrigger>
      )}
      {showClear && (
        <ComboboxClear
          className={styles.clear()}
          {...clearProps}
        >
          <XIcon />
        </ComboboxClear>
      )}
    </ComboboxPrimitive.InputGroup>
  );
}

export function ComboboxTrigger({
  className,
  children,
  ...props
}: ComboboxPrimitive.Trigger.Props): React.ReactElement {
  return (
    <ComboboxPrimitive.Trigger
      className={className}
      data-slot="combobox-trigger"
      {...props}
    >
      {children}
    </ComboboxPrimitive.Trigger>
  );
}

export function ComboboxPopup({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  alignOffset,
  align = "start",
  anchor: anchorProp,
  portalProps,
  ...props
}: ComboboxPrimitive.Popup.Props & {
  align?: ComboboxPrimitive.Positioner.Props["align"];
  sideOffset?: ComboboxPrimitive.Positioner.Props["sideOffset"];
  alignOffset?: ComboboxPrimitive.Positioner.Props["alignOffset"];
  side?: ComboboxPrimitive.Positioner.Props["side"];
  anchor?: ComboboxPrimitive.Positioner.Props["anchor"];
  portalProps?: ComboboxPrimitive.Portal.Props;
}): React.ReactElement {
  const { chipsRef } = React.useContext(ComboboxContext);
  const anchor = anchorProp ?? chipsRef;
  const styles = comboboxVariants();

  return (
    <ComboboxPrimitive.Portal {...portalProps}>
      <ComboboxPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className={styles.positioner()}
        data-slot="combobox-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <ComboboxPrimitive.Popup
          className={mergeBaseUiClassName(styles.popup, className)}
          data-slot="combobox-popup"
          {...props}
        >
          {children}
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

export function ComboboxItem({
  className,
  children,
  ...props
}: ComboboxPrimitive.Item.Props): React.ReactElement {
  const styles = comboboxVariants();

  return (
    <ComboboxPrimitive.Item
      className={mergeBaseUiClassName(styles.item, className)}
      data-slot="combobox-item"
      {...props}
    >
      <div className={styles.itemText()}>{children}</div>
      <ComboboxPrimitive.ItemIndicator className={styles.itemIndicator()}>
        <svg
          aria-hidden="true"
          fill="none"
          height="24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5.252 12.7 10.2 18.63 18.748 5.37" />
        </svg>
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  );
}

export function ComboboxSeparator({
  className,
  ...props
}: ComboboxPrimitive.Separator.Props): React.ReactElement {
  const styles = comboboxVariants();

  return (
    <ComboboxPrimitive.Separator
      className={mergeBaseUiClassName(styles.separator, className)}
      data-slot="combobox-separator"
      {...props}
    />
  );
}

export function ComboboxGroup({
  className,
  ...props
}: ComboboxPrimitive.Group.Props): React.ReactElement {
  const styles = comboboxVariants();

  return (
    <ComboboxPrimitive.Group
      className={mergeBaseUiClassName(styles.group, className)}
      data-slot="combobox-group"
      {...props}
    />
  );
}

export function ComboboxGroupLabel({
  className,
  ...props
}: ComboboxPrimitive.GroupLabel.Props): React.ReactElement {
  const styles = comboboxVariants();

  return (
    <ComboboxPrimitive.GroupLabel
      className={mergeBaseUiClassName(styles.groupLabel, className)}
      data-slot="combobox-group-label"
      {...props}
    />
  );
}

export function ComboboxEmpty({
  className,
  ...props
}: ComboboxPrimitive.Empty.Props): React.ReactElement {
  const styles = comboboxVariants();

  return (
    <ComboboxPrimitive.Empty
      className={mergeBaseUiClassName(styles.empty, className)}
      data-slot="combobox-empty"
      {...props}
    />
  );
}

export function ComboboxRow({
  className,
  ...props
}: ComboboxPrimitive.Row.Props): React.ReactElement {
  const styles = comboboxVariants();

  return (
    <ComboboxPrimitive.Row
      className={mergeBaseUiClassName(styles.row, className)}
      data-slot="combobox-row"
      {...props}
    />
  );
}

export function ComboboxValue({
  ...props
}: ComboboxPrimitive.Value.Props): React.ReactElement {
  return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />;
}

export function ComboboxList({
  className,
  ...props
}: ComboboxPrimitive.List.Props): React.ReactElement {
  const styles = comboboxVariants();

  return (
    <ScrollArea className="flex-1" scrollbarGutter scrollFade>
      <ComboboxPrimitive.List
        className={mergeBaseUiClassName(styles.list, className)}
        data-slot="combobox-list"
        {...props}
      />
    </ScrollArea>
  );
}

export function ComboboxClear({
  className,
  ...props
}: ComboboxPrimitive.Clear.Props): React.ReactElement {
  return (
    <ComboboxPrimitive.Clear
      className={className}
      data-slot="combobox-clear"
      {...props}
    />
  );
}

export function ComboboxStatus({
  className,
  ...props
}: ComboboxPrimitive.Status.Props): React.ReactElement {
  const styles = comboboxVariants();

  return (
    <ComboboxPrimitive.Status
      className={mergeBaseUiClassName(styles.status, className)}
      data-slot="combobox-status"
      {...props}
    />
  );
}

export function ComboboxCollection(
  props: ComboboxPrimitive.Collection.Props,
): React.ReactElement {
  return (
    <ComboboxPrimitive.Collection data-slot="combobox-collection" {...props} />
  );
}

export function ComboboxChips({
  className,
  children,
  startAddon,
  ...props
}: ComboboxPrimitive.Chips.Props & {
  startAddon?: React.ReactNode;
}): React.ReactElement {
  const { chipsRef } = React.useContext(ComboboxContext);
  const styles = comboboxVariants();

  return (
    <ComboboxPrimitive.Chips
      className={mergeBaseUiClassName(styles.chips, className)}
      data-slot="combobox-chips"
      ref={chipsRef as React.Ref<HTMLDivElement> | null}
      {...props}
    >
      {startAddon && (
        <div
          aria-hidden="true"
          className={styles.chipsStartAddon()}
          data-slot="combobox-start-addon"
        >
          {startAddon}
        </div>
      )}
      {children}
    </ComboboxPrimitive.Chips>
  );
}

// Chip — the remove button is NOT auto-rendered. Pass <ComboboxChipRemove />
// inside the children as the Base UI docs show. This avoids the duplicate-X
// footgun where users would render their own ChipRemove on top of an auto one.
export function ComboboxChip({
  className,
  children,
  ...props
}: ComboboxPrimitive.Chip.Props): React.ReactElement {
  const styles = comboboxVariants();

  return (
    <ComboboxPrimitive.Chip
      className={mergeBaseUiClassName(styles.chip, className)}
      data-slot="combobox-chip"
      {...props}
    >
      {children}
    </ComboboxPrimitive.Chip>
  );
}

export function ComboboxChipRemove({
  className,
  ...props
}: ComboboxPrimitive.ChipRemove.Props): React.ReactElement {
  const styles = comboboxVariants();

  return (
    <ComboboxPrimitive.ChipRemove
      aria-label="Remove"
      className={mergeBaseUiClassName(styles.chipRemove, className)}
      data-slot="combobox-chip-remove"
      {...props}
    >
      <XIcon />
    </ComboboxPrimitive.ChipRemove>
  );
}

export const useComboboxFilter: typeof ComboboxPrimitive.useFilter =
  ComboboxPrimitive.useFilter;

export { ComboboxPrimitive };

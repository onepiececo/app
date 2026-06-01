"use client";

import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete";
import { ChevronsUpDownIcon, XIcon } from "lucide-react";
import type React from "react";
import { tv } from "tailwind-variants";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mergeBaseUiClassName } from "@/lib/base-ui-class-name";

export const autocompleteVariants = tv({
  slots: {
    inputGroup:
      "relative not-has-[>*.w-full]:w-fit w-full text-foreground has-disabled:opacity-64",
    startAddon:
      "pointer-events-none absolute inset-y-0 start-px z-10 flex items-center ps-[calc(--spacing(3)-1px)] opacity-80 has-[+[data-size=sm]]:ps-[calc(--spacing(2.5)-1px)] [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:-mx-0.5",
    input: "",
    trigger:
      "absolute top-1/2 inline-flex size-8 shrink-0 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md border border-transparent opacity-80 outline-none transition-colors pointer-coarse:after:absolute pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 hover:opacity-100 has-[+[data-slot=autocomplete-clear]]:hidden sm:size-7 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    clear:
      "absolute end-0.5 top-1/2 inline-flex size-8 shrink-0 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md border border-transparent opacity-80 outline-none transition-[color,background-color,box-shadow,opacity] pointer-coarse:after:absolute pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 hover:opacity-100 sm:size-7 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    positioner: "z-50 select-none",
    popup:
      "flex max-h-[min(var(--available-height),23rem)] min-w-(--anchor-width) max-w-(--available-width) origin-(--transform-origin) flex-col rounded-lg bg-popover text-foreground shadow-[0_2px_8px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04)] transition-[scale,opacity] duration-[200ms] ease-[cubic-bezier(0.16,1,0.3,1)] data-ending-style:duration-[140ms] data-ending-style:ease-[cubic-bezier(0.4,0,1,1)] data-starting-style:scale-[0.92] data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 data-instant:transition-none dark:shadow-[0_2px_8px_rgb(0_0_0/0.3),0_1px_2px_rgb(0_0_0/0.2),0_0_0_1px_rgb(255_255_255/0.06)]",
    item: "flex min-h-8 cursor-default select-none items-center gap-2 rounded-md px-2.5 py-1.5 text-base outline-none transition-colors data-disabled:pointer-events-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-64 sm:text-sm [&>svg:not([class*='opacity-'])]:opacity-80 [&>svg:not([class*='size-'])]:size-4 [&>svg]:pointer-events-none [&>svg]:shrink-0",
    separator: "mx-2 my-1 h-px bg-border last:hidden",
    group: "[[role=group]+&]:mt-1.5",
    groupLabel: "px-2 py-1.5 font-medium text-muted-foreground text-xs",
    empty: "not-empty:p-2 text-center text-base text-muted-foreground sm:text-sm",
    row: "",
    list: "not-empty:scroll-py-1 not-empty:p-1 in-data-has-overflow-y:pe-3",
    status:
      "px-3 py-2 font-medium text-muted-foreground text-xs empty:m-0 empty:p-0",
  },
  defaultVariants: {
    size: "md",
    startAddon: false,
    endAction: false,
  },
  variants: {
    size: {
      sm: {
        trigger: "end-0",
        clear: "end-0",
        input:
          "has-[+[data-slot=autocomplete-trigger],+[data-slot=autocomplete-clear]]:*:data-[slot=autocomplete-input]:pe-6.5",
      },
      md: {
        trigger: "end-0.5",
        clear: "end-0.5",
        input:
          "has-[+[data-slot=autocomplete-trigger],+[data-slot=autocomplete-clear]]:*:data-[slot=autocomplete-input]:pe-7",
      },
      lg: {
        trigger: "end-0.5",
        clear: "end-0.5",
        input:
          "has-[+[data-slot=autocomplete-trigger],+[data-slot=autocomplete-clear]]:*:data-[slot=autocomplete-input]:pe-7",
      },
    },
    startAddon: {
      true: {
        input:
          "data-[size=sm]:*:data-[slot=autocomplete-input]:ps-[calc(--spacing(7.5)-1px)] *:data-[slot=autocomplete-input]:ps-[calc(--spacing(8.5)-1px)] sm:data-[size=sm]:*:data-[slot=autocomplete-input]:ps-[calc(--spacing(7)-1px)] sm:*:data-[slot=autocomplete-input]:ps-[calc(--spacing(8)-1px)]",
      },
      false: {},
    },
    endAction: {
      true: {},
      false: {},
    },
  },
});

export const Autocomplete: typeof AutocompletePrimitive.Root =
  AutocompletePrimitive.Root;

export function AutocompleteInput({
  className,
  showTrigger = false,
  showClear = false,
  startAddon,
  size,
  triggerProps,
  clearProps,
  ...props
}: Omit<AutocompletePrimitive.Input.Props, "size"> & {
  showTrigger?: boolean;
  showClear?: boolean;
  startAddon?: React.ReactNode;
  size?: "sm" | "default" | "lg" | number;
  ref?: React.Ref<HTMLInputElement>;
  triggerProps?: AutocompletePrimitive.Trigger.Props;
  clearProps?: AutocompletePrimitive.Clear.Props;
}): React.ReactElement {
  const sizeValue = (size ?? "default") as "sm" | "default" | "lg" | number;
  const sizeVariant = sizeValue === "sm" || sizeValue === "lg" ? sizeValue : "md";
  const styles = autocompleteVariants({
    endAction: showTrigger || showClear,
    size: sizeVariant,
    startAddon: !!startAddon,
  });

  return (
    <AutocompletePrimitive.InputGroup
      className={styles.inputGroup()}
      data-slot="autocomplete-input-group"
    >
      {startAddon && (
        <div
          aria-hidden="true"
          className={styles.startAddon()}
          data-slot="autocomplete-start-addon"
        >
          {startAddon}
        </div>
      )}
      <AutocompletePrimitive.Input
        className={mergeBaseUiClassName(styles.input, className)}
        data-slot="autocomplete-input"
        render={<Input nativeInput size={sizeValue} />}
        {...props}
      />
      {showTrigger && (
        <AutocompleteTrigger
          className={styles.trigger()}
          {...triggerProps}
        >
          <AutocompletePrimitive.Icon data-slot="autocomplete-icon">
            <ChevronsUpDownIcon />
          </AutocompletePrimitive.Icon>
        </AutocompleteTrigger>
      )}
      {showClear && (
        <AutocompleteClear
          className={styles.clear()}
          {...clearProps}
        >
          <XIcon />
        </AutocompleteClear>
      )}
    </AutocompletePrimitive.InputGroup>
  );
}

export function AutocompletePopup({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  alignOffset,
  align = "start",
  anchor,
  portalProps,
  ...props
}: AutocompletePrimitive.Popup.Props & {
  align?: AutocompletePrimitive.Positioner.Props["align"];
  sideOffset?: AutocompletePrimitive.Positioner.Props["sideOffset"];
  alignOffset?: AutocompletePrimitive.Positioner.Props["alignOffset"];
  side?: AutocompletePrimitive.Positioner.Props["side"];
  anchor?: AutocompletePrimitive.Positioner.Props["anchor"];
  portalProps?: AutocompletePrimitive.Portal.Props;
}): React.ReactElement {
  const styles = autocompleteVariants();

  return (
    <AutocompletePrimitive.Portal {...portalProps}>
      <AutocompletePrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className={styles.positioner()}
        data-slot="autocomplete-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <AutocompletePrimitive.Popup
          className={mergeBaseUiClassName(styles.popup, className)}
          data-slot="autocomplete-popup"
          {...props}
        >
          {children}
        </AutocompletePrimitive.Popup>
      </AutocompletePrimitive.Positioner>
    </AutocompletePrimitive.Portal>
  );
}

export function AutocompleteItem({
  className,
  children,
  ...props
}: AutocompletePrimitive.Item.Props): React.ReactElement {
  const styles = autocompleteVariants();

  return (
    <AutocompletePrimitive.Item
      className={mergeBaseUiClassName(styles.item, className)}
      data-slot="autocomplete-item"
      {...props}
    >
      {children}
    </AutocompletePrimitive.Item>
  );
}

export function AutocompleteSeparator({
  className,
  ...props
}: AutocompletePrimitive.Separator.Props): React.ReactElement {
  const styles = autocompleteVariants();

  return (
    <AutocompletePrimitive.Separator
      className={mergeBaseUiClassName(styles.separator, className)}
      data-slot="autocomplete-separator"
      {...props}
    />
  );
}

export function AutocompleteGroup({
  className,
  ...props
}: AutocompletePrimitive.Group.Props): React.ReactElement {
  const styles = autocompleteVariants();

  return (
    <AutocompletePrimitive.Group
      className={mergeBaseUiClassName(styles.group, className)}
      data-slot="autocomplete-group"
      {...props}
    />
  );
}

export function AutocompleteGroupLabel({
  className,
  ...props
}: AutocompletePrimitive.GroupLabel.Props): React.ReactElement {
  const styles = autocompleteVariants();

  return (
    <AutocompletePrimitive.GroupLabel
      className={mergeBaseUiClassName(styles.groupLabel, className)}
      data-slot="autocomplete-group-label"
      {...props}
    />
  );
}

export function AutocompleteEmpty({
  className,
  ...props
}: AutocompletePrimitive.Empty.Props): React.ReactElement {
  const styles = autocompleteVariants();

  return (
    <AutocompletePrimitive.Empty
      className={mergeBaseUiClassName(styles.empty, className)}
      data-slot="autocomplete-empty"
      {...props}
    />
  );
}

export function AutocompleteRow({
  className,
  ...props
}: AutocompletePrimitive.Row.Props): React.ReactElement {
  const styles = autocompleteVariants();

  return (
    <AutocompletePrimitive.Row
      className={mergeBaseUiClassName(styles.row, className)}
      data-slot="autocomplete-row"
      {...props}
    />
  );
}

export function AutocompleteValue({
  ...props
}: AutocompletePrimitive.Value.Props): React.ReactElement {
  return (
    <AutocompletePrimitive.Value data-slot="autocomplete-value" {...props} />
  );
}

export function AutocompleteList({
  className,
  ...props
}: AutocompletePrimitive.List.Props): React.ReactElement {
  const styles = autocompleteVariants();

  return (
    <ScrollArea scrollbarGutter scrollFade>
      <AutocompletePrimitive.List
        className={mergeBaseUiClassName(styles.list, className)}
        data-slot="autocomplete-list"
        {...props}
      />
    </ScrollArea>
  );
}

export function AutocompleteClear({
  className,
  ...props
}: AutocompletePrimitive.Clear.Props): React.ReactElement {
  const styles = autocompleteVariants();

  return (
    <AutocompletePrimitive.Clear
      className={mergeBaseUiClassName(styles.clear, className)}
      data-slot="autocomplete-clear"
      {...props}
    >
      <XIcon />
    </AutocompletePrimitive.Clear>
  );
}

export function AutocompleteStatus({
  className,
  ...props
}: AutocompletePrimitive.Status.Props): React.ReactElement {
  const styles = autocompleteVariants();

  return (
    <AutocompletePrimitive.Status
      className={mergeBaseUiClassName(styles.status, className)}
      data-slot="autocomplete-status"
      {...props}
    />
  );
}

export function AutocompleteCollection({
  ...props
}: AutocompletePrimitive.Collection.Props): React.ReactElement {
  return (
    <AutocompletePrimitive.Collection
      data-slot="autocomplete-collection"
      {...props}
    />
  );
}

export function AutocompleteTrigger({
  className,
  children,
  ...props
}: AutocompletePrimitive.Trigger.Props): React.ReactElement {
  const styles = autocompleteVariants();

  return (
    <AutocompletePrimitive.Trigger
      className={mergeBaseUiClassName(styles.trigger, className)}
      data-slot="autocomplete-trigger"
      {...props}
    >
      {children}
    </AutocompletePrimitive.Trigger>
  );
}

export const useAutocompleteFilter: typeof AutocompletePrimitive.useFilter =
  AutocompletePrimitive.useFilter;

export { AutocompletePrimitive };

"use client";

import { Dialog as CommandDialogPrimitive } from "@base-ui/react/dialog";
import { SearchIcon } from "lucide-react";
import type * as React from "react";
import { tv } from "tailwind-variants";
import {
  Autocomplete,
  AutocompleteCollection,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePrimitive,
  AutocompleteSeparator,
} from "@/components/ui/autocomplete";
import { Kbd } from "@/components/ui/kbd";
import { mergeBaseUiClassName } from "@/lib/base-ui-class-name";

export const commandVariants = tv({
  slots: {
    dialogBackdrop:
      "fixed inset-0 z-50 bg-black/32 backdrop-blur-sm transition-all duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0",
    dialogViewport:
      "fixed inset-0 z-50 flex flex-col items-center px-4 py-[max(--spacing(4),4vh)] sm:py-[10vh]",
    dialogPopup:
      "relative row-start-2 flex max-h-105 min-h-0 w-full min-w-0 max-w-xl -translate-y-[calc(1.25rem*var(--nested-dialogs))] scale-[calc(1-0.1*var(--nested-dialogs))] flex-col overflow-hidden rounded-2xl bg-popover text-popover-foreground opacity-[calc(1-0.1*var(--nested-dialogs))] outline-none transition-[scale,opacity,translate] duration-200 ease-in-out will-change-transform shadow-[0_8px_24px_rgb(0_0_0/0.08),0_2px_8px_rgb(0_0_0/0.05)] data-nested:data-ending-style:translate-y-8 data-nested:data-starting-style:translate-y-8 data-nested-dialog-open:origin-top data-ending-style:scale-98 data-starting-style:scale-98 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:shadow-[0_8px_24px_rgb(0_0_0/0.4),0_2px_8px_rgb(0_0_0/0.3),0_0_0_1px_rgb(255_255_255/0.06)]",
    inputRow: "relative border-b border-border",
    inputIcon:
      "pointer-events-none absolute start-[18px] top-1/2 size-4 -translate-y-1/2 text-muted-foreground",
    input:
      "h-11 w-full bg-transparent ps-12 text-sm text-foreground outline-none placeholder:text-muted-foreground",
    inputWithHint: "pe-14",
    inputWithoutHint: "pe-4",
    hintContainer:
      "pointer-events-none absolute end-3 top-1/2 -translate-y-1/2",
    list: "not-empty:scroll-py-2 not-empty:py-2 not-empty:px-1",
    empty: "not-empty:py-8 not-empty:text-center",
    group: "",
    groupLabel: "px-2.5 py-1 text-xs font-medium text-muted-foreground",
    groupHeader: "flex items-center justify-between gap-2 px-2.5 py-1",
    item: "min-h-8 gap-2.5 rounded-md px-2.5 py-1 text-sm",
    iconChip:
      "inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-background text-foreground shadow-[0_0_0_1px_color-mix(in_srgb,var(--foreground)_24%,var(--background))] inset-shadow-[0_1px_0_rgb(255_255_255/0.3),0_-1px_0_rgb(0_0_0/0.04)] [&>svg]:size-3.5 [&>svg]:opacity-90 dark:bg-transparent dark:shadow-[0_0_0_1px_rgb(0_0_0/0.36)] dark:inset-shadow-[0_1px_0_rgb(255_255_255/0.08),0_-1px_0_rgb(0_0_0/0.12)]",
    separator: "my-1.5",
    shortcut:
      "ms-auto font-medium font-sans text-muted-foreground/72 text-xs tracking-widest",
    hintPill:
      "h-5.5 min-w-5.5 rounded-md bg-transparent px-1.5 text-[11px] font-medium text-muted-foreground shadow-[0_0_0_1px_color-mix(in_srgb,var(--foreground)_14%,var(--background))] dark:bg-transparent dark:shadow-[0_0_0_1px_color-mix(in_srgb,var(--foreground)_22%,var(--background))]",
    footer:
      "flex items-center gap-4 border-t border-border px-4 py-2.5 text-xs text-muted-foreground",
    footerHint: "flex items-center gap-1.5",
  },
});

export const CommandDialog: typeof CommandDialogPrimitive.Root =
  CommandDialogPrimitive.Root;

export const CommandDialogPortal: typeof CommandDialogPrimitive.Portal =
  CommandDialogPrimitive.Portal;

export const CommandCreateHandle: typeof CommandDialogPrimitive.createHandle =
  CommandDialogPrimitive.createHandle;

export function CommandDialogTrigger(
  props: CommandDialogPrimitive.Trigger.Props,
): React.ReactElement {
  return (
    <CommandDialogPrimitive.Trigger
      data-slot="command-dialog-trigger"
      {...props}
    />
  );
}

export function CommandDialogBackdrop({
  className,
  ...props
}: CommandDialogPrimitive.Backdrop.Props): React.ReactElement {
  const styles = commandVariants();

  return (
    <CommandDialogPrimitive.Backdrop
      className={mergeBaseUiClassName(styles.dialogBackdrop, className)}
      data-slot="command-dialog-backdrop"
      {...props}
    />
  );
}

export function CommandDialogViewport({
  className,
  ...props
}: CommandDialogPrimitive.Viewport.Props): React.ReactElement {
  const styles = commandVariants();

  return (
    <CommandDialogPrimitive.Viewport
      className={mergeBaseUiClassName(styles.dialogViewport, className)}
      data-slot="command-dialog-viewport"
      {...props}
    />
  );
}

export function CommandDialogPopup({
  className,
  children,
  portalProps,
  ...props
}: CommandDialogPrimitive.Popup.Props & {
  portalProps?: CommandDialogPrimitive.Portal.Props;
}): React.ReactElement {
  const styles = commandVariants();

  return (
    <CommandDialogPortal {...portalProps}>
      <CommandDialogBackdrop />
      <CommandDialogViewport>
        <CommandDialogPrimitive.Popup
          className={mergeBaseUiClassName(styles.dialogPopup, className)}
          data-slot="command-dialog-popup"
          {...props}
        >
          {children}
        </CommandDialogPrimitive.Popup>
      </CommandDialogViewport>
    </CommandDialogPortal>
  );
}

export function Command({
  autoHighlight = "always",
  keepHighlight = true,
  ...props
}: React.ComponentProps<typeof Autocomplete>): React.ReactElement {
  return (
    <Autocomplete
      autoHighlight={autoHighlight}
      inline
      keepHighlight={keepHighlight}
      open
      {...props}
    />
  );
}

export function CommandInput({
  className,
  hint = "⌘/",
  placeholder = "Type a command or search",
  ...props
}: Omit<AutocompletePrimitive.Input.Props, "size"> & {
  hint?: React.ReactNode | null;
}): React.ReactElement {
  const styles = commandVariants();

  return (
    <div className={styles.inputRow()} data-slot="command-input-row">
      <SearchIcon className={styles.inputIcon()} />
      <AutocompletePrimitive.Input
        autoFocus
        className={mergeBaseUiClassName(
          (options) =>
            styles.input({
              class: `${hint ? styles.inputWithHint() : styles.inputWithoutHint()} ${options?.class ?? ""}`,
            }),
          className,
        )}
        data-slot="command-input"
        placeholder={placeholder}
        {...props}
      />
      {hint ? (
        <div className={styles.hintContainer()}>
          <CommandHintPill>{hint}</CommandHintPill>
        </div>
      ) : null}
    </div>
  );
}

export function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteList>): React.ReactElement {
  const styles = commandVariants();

  return (
    <AutocompleteList
      className={mergeBaseUiClassName(styles.list, className)}
      data-slot="command-list"
      {...props}
    />
  );
}

export function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteEmpty>): React.ReactElement {
  const styles = commandVariants();

  return (
    <AutocompleteEmpty
      className={mergeBaseUiClassName(styles.empty, className)}
      data-slot="command-empty"
      {...props}
    />
  );
}

export function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteGroup>): React.ReactElement {
  const styles = commandVariants();

  return (
    <AutocompleteGroup
      className={mergeBaseUiClassName(styles.group, className)}
      data-slot="command-group"
      {...props}
    />
  );
}

export function CommandGroupLabel({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteGroupLabel>): React.ReactElement {
  const styles = commandVariants();

  return (
    <AutocompleteGroupLabel
      className={mergeBaseUiClassName(styles.groupLabel, className)}
      data-slot="command-group-label"
      {...props}
    />
  );
}

export function CommandGroupHeader({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  const styles = commandVariants();

  return (
    <div
      className={styles.groupHeader({ class: className })}
      data-slot="command-group-header"
      {...props}
    />
  );
}

export function CommandCollection({
  ...props
}: React.ComponentProps<typeof AutocompleteCollection>): React.ReactElement {
  return <AutocompleteCollection data-slot="command-collection" {...props} />;
}

export function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteItem>): React.ReactElement {
  const styles = commandVariants();

  return (
    <AutocompleteItem
      className={mergeBaseUiClassName(styles.item, className)}
      data-slot="command-item"
      {...props}
    />
  );
}

export function CommandIconChip({
  className,
  ...props
}: React.ComponentProps<"span">): React.ReactElement {
  const styles = commandVariants();

  return (
    <span
      className={styles.iconChip({ class: className })}
      data-slot="command-icon-chip"
      {...props}
    />
  );
}

export function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteSeparator>): React.ReactElement {
  const styles = commandVariants();

  return (
    <AutocompleteSeparator
      className={mergeBaseUiClassName(styles.separator, className)}
      data-slot="command-separator"
      {...props}
    />
  );
}

export function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"kbd">): React.ReactElement {
  const styles = commandVariants();

  return (
    <kbd
      className={styles.shortcut({ class: className })}
      data-slot="command-shortcut"
      {...props}
    />
  );
}

export function CommandHintPill({
  className,
  ...props
}: React.ComponentProps<typeof Kbd>): React.ReactElement {
  const styles = commandVariants();

  return (
    <Kbd
      className={styles.hintPill({ class: className })}
      data-slot="command-hint-pill"
      {...props}
    />
  );
}

export function CommandFooter({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  const styles = commandVariants();

  return (
    <div
      className={styles.footer({ class: className })}
      data-slot="command-footer"
      {...props}
    />
  );
}

export function CommandFooterHint({
  kbd,
  children,
  className,
  ...props
}: React.ComponentProps<"span"> & {
  kbd: React.ReactNode;
}): React.ReactElement {
  const styles = commandVariants();

  return (
    <span
      className={styles.footerHint({ class: className })}
      data-slot="command-footer-hint"
      {...props}
    >
      <CommandHintPill>{kbd}</CommandHintPill>
      {children}
    </span>
  );
}

export { CommandDialogPrimitive };

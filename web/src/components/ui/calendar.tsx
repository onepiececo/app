"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
} from "lucide-react";
import type * as React from "react";
import { DayPicker } from "react-day-picker";
import { tv } from "tailwind-variants";
import { inputSurfaceVariants } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const calendarVariants = tv({
  slots: {
    root: "w-fit [--cell-size:--spacing(10)] sm:[--cell-size:--spacing(9)]",
    button:
      "relative flex size-(--cell-size) text-base sm:text-sm items-center justify-center rounded-lg text-foreground outline-none transition-[background-color,color,box-shadow,transform] duration-[120ms] ease-out not-in-data-selected:hover:bg-accent disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    captionLabel: "text-base sm:text-sm font-medium flex items-center gap-2 h-full",
    day: "size-(--cell-size) text-sm py-px",
    dayButton:
      "in-data-disabled:pointer-events-none in-[.range-middle]:rounded-none in-[.range-end:not(.range-start)]:rounded-s-none in-[.range-start:not(.range-end)]:rounded-e-none in-[.range-middle]:in-data-selected:bg-accent in-[.range-middle]:in-data-selected:text-foreground in-data-disabled:text-muted-foreground/72 in-data-outside:text-muted-foreground/72 in-data-selected:in-data-outside:text-primary-foreground in-data-selected:text-primary-foreground in-data-disabled:line-through in-[[data-selected]:not(.range-middle)]:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_92%,white),var(--primary))] in-[[data-selected]:not(.range-middle)]:shadow-[0_0_0_1px_color-mix(in_srgb,var(--primary)_54%,black),0_2px_4px_color-mix(in_srgb,var(--primary)_24%,transparent)] in-[[data-selected]:not(.range-middle)]:inset-shadow-[0_1px_0_rgb(255_255_255/0.28),0_-1px_0_rgb(0_0_0/0.18)] dark:in-[[data-selected]:not(.range-middle)]:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary-foreground)_88%,black),color-mix(in_srgb,var(--primary-foreground)_72%,black))] dark:in-[[data-selected]:not(.range-middle)]:shadow-[0_0_0_1px_rgb(255_255_255/0.15),0_2px_6px_rgb(0_0_0/0.46)] dark:in-[[data-selected]:not(.range-middle)]:inset-shadow-[0_1px_0_rgb(255_255_255/0.2),0_-1px_0_rgb(0_0_0/0.3)] focus-visible:z-1 focus-visible:shadow-[0_0_0_1px_var(--ring),0_0_0_3px_color-mix(in_srgb,var(--ring)_24%,transparent)] dark:focus-visible:shadow-[0_0_0_1px_var(--ring),0_0_0_3px_color-mix(in_srgb,var(--ring)_28%,transparent)]",
    dropdown: "absolute inset-0 bg-transparent opacity-0",
    dropdownRoot:
      "h-9 w-fit items-center px-[calc(--spacing(3)-1px)] has-[select:focus-visible]:shadow-[0_0_0_1px_var(--ring),0_0_0_3px_color-mix(in_srgb,var(--ring)_24%,transparent),0_1px_2px_rgb(0_0_0/0.05)] sm:h-8 dark:has-[select:focus-visible]:shadow-[0_0_0_1px_var(--ring),0_0_0_3px_color-mix(in_srgb,var(--ring)_26%,transparent)] [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:-me-1",
    dropdowns:
      "w-full flex items-center text-base sm:text-sm justify-center h-(--cell-size) gap-1.5 *:[span]:font-medium",
    hidden: "invisible",
    month: "w-full",
    monthCaption:
      "relative mx-(--cell-size) px-1 mb-1 flex h-(--cell-size) items-center justify-center z-2",
    months: "relative flex flex-col sm:flex-row gap-2",
    nav: "absolute top-0 flex w-full justify-between z-1",
    outside: "text-muted-foreground data-selected:bg-accent/50 data-selected:text-muted-foreground",
    today:
      "*:after:pointer-events-none *:after:absolute *:after:bottom-1 *:after:start-1/2 *:after:z-1 *:after:size-[3px] *:after:-translate-x-1/2 *:after:rounded-full *:after:bg-primary [&[data-selected]:not(.range-middle)>*]:after:bg-background [&[data-disabled]>*]:after:bg-foreground/30 *:after:transition-colors",
    weekNumber: "size-(--cell-size) p-0 text-xs font-medium text-muted-foreground/72",
    weekday: "size-(--cell-size) p-0 text-xs font-medium text-muted-foreground/72",
  },
});

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components: userComponents,
  mode = "single",
  ...props
}: React.ComponentProps<typeof DayPicker>): React.ReactElement {
  const styles = calendarVariants();
  const buttonClassNames = styles.button();
  const defaultClassNames = {
    button_next: buttonClassNames,
    button_previous: buttonClassNames,
    caption_label: styles.captionLabel(),
    day: styles.day(),
    day_button: cn(
      buttonClassNames,
      styles.dayButton(),
    ),
    dropdown: styles.dropdown(),
    dropdown_root: cn(inputSurfaceVariants({ layout: "inline" }), styles.dropdownRoot()),
    dropdowns: styles.dropdowns(),
    hidden: styles.hidden(),
    month: styles.month(),
    month_caption: styles.monthCaption(),
    months: styles.months(),
    nav: styles.nav(),
    outside: styles.outside(),
    range_end: "range-end",
    range_middle: "range-middle",
    range_start: "range-start",
    today: styles.today(),
    week_number: styles.weekNumber(),
    weekday: styles.weekday(),
  };
  const mergedClassNames: typeof defaultClassNames = Object.keys(
    defaultClassNames,
  ).reduce(
    (acc, key) => {
      const userClass = classNames?.[key as keyof typeof classNames];
      const baseClass =
        defaultClassNames[key as keyof typeof defaultClassNames];

      acc[key as keyof typeof defaultClassNames] = userClass
        ? cn(baseClass, userClass)
        : baseClass;

      return acc;
    },
    { ...defaultClassNames } as typeof defaultClassNames,
  );

  const defaultComponents = {
    Chevron: ({
      className,
      orientation,
      ...props
    }: {
      className?: string;
      orientation?: "left" | "right" | "up" | "down";
    }): React.ReactElement => {
      if (orientation === "left") {
        return (
          <ChevronLeftIcon
            className={cn(className, "rtl:rotate-180")}
            {...props}
            aria-hidden="true"
          />
        );
      }

      if (orientation === "right") {
        return (
          <ChevronRightIcon
            className={cn(className, "rtl:rotate-180")}
            {...props}
            aria-hidden="true"
          />
        );
      }

      return (
        <ChevronsUpDownIcon
          className={className}
          {...props}
          aria-hidden="true"
        />
      );
    },
  };

  const mergedComponents = {
    ...defaultComponents,
    ...userComponents,
  };

  const dayPickerProps = {
    className: styles.root({ class: className }),
    classNames: mergedClassNames,
    components: mergedComponents,
    "data-slot": "calendar",
    formatters: {
      formatMonthDropdown: (date: Date) =>
        date.toLocaleString("default", { month: "short" }),
    } as React.ComponentProps<typeof DayPicker>["formatters"],
    mode,
    showOutsideDays,
    ...props,
  };

  return (
    <DayPicker
      {...(dayPickerProps as React.ComponentProps<typeof DayPicker>)}
    />
  );
}

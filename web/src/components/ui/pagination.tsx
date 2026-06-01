"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { MoreHorizontalIcon } from "lucide-react";
import type * as React from "react";
import { tv } from "tailwind-variants";
import { type Button, buttonVariants } from "@/components/ui/button";

export const paginationVariants = tv({
  slots: {
    root: "mx-auto flex w-full justify-center",
    content: "flex flex-row items-center gap-1",
    status: "text-sm text-muted-foreground tabular-nums",
    statusNumber: "font-medium text-foreground",
    ellipsis: "flex min-w-7 justify-center",
    ellipsisIcon: "size-5 sm:size-4",
  },
  variants: {
    layout: {
      row: {},
      spread: {
        content:
          "grid w-full grid-cols-[1fr_auto_1fr] items-center [&>li:first-child]:justify-self-start [&>li:last-child]:justify-self-end",
      },
    },
  },
  defaultVariants: {
    layout: "row",
  },
});

const paginationStyles = paginationVariants();

export const Pagination = ({
  className,
  ...props
}: React.ComponentProps<"nav">): React.ReactElement => {
  return (
    <nav
      aria-label="pagination"
      className={paginationStyles.root({ class: className })}
      data-slot="pagination"
      {...props}
    />
  );
};

export const PaginationContent = ({
  className,
  layout = "row",
  ...props
}: React.ComponentProps<"ul"> & {
  /**
   * `row` (default) — flex row, items pack from the start. Use for the
   * **Numbered** pattern.
   * `spread` — full-width 3-column grid (`1fr_auto_1fr`). First item lands
   * left, middle item is true-centered, last item lands right. Use for the
   * **Status** pattern (Previous · Page X of Y · Next) — the grid keeps the
   * status text centered regardless of Previous / Next button widths.
   */
  layout?: "row" | "spread";
}): React.ReactElement => {
  const styles = paginationVariants({ layout });

  return (
    <ul
      className={styles.content({ class: className })}
      data-slot="pagination-content"
      data-layout={layout}
      {...props}
    />
  );
};

export const PaginationItem = ({
  ...props
}: React.ComponentProps<"li">): React.ReactElement => {
  return <li data-slot="pagination-item" {...props} />;
};

export type PaginationLinkProps = {
  isActive?: boolean;
  size?: React.ComponentProps<typeof Button>["size"];
} & useRender.ComponentProps<"a">;

export const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  render,
  ...props
}: PaginationLinkProps): React.ReactElement => {
  const defaultProps = {
    "aria-current": isActive ? ("page" as const) : undefined,
    className: buttonVariants({
      class: className,
      size,
      variant: isActive ? "outline" : "ghost",
    }),
    "data-active": isActive,
    "data-slot": "pagination-link",
  };

  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(defaultProps, props),
    render,
  });
};

export const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>): React.ReactElement => {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      className={className}
      size="default"
      {...props}
    >
      Previous
    </PaginationLink>
  );
};

export const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>): React.ReactElement => {
  return (
    <PaginationLink
      aria-label="Go to next page"
      className={className}
      size="default"
      {...props}
    >
      Next
    </PaginationLink>
  );
};

export const PaginationStatus = ({
  className,
  current,
  total,
  ...props
}: React.ComponentProps<"span"> & {
  current: number;
  total: number;
}): React.ReactElement => {
  return (
    <span
      className={paginationStyles.status({ class: className })}
      data-slot="pagination-status"
      {...props}
    >
      Page <span className={paginationStyles.statusNumber()}>{current}</span>{" "}
      of <span className={paginationStyles.statusNumber()}>{total}</span>
    </span>
  );
};

export const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">): React.ReactElement => {
  return (
    <span
      aria-hidden
      className={paginationStyles.ellipsis({ class: className })}
      data-slot="pagination-ellipsis"
      {...props}
    >
      <MoreHorizontalIcon className={paginationStyles.ellipsisIcon()} />
      <span className="sr-only">More pages</span>
    </span>
  );
};

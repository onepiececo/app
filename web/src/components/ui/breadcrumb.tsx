"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";
import type * as React from "react";
import { tv } from "tailwind-variants";

export const breadcrumbVariants = tv({
  slots: {
    list: "flex flex-wrap items-center gap-y-2 gap-x-1 text-sm",
    item: "flex items-center gap-x-1.5",
    link: "rounded-md px-1 py-0.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground [&>svg]:size-5 [&>svg]:shrink-0",
    page: "rounded-md px-1 py-0.5 text-sm font-semibold text-foreground [&>svg]:size-5 [&>svg]:shrink-0",
    separator:
      "inline-flex shrink-0 items-center text-muted-foreground/55 [&>svg]:size-4 [&>svg]:shrink-0",
    slashSeparator: "text-muted-foreground/55",
    ellipsis:
      "flex h-5 shrink-0 items-center justify-center text-muted-foreground",
  },
});

export function Breadcrumb({
  ...props
}: React.ComponentProps<"nav">): React.ReactElement {
  return <nav aria-label="Breadcrumb" data-slot="breadcrumb" {...props} />;
}

export function BreadcrumbList({
  className,
  ...props
}: React.ComponentProps<"ol">): React.ReactElement {
  const { list } = breadcrumbVariants();

  return (
    <ol
      role="list"
      className={list({ class: className })}
      data-slot="breadcrumb-list"
      {...props}
    />
  );
}

export function BreadcrumbItem({
  className,
  ...props
}: React.ComponentProps<"li">): React.ReactElement {
  const { item } = breadcrumbVariants();

  return (
    <li
      className={item({ class: className })}
      data-slot="breadcrumb-item"
      {...props}
    />
  );
}

export function BreadcrumbLink({
  className,
  render,
  ...props
}: useRender.ComponentProps<"a">): React.ReactElement {
  const { link } = breadcrumbVariants();
  const defaultProps = {
    className: link({ class: className }),
    "data-slot": "breadcrumb-link",
  };

  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(defaultProps, props),
    render,
  });
}

export function BreadcrumbPage({
  className,
  ...props
}: React.ComponentProps<"span">): React.ReactElement {
  const { page } = breadcrumbVariants();

  return (
    <span
      aria-current="page"
      className={page({ class: className })}
      data-slot="breadcrumb-page"
      {...props}
    />
  );
}

export function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"span">): React.ReactElement {
  const { separator } = breadcrumbVariants();

  return (
    <span
      aria-hidden="true"
      role="presentation"
      className={separator({ class: className })}
      data-slot="breadcrumb-separator"
      {...props}
    >
      {children ?? <ChevronRightIcon />}
    </span>
  );
}

export function BreadcrumbSlashSeparator({
  className,
  ...props
}: React.ComponentProps<"span">): React.ReactElement {
  const { slashSeparator } = breadcrumbVariants();

  return (
    <BreadcrumbSeparator
      className={slashSeparator({ class: className })}
      {...props}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="size-5 shrink-0"
      >
        <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
      </svg>
    </BreadcrumbSeparator>
  );
}

export function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">): React.ReactElement {
  const { ellipsis } = breadcrumbVariants();

  return (
    <span
      aria-hidden="true"
      role="presentation"
      className={ellipsis({ class: className })}
      data-slot="breadcrumb-ellipsis"
      {...props}
    >
      <MoreHorizontalIcon className="size-4 shrink-0" />
      <span className="sr-only">More</span>
    </span>
  );
}

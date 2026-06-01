import type * as React from "react";
import { tv } from "tailwind-variants";

export const emptyVariants = tv({
  slots: {
    root: "flex min-w-0 flex-col items-center justify-center gap-4 text-balance px-6 py-12 text-center md:py-16",
    media: "flex shrink-0 items-center justify-center pb-2",
    title: "font-heading font-semibold text-lg",
    description: "max-w-sm text-muted-foreground text-sm",
    actions: "flex flex-wrap items-center justify-center gap-2 pt-2",
  },
});

export const Empty = (props: React.ComponentProps<"div">) => {
  const { root } = emptyVariants();

  return (
    <div
      data-slot="empty"
      {...props}
      className={root({ class: props.className })}
    />
  );
};

export const EmptyMedia = (props: React.ComponentProps<"div">) => {
  const { media } = emptyVariants();

  return (
    <div
      data-slot="empty-media"
      {...props}
      className={media({ class: props.className })}
    />
  );
};

export const EmptyTitle = (props: React.ComponentProps<"div">) => {
  const { title } = emptyVariants();

  return (
    <div
      data-slot="empty-title"
      {...props}
      className={title({ class: props.className })}
    />
  );
};

export const EmptyDescription = (props: React.ComponentProps<"p">) => {
  const { description } = emptyVariants();

  return (
    <p
      data-slot="empty-description"
      {...props}
      className={description({ class: props.className })}
    />
  );
};

export const EmptyActions = (props: React.ComponentProps<"div">) => {
  const { actions } = emptyVariants();

  return (
    <div
      data-slot="empty-actions"
      {...props}
      className={actions({ class: props.className })}
    />
  );
};

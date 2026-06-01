"use client";

import { Input as InputPrimitive } from "@base-ui/react/input";
import type * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";

const controlSurfaceBase =
  "relative rounded-lg bg-white text-base text-foreground outline-none transition-shadow shadow-[0_0_0_1px_rgb(9_9_11/0.1),0_1px_2px_rgb(0_0_0/0.05)] hover:shadow-[0_0_0_1px_rgb(9_9_11/0.2),0_1px_2px_rgb(0_0_0/0.05)] sm:text-sm dark:bg-white/5 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)] dark:hover:bg-white/5 dark:hover:shadow-[0_0_0_1px_rgb(255_255_255/0.2)]";

const controlSurfaceFocus =
  "has-[input:focus-visible,textarea:focus-visible]:shadow-[0_0_0_1px_var(--ring),0_0_0_3px_color-mix(in_srgb,var(--ring)_24%,transparent),0_1px_2px_rgb(0_0_0/0.05)] focus-visible:shadow-[0_0_0_1px_var(--ring),0_0_0_3px_color-mix(in_srgb,var(--ring)_24%,transparent),0_1px_2px_rgb(0_0_0/0.05)] data-pressed:shadow-[0_0_0_1px_var(--ring),0_0_0_3px_color-mix(in_srgb,var(--ring)_24%,transparent),0_1px_2px_rgb(0_0_0/0.05)] dark:has-[input:focus-visible,textarea:focus-visible]:shadow-[0_0_0_1px_var(--ring),0_0_0_3px_color-mix(in_srgb,var(--ring)_26%,transparent)] dark:focus-visible:shadow-[0_0_0_1px_var(--ring),0_0_0_3px_color-mix(in_srgb,var(--ring)_26%,transparent)] dark:data-pressed:shadow-[0_0_0_1px_var(--ring),0_0_0_3px_color-mix(in_srgb,var(--ring)_26%,transparent)]";

const controlSurfaceInvalid =
  "has-[input[aria-invalid],textarea[aria-invalid]]:bg-[color-mix(in_srgb,var(--destructive)_7%,white)] has-[input[aria-invalid],textarea[aria-invalid]]:text-destructive has-[input[aria-invalid],textarea[aria-invalid]]:shadow-[0_0_0_1px_var(--destructive),0_0_0_3px_color-mix(in_srgb,var(--destructive)_18%,transparent),0_1px_2px_rgb(0_0_0/0.05)] aria-invalid:bg-[color-mix(in_srgb,var(--destructive)_7%,white)] aria-invalid:text-destructive aria-invalid:shadow-[0_0_0_1px_var(--destructive),0_0_0_3px_color-mix(in_srgb,var(--destructive)_18%,transparent),0_1px_2px_rgb(0_0_0/0.05)] dark:has-[input[aria-invalid],textarea[aria-invalid]]:bg-[color-mix(in_srgb,var(--destructive)_14%,var(--background))] dark:has-[input[aria-invalid],textarea[aria-invalid]]:text-red-200 dark:has-[input[aria-invalid],textarea[aria-invalid]]:shadow-[0_0_0_1px_var(--destructive),0_0_0_3px_color-mix(in_srgb,var(--destructive)_24%,transparent)] dark:aria-invalid:bg-[color-mix(in_srgb,var(--destructive)_14%,var(--background))] dark:aria-invalid:text-red-200 dark:aria-invalid:shadow-[0_0_0_1px_var(--destructive),0_0_0_3px_color-mix(in_srgb,var(--destructive)_24%,transparent)]";

const controlSurfaceDisabled =
  "has-[input:disabled,textarea:disabled]:opacity-50 has-[input:disabled,textarea:disabled]:shadow-[0_0_0_1px_rgb(9_9_11/0.2)] disabled:opacity-50 data-disabled:opacity-50 data-disabled:pointer-events-none dark:has-[input:disabled,textarea:disabled]:bg-white/2.5 dark:has-[input:disabled,textarea:disabled]:shadow-[0_0_0_1px_rgb(255_255_255/0.15)]";

/**
 * Shared surface recipe for input-shaped controls. The root wrapper owns
 * focus, invalid, and disabled chrome; the Base UI input stays the inner part.
 */
export const inputSurfaceVariants = tv({
  base: [
    controlSurfaceBase,
    controlSurfaceFocus,
    controlSurfaceInvalid,
    controlSurfaceDisabled,
    "has-autofill:bg-foreground/8 dark:has-autofill:bg-foreground/8",
  ],
  variants: {
    layout: {
      inline: "inline-flex w-full",
      block: "block w-full",
    },
  },
  defaultVariants: {
    layout: "inline",
  },
});

export const inputInnerVariants = tv({
  base: "h-8.5 w-full min-w-0 rounded-[inherit] px-[calc(--spacing(3)-1px)] leading-8.5 outline-none [transition:background-color_5000000s_ease-in-out_0s] placeholder:text-muted-foreground/72 sm:h-7.5 sm:leading-7.5",
  variants: {
    size: {
      default: "",
      sm: "h-7.5 px-[calc(--spacing(2.5)-1px)] leading-7.5 sm:h-6.5 sm:leading-6.5",
      lg: "h-9.5 leading-9.5 sm:h-8.5 sm:leading-8.5",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export const inputGroupVariants = tv({
  slots: {
    root: [
      inputSurfaceVariants({ layout: "inline" }),
      "min-w-0 items-center has-[textarea]:h-auto has-data-[align=block-end]:h-auto has-data-[align=block-start]:h-auto has-data-[align=block-end]:flex-col has-data-[align=block-start]:flex-col *:[[data-slot=input-control],[data-slot=textarea-control]]:contents *:[[data-slot=input-control],[data-slot=textarea-control]]:before:hidden has-[[data-align=block-start],[data-align=block-end]]:**:[input]:h-auto has-data-[align=inline-start]:**:[input]:ps-2 has-data-[align=inline-end]:**:[input]:pe-2 has-data-[align=block-end]:**:[input]:pt-1.5 has-data-[align=block-start]:**:[input]:pb-1.5 has-data-[align=inline-start]:**:[[data-size=sm]_input]:ps-1.5 has-data-[align=inline-end]:**:[[data-size=sm]_input]:pe-1.5 **:[textarea]:min-h-20.5 **:[textarea]:resize-none **:[textarea]:py-[calc(--spacing(3)-1px)] **:[textarea]:max-sm:min-h-23.5 **:[textarea_button]:rounded-[calc(var(--radius-md)-1px)]",
    ],
    addon:
      "flex h-auto cursor-text select-none items-center justify-center gap-2 leading-none [&>kbd]:rounded-[calc(var(--radius)-5px)] in-[[data-slot=input-group]:has([data-slot=input-control],[data-slot=textarea-control])]:[&_svg:not([class*='size-'])]:size-4.5 sm:in-[[data-slot=input-group]:has([data-slot=input-control],[data-slot=textarea-control])]:[&_svg:not([class*='size-'])]:size-4 [&_svg]:-mx-0.5 not-has-[button]:**:[svg:not([class*='opacity-'])]:opacity-80",
    text: "line-clamp-1 flex items-center gap-2 whitespace-nowrap text-muted-foreground leading-none in-[[data-slot=input-group]:has([data-slot=input-control],[data-slot=textarea-control])]:[&_svg:not([class*='size-'])]:size-4.5 sm:in-[[data-slot=input-group]:has([data-slot=input-control],[data-slot=textarea-control])]:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:-mx-0.5",
  },
  variants: {
    align: {
      "block-end": {
        addon:
          "order-last w-full justify-start px-[calc(--spacing(3)-1px)] pb-[calc(--spacing(3)-1px)] [.border-t]:pt-[calc(--spacing(3)-1px)] [[data-size=sm]+&]:px-[calc(--spacing(2.5)-1px)]",
      },
      "block-start": {
        addon:
          "order-first w-full justify-start px-[calc(--spacing(3)-1px)] pt-[calc(--spacing(3)-1px)] [.border-b]:pb-[calc(--spacing(3)-1px)] [[data-size=sm]+&]:px-[calc(--spacing(2.5)-1px)]",
      },
      "inline-end": {
        addon:
          "order-last pe-[calc(--spacing(3)-1px)] has-[>:last-child[data-slot=badge]]:-me-1.5 has-[>button]:-me-2 has-[>kbd:last-child]:me-[-0.35rem] [[data-size=sm]+&]:pe-[calc(--spacing(2.5)-1px)]",
      },
      "inline-start": {
        addon:
          "order-first ps-[calc(--spacing(3)-1px)] has-[>:last-child[data-slot=badge]]:-ms-1.5 has-[>button]:-ms-2 has-[>kbd:last-child]:ms-[-0.35rem] [[data-size=sm]+&]:ps-[calc(--spacing(2.5)-1px)]",
      },
    },
  },
  defaultVariants: {
    align: "inline-start",
  },
});

export type InputProps = Omit<
  InputPrimitive.Props & React.RefAttributes<HTMLInputElement>,
  "className" | "size"
> & {
  className?: string;
  size?: "sm" | "default" | "lg" | number;
  unstyled?: boolean;
  /**
   * Render a raw `<input>` instead of Base UI's InputPrimitive. Use this when
   * another Base UI primitive owns input behavior through `render`.
   */
  nativeInput?: boolean;
};

export function Input({
  className,
  size = "default",
  unstyled = false,
  nativeInput = false,
  ...props
}: InputProps): React.ReactElement {
  const sizeVariant = size === "sm" || size === "lg" ? size : "default";
  const inputSize = typeof size === "number" ? size : undefined;
  const inputClassName = inputInnerVariants({
    size: sizeVariant,
    class: [
      props.type === "search" &&
        "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none",
      props.type === "file" &&
        "text-muted-foreground file:me-3 file:bg-transparent file:font-medium file:text-foreground file:text-sm",
    ],
  });

  if (nativeInput) {
    const { style, ...nativeProps } = props;

    return (
      <span
        className={
          unstyled
            ? className
            : inputSurfaceVariants({ layout: "inline", class: className })
        }
        data-size={size}
        data-slot="input-control"
      >
        <input
          className={inputClassName}
          data-slot="input"
          size={inputSize}
          style={typeof style === "function" ? undefined : style}
          {...nativeProps}
        />
      </span>
    );
  }

  return (
    <span
      className={
        unstyled
          ? className
          : inputSurfaceVariants({ layout: "inline", class: className })
      }
      data-size={size}
      data-slot="input-control"
    >
      <InputPrimitive
        className={inputClassName}
        data-slot="input"
        size={inputSize}
        {...props}
      />
    </span>
  );
}

export function InputGroup({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  const styles = inputGroupVariants();

  return (
    <div
      className={styles.root({ class: className })}
      data-slot="input-group"
      role="group"
      {...props}
    />
  );
}

export function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof inputGroupVariants>): React.ReactElement {
  const styles = inputGroupVariants({ align });

  return (
    <div
      className={styles.addon({ class: className })}
      data-align={align}
      data-slot="input-group-addon"
      {...props}
    />
  );
}

export function InputGroupText({
  className,
  ...props
}: React.ComponentProps<"span">): React.ReactElement {
  const styles = inputGroupVariants();

  return (
    <span
      className={styles.text({ class: className })}
      {...props}
    />
  );
}

export { InputPrimitive };

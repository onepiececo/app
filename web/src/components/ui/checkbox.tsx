"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { CheckboxGroup as CheckboxGroupPrimitive } from "@base-ui/react/checkbox-group";
import { CheckIcon, MinusIcon } from "lucide-react";
import type React from "react";
import { tv } from "tailwind-variants";
import { mergeBaseUiClassName } from "@/lib/base-ui-class-name";

export const checkboxVariants = tv({
  slots: {
    root: [
      "group/checkbox relative inline-flex size-4.5 shrink-0 items-center justify-center rounded-[0.3rem] outline-none transition-[background-color,box-shadow,transform] duration-[120ms] ease-out active:not-data-disabled:scale-[.92] data-disabled:cursor-not-allowed data-disabled:opacity-50 sm:size-4",
      "bg-background shadow-[0_0_0_1px_color-mix(in_srgb,var(--foreground)_32%,var(--background)),0_1px_2px_rgb(0_0_0/0.06)] hover:not-data-checked:not-data-indeterminate:shadow-[0_0_0_1px_color-mix(in_srgb,var(--foreground)_44%,var(--background)),0_1px_2px_rgb(0_0_0/0.08)] dark:bg-[color-mix(in_srgb,var(--foreground)_5%,var(--background))] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.35)] dark:hover:not-data-checked:not-data-indeterminate:shadow-[0_0_0_1px_rgb(255_255_255/0.22),0_1px_2px_rgb(0_0_0/0.35)]",
      "data-checked:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_92%,white),var(--primary))] data-checked:shadow-[0_0_0_1px_color-mix(in_srgb,var(--primary)_48%,black),0_1px_2px_color-mix(in_srgb,var(--primary)_20%,transparent)] data-checked:inset-shadow-[0_1px_0_rgb(255_255_255/0.28),0_-1px_0_rgb(0_0_0/0.12)]",
      "data-indeterminate:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_92%,white),var(--primary))] data-indeterminate:shadow-[0_0_0_1px_color-mix(in_srgb,var(--primary)_48%,black),0_1px_2px_color-mix(in_srgb,var(--primary)_20%,transparent)] data-indeterminate:inset-shadow-[0_1px_0_rgb(255_255_255/0.28),0_-1px_0_rgb(0_0_0/0.12)]",
      "dark:data-checked:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary-foreground)_88%,black),color-mix(in_srgb,var(--primary-foreground)_72%,black))] dark:data-checked:shadow-[0_0_0_1px_rgb(255_255_255/0.15),0_1px_2px_rgb(0_0_0/0.46)]",
      "dark:data-indeterminate:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary-foreground)_88%,black),color-mix(in_srgb,var(--primary-foreground)_72%,black))] dark:data-indeterminate:shadow-[0_0_0_1px_rgb(255_255_255/0.15),0_1px_2px_rgb(0_0_0/0.46)]",
      "focus-visible:shadow-[0_0_0_1px_var(--ring),0_0_0_3px_color-mix(in_srgb,var(--ring)_24%,transparent)] focus-visible:inset-shadow-none dark:focus-visible:shadow-[0_0_0_1px_var(--ring),0_0_0_3px_color-mix(in_srgb,var(--ring)_28%,transparent)]",
      "aria-invalid:shadow-[0_0_0_1px_var(--destructive),0_0_0_3px_color-mix(in_srgb,var(--destructive)_18%,transparent)] focus-visible:aria-invalid:shadow-[0_0_0_1px_var(--destructive),0_0_0_3px_color-mix(in_srgb,var(--destructive)_22%,transparent)] dark:aria-invalid:shadow-[0_0_0_1px_var(--destructive),0_0_0_3px_color-mix(in_srgb,var(--destructive)_24%,transparent)]",
    ],
    indicator:
      "pointer-events-none absolute inset-0 flex items-center justify-center text-primary-foreground transition-[opacity,transform] duration-[140ms] ease-out opacity-0 scale-75 group-data-checked/checkbox:opacity-100 group-data-checked/checkbox:scale-100 group-data-indeterminate/checkbox:opacity-100 group-data-indeterminate/checkbox:scale-100 dark:text-white",
    icon: "size-3.5 sm:size-3",
    group: "flex flex-col items-start gap-3",
  },
});

export function Checkbox({
  className,
  ...props
}: CheckboxPrimitive.Root.Props): React.ReactElement {
  const styles = checkboxVariants();

  return (
    <CheckboxPrimitive.Root
      className={mergeBaseUiClassName(styles.root, className)}
      data-slot="checkbox"
      {...props}
    >
      <CheckboxPrimitive.Indicator
        keepMounted
        className={styles.indicator()}
        data-slot="checkbox-indicator"
        render={(
          props: React.ComponentProps<"span">,
          state: CheckboxPrimitive.Indicator.State,
        ) => (
          <span {...props}>
            {state.indeterminate ? (
              <MinusIcon aria-hidden className={styles.icon()} strokeWidth={3} />
            ) : (
              <CheckIcon aria-hidden className={styles.icon()} strokeWidth={3} />
            )}
          </span>
        )}
      />
    </CheckboxPrimitive.Root>
  );
}

export function CheckboxGroup({
  className,
  ...props
}: CheckboxGroupPrimitive.Props): React.ReactElement {
  const styles = checkboxVariants();

  return (
    <CheckboxGroupPrimitive
      className={mergeBaseUiClassName(styles.group, className)}
      {...props}
    />
  );
}

export { CheckboxPrimitive, CheckboxGroupPrimitive };

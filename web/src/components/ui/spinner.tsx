import { Loader2Icon } from "lucide-react";
import type React from "react";
import { tv } from "tailwind-variants";

export const spinnerVariants = tv({
  base: "animate-spin",
});

export const Spinner = ({
  className,
  ...props
}: React.ComponentProps<typeof Loader2Icon>): React.ReactElement => {
  return (
    <Loader2Icon
      aria-label="Loading"
      className={spinnerVariants({ class: className })}
      role="status"
      {...props}
    />
  );
};

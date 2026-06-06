"use client";

import { CharRoll, MASK_FADE, type Variant } from "@/components/char-roll";
import { useMountedRef } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

type AnimateTextProps = {
  value: string;
  className?: string;
  charClassName?: string;
  variant?: Variant;
  charStagger?: number;
};

// Per-character vertical roll that never animates horizontal layout so character changes do not slide the text sideways.
export const AnimateText = (props: AnimateTextProps) => {
  const variant = props.variant ?? "slot";
  const mounted = useMountedRef();
  return (
    <span
      className={cn(
        "inline-flex",
        variant === "mask" && MASK_FADE,
        props.className,
      )}
    >
      {props.value.split("").map((c, i) => (
        <CharRoll
          key={`${i}`}
          char={c}
          index={i}
          variant={variant}
          stagger={props.charStagger ?? 0.025}
          className={props.charClassName}
          enableInitial={mounted.current}
          keepSpace
        />
      ))}
    </span>
  );
};

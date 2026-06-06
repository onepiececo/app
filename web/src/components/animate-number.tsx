"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { CharRoll, MASK_FADE, type Variant } from "@/components/char-roll";
import { useMountedRef } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

type AnimateNumberProps = {
  value: number;
  className?: string;
  stiffness?: number;
  damping?: number;
};

// Spring-interpolated counter that reads the motion value through useTransform so it never pays a setState per frame.
export const AnimateNumber = (props: AnimateNumberProps) => {
  const mv = useMotionValue(props.value);
  const rounded = useTransform(mv, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(mv, props.value, {
      type: "spring",
      stiffness: props.stiffness ?? 120,
      damping: props.damping ?? 20,
    });
    return () => controls.stop();
  }, [mv, props.value, props.stiffness, props.damping]);

  return <motion.span className={props.className}>{rounded}</motion.span>;
};

type AnimateDigitsProps = {
  value: number | string;
  pad?: number;
  className?: string;
  variant?: Variant;
  charStagger?: number;
};

// Per-digit slot roll where each digit is its own animated cell that slides the old value out as the new one slides in.
export const AnimateDigits = (props: AnimateDigitsProps) => {
  const variant = props.variant ?? "slot";
  const mounted = useMountedRef();
  const chars = String(props.value).padStart(props.pad ?? 0, "0").split("");

  return (
    <span
      className={cn(
        "inline-flex tabular-nums",
        variant === "mask" && MASK_FADE,
        props.className,
      )}
    >
      {chars.map((c, i) => (
        <CharRoll
          key={i}
          char={c}
          index={i}
          variant={variant}
          stagger={props.charStagger ?? 0.03}
          enableInitial={mounted.current}
        />
      ))}
    </span>
  );
};

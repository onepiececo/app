"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import { cn } from "@/lib/utils";

type Variant = "slot" | "fade" | "mask" | "bouncy";

const SPRINGS: Record<Variant, { stiffness: number; damping: number }> = {
  slot: { stiffness: 320, damping: 30 },
  fade: { stiffness: 260, damping: 28 },
  mask: { stiffness: 300, damping: 30 },
  bouncy: { stiffness: 380, damping: 18 },
};

const MOTION_PRESETS: Record<Variant, {
  initial: Record<string, string | number>;
  animate: Record<string, string | number>;
  exit: Record<string, string | number>;
}> = {
  slot: {
    initial: { y: "-100%", opacity: 0, filter: "blur(4px)" },
    animate: { y: 0, opacity: 1, filter: "blur(0px)" },
    exit: { y: "100%", opacity: 0, filter: "blur(4px)" },
  },
  fade: {
    initial: { opacity: 0, filter: "blur(8px)", scale: 0.94 },
    animate: { opacity: 1, filter: "blur(0px)", scale: 1 },
    exit: { opacity: 0, filter: "blur(8px)", scale: 0.94 },
  },
  mask: {
    initial: { y: "-60%", opacity: 0, filter: "blur(3px)" },
    animate: { y: 0, opacity: 1, filter: "blur(0px)" },
    exit: { y: "60%", opacity: 0, filter: "blur(3px)" },
  },
  bouncy: {
    initial: { y: "-120%", opacity: 0, filter: "blur(5px)" },
    animate: { y: 0, opacity: 1, filter: "blur(0px)" },
    exit: { y: "120%", opacity: 0, filter: "blur(5px)" },
  },
};

type AnimateNumberProps = {
  value: number;
  className?: string;
  stiffness?: number;
  damping?: number;
};

// Spring-interpolated counter that ticks through every value.
// Reads the motion value via useTransform so we don't pay a setState per frame.
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

// Per-digit slot roll. Each digit is its own animated cell, old slides out
// while new slides in. Variant picks the motion preset.
export const AnimateDigits = (props: AnimateDigitsProps) => {
  const variant = props.variant ?? "slot";
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
  }, []);
  const str =
    typeof props.value === "number" && props.pad
      ? String(props.value).padStart(props.pad, "0")
      : String(props.value);
  const chars = str.split("");

  return (
    <span
      className={cn(
        "inline-flex tabular-nums",
        variant === "mask" &&
          "[mask-image:linear-gradient(180deg,transparent,black_18%,black_82%,transparent)]",
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

type AnimateTextProps = {
  value: string;
  className?: string;
  charClassName?: string;
  variant?: Variant;
  charStagger?: number;
};

// Per-character vertical roll, no horizontal layout animation so character
// changes never slide the text left/right. The wrapping inline-flex still
// resizes naturally on length changes since each char is laid out in flow.
export const AnimateText = (props: AnimateTextProps) => {
  const variant = props.variant ?? "slot";
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
  }, []);
  return (
    <span
      className={cn(
        "inline-flex",
        variant === "mask" &&
          "[mask-image:linear-gradient(180deg,transparent,black_18%,black_82%,transparent)]",
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

type CharRollProps = {
  char: string;
  index: number;
  variant: Variant;
  stagger: number;
  className?: string;
  keepSpace?: boolean;
  // Parent passes true once it has rendered at least once.
  // First-render mounts stay silent, late-added cells animate in.
  enableInitial?: boolean;
};

const CharRoll = (props: CharRollProps) => {
  const preset = MOTION_PRESETS[props.variant];
  const spring = SPRINGS[props.variant];
  return (
    <span
      className={cn(
        "relative inline-block overflow-hidden align-baseline",
        props.className,
      )}
      style={{
        minWidth: props.char === " " ? "0.25em" : undefined,
        lineHeight: 1,
      }}
    >
      <AnimatePresence mode="popLayout" initial={props.enableInitial ?? false}>
        <motion.span
          key={props.char}
          initial={preset.initial}
          animate={preset.animate}
          exit={preset.exit}
          transition={{
            type: "spring",
            stiffness: spring.stiffness,
            damping: spring.damping,
            delay: props.index * props.stagger,
          }}
          className="inline-block whitespace-pre"
        >
          {props.keepSpace && props.char === " " ? " " : props.char}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

"use client";

import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

export type Variant = "slot" | "fade" | "mask" | "bouncy";

// Vertical fade so rolling characters dissolve at the top and bottom edges.
export const MASK_FADE =
  "mask-[linear-gradient(180deg,transparent,black_18%,black_82%,transparent)]";

const SPRINGS: Record<Variant, { stiffness: number; damping: number }> = {
  slot: { stiffness: 320, damping: 30 },
  fade: { stiffness: 260, damping: 28 },
  mask: { stiffness: 300, damping: 30 },
  bouncy: { stiffness: 380, damping: 18 },
};

const MOTION_PRESETS: Record<
  Variant,
  {
    initial: Record<string, string | number>;
    animate: Record<string, string | number>;
    exit: Record<string, string | number>;
  }
> = {
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

type CharRollProps = {
  char: string;
  index: number;
  variant: Variant;
  stagger: number;
  className?: string;
  keepSpace?: boolean;
  // True once the parent has rendered at least once so first mounts stay silent while late cells animate in.
  enableInitial?: boolean;
};

export const CharRoll = (props: CharRollProps) => {
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
          {props.keepSpace && props.char === " " ? " " : props.char}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

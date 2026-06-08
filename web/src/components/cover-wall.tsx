"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import type { AnimeHit } from "@/app/actions/anime";
import { cn } from "@/lib/utils";

export type CoverWallProps = {
  covers: AnimeHit[];
  // Column count, extra columns overflow and clip off the sides on narrow viewports.
  columns?: number;
  perColumn?: number;
  // Tailwind blur class for the whole wall, for example blur-sm or blur-[1px].
  blur?: string;
  // When true each cover links to its anime and shows its title, otherwise the wall is a decorative backdrop.
  clickable?: boolean;
  // Fades the first and last columns into the background so nothing slams the screen edge.
  edgeFade?: boolean;
  className?: string;
};

const EDGE_MASK = "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)";

const TITLE_SHADOW = "[text-shadow:_0_1px_2px_rgb(0_0_0/0.95),_0_2px_6px_rgb(0_0_0/0.7)]";

// Each column takes a distinct slice so covers do not repeat across columns until the pool runs out.
const sliceColumn = (covers: AnimeHit[], col: number, per: number) => {
  const out: AnimeHit[] = [];
  for (let i = 0; i < per; i++) out.push(covers[(col * per + i) % covers.length]);
  return out;
};

const Cover = (props: { anime: AnimeHit; clickable: boolean }) => {
  const a = props.anime;
  const tint = a?.coverColor ? { backgroundColor: a.coverColor } : undefined;
  const img = a?.coverSourceUrl ? (
    // Decorative backdrop so a plain lazy img keeps the optimizer out of so many tiles and lets the browser cache each cover by url.
    <img src={a.coverSourceUrl} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
  ) : null;
  // The per-cover margin keeps the doubled track halves equal so the minus fifty percent loop lands seamlessly.
  const box = "relative mb-3 block aspect-2/3 w-full overflow-hidden rounded-xl bg-muted/40";
  if (props.clickable && a) {
    return (
      <Link href={`/anime/${a.id}`} prefetch={false} tabIndex={-1} className={cn(box, "pointer-events-auto")} style={tint}>
        {img}
        {a.title ? (
          <span className={cn("absolute top-1.5 right-1.5 left-1.5 line-clamp-2 font-medium text-[11px] text-white leading-tight", TITLE_SHADOW)}>
            {a.title}
          </span>
        ) : null}
      </Link>
    );
  }
  return (
    <div className={cn(box)} style={tint}>
      {img}
    </div>
  );
};

const Column = (props: { covers: AnimeHit[]; up: boolean; duration: number; reduce: boolean; clickable: boolean }) => {
  const doubled = [...props.covers, ...props.covers];
  const from = props.up ? "0%" : "-50%";
  const to = props.up ? "-50%" : "0%";
  return (
    <div className="w-32 shrink-0 sm:w-40 lg:w-44">
      <motion.div
        className="flex flex-col"
        initial={{ y: from }}
        animate={{ y: props.reduce ? from : to }}
        transition={props.reduce ? { duration: 0 } : { duration: props.duration, repeat: Infinity, repeatType: "loop", ease: "linear" }}
      >
        {doubled.map((a, i) => (
          <Cover key={i} anime={a} clickable={props.clickable} />
        ))}
      </motion.div>
    </div>
  );
};

// Columns of anime covers drifting vertically at alternating speeds and directions, like a wall of elevators.
export const CoverWall = (props: CoverWallProps) => {
  const reduce = useReducedMotion() ?? false;
  const columns = props.columns ?? 10;
  const per = props.perColumn ?? 6;
  if (props.covers.length === 0) return null;
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 flex justify-center gap-3 overflow-hidden", props.blur, props.className)}
      style={props.edgeFade ? { WebkitMaskImage: EDGE_MASK, maskImage: EDGE_MASK } : undefined}
    >
      {Array.from({ length: columns }).map((_, c) => (
        <Column
          key={c}
          covers={sliceColumn(props.covers, c, per)}
          up={c % 2 === 0}
          duration={32 + (c % 4) * 7}
          reduce={reduce}
          clickable={Boolean(props.clickable)}
        />
      ))}
    </div>
  );
};

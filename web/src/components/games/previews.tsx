"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { AnimeHit } from "@/app/actions/anime";
import { usePreviewData } from "@/components/games/preview-data";
import { scoreColor } from "@/lib/score";
import { cn } from "@/lib/utils";

const COVER_TEXT = "[text-shadow:_0_0_0.2rem_rgb(0_0_0/0.95),_0_0.06rem_0.2rem_rgb(0_0_0/0.9)]";

const useToggle = (ms: number) => {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setOn((v) => !v), ms);
    return () => clearInterval(id);
  }, [ms]);
  return on;
};

const useRandomCover = () => {
  const { covers } = usePreviewData();
  const [hit, setHit] = useState<AnimeHit | null>(null);
  useEffect(() => {
    const withCover = covers.filter((a) => a.coverSourceUrl);
    if (withCover.length) setHit(withCover[Math.floor(Math.random() * withCover.length)]);
  }, [covers]);
  return hit;
};

// Cover, a real cover that zooms and sharpens, the title fades in only while it is sharp.
export const CoverPreview = () => {
  const hit = useRandomCover();
  return (
    <div className="grid h-full place-items-center">
      <div className="relative aspect-2/3 h-full overflow-hidden rounded-md">
        {hit?.coverSourceUrl ? <Image src={hit.coverSourceUrl} alt="" fill priority sizes="10rem" className="pv-cover-zoom object-cover" /> : null}
        {hit ? <span className={cn("pv-label absolute top-1.5 right-1.5 left-1.5 line-clamp-2 font-semibold text-[0.65rem] text-white leading-tight", COVER_TEXT)}>{hit.title}</span> : null}
      </div>
    </div>
  );
};

// Character, a real portrait that blurs and clears, the name fades in only while it is sharp.
export const CharacterPreview = () => {
  const chara = usePreviewData().character;
  return (
    <div className="grid h-full place-items-center">
      <div className="relative aspect-2/3 h-full overflow-hidden rounded-md">
        {chara?.imageUrl ? <Image src={chara.imageUrl} alt="" fill priority sizes="10rem" className="pv-char object-cover" /> : null}
        {chara ? <span className={cn("pv-label absolute top-1.5 right-1.5 left-1.5 line-clamp-2 font-semibold text-[0.65rem] text-white leading-tight", COVER_TEXT)}>{chara.name}</span> : null}
      </div>
    </div>
  );
};

// Higher or Lower, one real cover with its score, the known side of the call.
export const HigherPreview = () => {
  const hit = useRandomCover();
  const score = hit?.score ? (hit.score / 10).toFixed(1) : "?";
  return (
    <div className="grid h-full place-items-center">
      <div className="relative aspect-2/3 h-full overflow-hidden rounded-md bg-muted" style={hit?.coverColor ? { backgroundColor: hit.coverColor } : undefined}>
        {hit?.coverSourceUrl ? <Image src={hit.coverSourceUrl} alt="" fill priority sizes="8rem" className="object-cover" /> : null}
        {hit ? <span className={cn("absolute top-1.5 right-1.5 left-1.5 line-clamp-2 font-semibold text-[0.65rem] text-white leading-tight", COVER_TEXT)}>{hit.title}</span> : null}
        <span className={cn("absolute right-1.5 bottom-1.5 font-bold text-base text-white leading-none tabular-nums", COVER_TEXT)}>{score}</span>
      </div>
    </div>
  );
};

// Timeline, three real covers that reorder into release order, the year reveals as they settle.
export const TimelinePreview = () => {
  const { covers } = usePreviewData();
  const sorted = useToggle(2600);
  const hits = covers.filter((a) => a.coverSourceUrl && a.year).slice(0, 3);
  if (hits.length < 3) return null;
  const withYear = hits.map((h) => ({ ...h, yr: h.year ?? 2000 }));
  const order = sorted ? [...withYear].sort((a, b) => a.yr - b.yr) : withYear;
  return (
    <div className="grid h-full grid-cols-3 items-center gap-2">
      {order.map((a) => (
        <motion.div layout="position" key={a.id} transition={{ type: "spring", stiffness: 240, damping: 30 }} className="relative aspect-2/3 w-full">
          {a.coverSourceUrl ? <Image src={a.coverSourceUrl} alt="" fill sizes="6rem" className="rounded-md object-cover" /> : null}
          <span className={cn("absolute top-1 right-1 left-1 line-clamp-2 font-semibold text-[0.6rem] text-white leading-tight", COVER_TEXT)}>{a.title}</span>
          <span className={cn("absolute right-1 bottom-1 font-bold text-xs leading-none tabular-nums", COVER_TEXT, sorted ? "text-success" : "text-white")}>{sorted ? a.yr : "????"}</span>
        </motion.div>
      ))}
    </div>
  );
};

// Groups, the same board as the test concept, it highlights a group then solves it into a labeled color bar.
const PV_GROUPS = [
  { label: "Shounen", color: "#f9df6d", tiles: ["Naruto", "Bleach", "Luffy", "Natsu"] },
  { label: "Mecha", color: "#a0c35a", tiles: ["Gundam", "Eva", "Geass", "Gurren"] },
  { label: "Drama", color: "#b0c4ef", tiles: ["Clannad", "Air", "Kanon", "Toradora"] },
  { label: "Mind", color: "#ba81c5", tiles: ["Akira", "Lain", "Paprika", "Ergo"] },
];
const PV_ORDER = ["Naruto", "Gundam", "Clannad", "Akira", "Bleach", "Eva", "Air", "Lain", "Luffy", "Geass", "Kanon", "Paprika", "Natsu", "Gurren", "Toradora", "Ergo"];
export const GroupsPreview = () => {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % 9), 1000);
    return () => clearInterval(id);
  }, []);
  const solvedCount = step === 8 ? 0 : Math.floor((step + 1) / 2);
  const selectingGroup = step < 8 && step % 2 === 0 ? Math.floor(step / 2) : -1;
  const solved = PV_GROUPS.slice(0, solvedCount);
  const solvedTiles = new Set(solved.flatMap((g) => g.tiles));
  const selected = new Set(selectingGroup >= 0 ? PV_GROUPS[selectingGroup].tiles : []);
  const remaining = PV_ORDER.filter((t) => !solvedTiles.has(t));
  return (
    <div className="grid h-full place-items-center">
      <div className="grid aspect-square h-full max-w-full grid-cols-4 grid-rows-4 gap-1 overflow-hidden">
        {solved.map((g) => (
          <motion.div
            layout
            key={g.label}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="col-span-4 flex flex-col items-center justify-center gap-0 rounded-md px-1 text-center text-black/85"
            style={{ backgroundColor: g.color }}
          >
            <span className="font-bold text-[0.55rem] uppercase tracking-wide">{g.label}</span>
            <span className="line-clamp-1 font-medium text-[0.45rem]">{g.tiles.join(", ")}</span>
          </motion.div>
        ))}
        {remaining.map((t) => (
          <motion.div
            layout
            key={t}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className={cn("flex items-center justify-center rounded-md px-0.5 text-center text-[0.5rem] leading-none", selected.has(t) ? "bg-foreground text-background" : "border border-border bg-card text-foreground")}
          >
            {t}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Dial, the gauge whose ticker sweeps smoothly along the arc, segments and score lighting as it goes.
const D_COLORS = ["#ef4444", "#f97316", "#facc15", "#a3e635", "#4ade80", "#22c55e"];
const D_SEG = 17.5;
const D_GAP = 15;
const D_R = 90;
const D_CX = 120;
const D_CY = 112;
const dPolar = (deg: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: D_CX + D_R * Math.sin(a), y: D_CY - D_R * Math.cos(a) };
};
const dSeg = (i: number) => {
  const s = dPolar(-90 + i * (D_SEG + D_GAP));
  const e = dPolar(-90 + i * (D_SEG + D_GAP) + D_SEG);
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${D_R} ${D_R} 0 0 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
};
export const DialPreview = () => {
  const [value, setValue] = useState(50);
  useEffect(() => {
    let raf = 0;
    let from = 50;
    let to = Math.round(10 + Math.random() * 80);
    let phaseStart = 0;
    const MOVE = 1000;
    const HOLD = 1000;
    const loop = (t: number) => {
      if (!phaseStart) phaseStart = t;
      const elapsed = t - phaseStart;
      if (elapsed < MOVE) {
        const p = elapsed / MOVE;
        const eased = 0.5 - 0.5 * Math.cos(p * Math.PI);
        setValue(from + (to - from) * eased);
      } else if (elapsed < MOVE + HOLD) {
        setValue(to);
      } else {
        from = to;
        to = Math.round(10 + Math.random() * 80);
        phaseStart = t;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const active = [16, 33, 50, 66, 83, 100].findIndex((t) => value <= t) + 1;
  const knob = dPolar(-90 + (value / 100) * 180);
  return (
    <div className="grid h-full place-items-center">
      <svg viewBox="0 0 240 124" className="h-full w-full max-w-[12rem]" role="img" aria-label="Score gauge">
        {D_COLORS.map((c, i) => (
          <path key={c} d={dSeg(i)} stroke={c} strokeWidth={15} strokeLinecap="round" fill="none" style={{ opacity: i < active ? 1 : 0.32, transition: "opacity 0.25s ease" }} />
        ))}
        <circle cx={knob.x} cy={knob.y} r={9} strokeWidth={1.5} style={{ fill: "var(--background)", stroke: "var(--border)" }} />
        <text x={D_CX} y={D_CY - 4} textAnchor="middle" fontSize="24" fontWeight="700" style={{ fill: scoreColor(value) }}>
          {(value / 10).toFixed(1)}
        </text>
      </svg>
    </div>
  );
};

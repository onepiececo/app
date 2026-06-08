"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { type AnimeCharacter, type AnimeHit, browseAnime, getAnimeById } from "@/app/actions/anime";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { scoreColor } from "@/lib/score";
import { cn } from "@/lib/utils";

const COVER_TEXT = "[text-shadow:_0_0_0.2rem_rgb(0_0_0/0.95),_0_0.06rem_0.2rem_rgb(0_0_0/0.9),_0_0.12rem_0.5rem_rgb(0_0_0/0.5)]";

const CSS = `
@keyframes charReveal { 0% { filter: blur(0.9rem); } 50% { filter: blur(0); } 82% { filter: blur(0); } 100% { filter: blur(0.9rem); } }
@keyframes coverZoom { 0% { filter: blur(0.8rem); transform: scale(1.12); } 50% { filter: blur(0); transform: scale(1); } 82% { filter: blur(0); transform: scale(1); } 100% { filter: blur(0.8rem); transform: scale(1.12); } }
.char-reveal { animation: charReveal 3.4s ease-in-out infinite; }
.cover-zoom { animation: coverZoom 3.4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .char-reveal, .cover-zoom { animation: none !important; filter: none !important; transform: none !important; }
}
`;

// Cover, a real cover that zooms and sharpens, the scale keeps the blur clean to the edges.
const CoverReveal = () => {
  const [hit, setHit] = useState<AnimeHit | null>(null);
  useEffect(() => {
    let active = true;
    browseAnime("popularity", 30).then((list) => {
      const withCover = list.filter((a) => a.coverSourceUrl);
      if (active && withCover.length) setHit(withCover[Math.floor(Math.random() * withCover.length)]);
    });
    return () => {
      active = false;
    };
  }, []);
  return (
    <div className="grid h-full place-items-center">
      <div className="relative aspect-2/3 h-full overflow-hidden rounded-lg">
        {hit?.coverSourceUrl ? <Image src={hit.coverSourceUrl} alt="" fill priority sizes="10rem" className="cover-zoom object-cover" /> : null}
      </div>
    </div>
  );
};

// Character, a real portrait that blurs and clears, square corners like the detail page, no name.
const CharacterReveal = () => {
  const [chara, setChara] = useState<AnimeCharacter | null>(null);
  useEffect(() => {
    let active = true;
    (async () => {
      const list = await browseAnime("popularity", 10);
      for (const a of list) {
        const detail = await getAnimeById(a.id);
        const cands = detail?.characters?.filter((c) => c.imageUrl) ?? [];
        const main = cands.find((c) => c.role === "MAIN") ?? cands[0];
        if (main && active) {
          setChara(main);
          return;
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  return (
    <div className="grid h-full place-items-center">
      <div className="relative aspect-2/3 h-full overflow-hidden">
        {chara?.imageUrl ? <Image src={chara.imageUrl} alt="" fill priority sizes="10rem" className="char-reveal object-cover" /> : null}
      </div>
    </div>
  );
};

// Higher or Lower, real covers, guess which scores higher.
const useTwoCovers = () => {
  const [pair, setPair] = useState<AnimeHit[]>([]);
  useEffect(() => {
    let active = true;
    browseAnime("popularity", 30).then((list) => {
      const withCover = list.filter((a) => a.coverSourceUrl);
      if (active && withCover.length >= 2) {
        const i = Math.floor(Math.random() * withCover.length);
        let j = Math.floor(Math.random() * withCover.length);
        if (j === i) j = (j + 1) % withCover.length;
        setPair([withCover[i], withCover[j]]);
      }
    });
    return () => {
      active = false;
    };
  }, []);
  return pair;
};

const RealCover = (props: { hit?: AnimeHit; score?: string; className?: string }) => (
  <div className={cn("relative aspect-2/3 overflow-hidden rounded-md bg-muted", props.className)} style={props.hit?.coverColor ? { backgroundColor: props.hit.coverColor } : undefined}>
    {props.hit?.coverSourceUrl ? <Image src={props.hit.coverSourceUrl} alt="" fill sizes="8rem" className="scale-[1.02] object-cover" /> : null}
    {props.hit ? <span className={cn("absolute top-1.5 right-1.5 left-1.5 line-clamp-2 font-semibold text-white text-xs leading-tight", COVER_TEXT)}>{props.hit.title}</span> : null}
    <span className={cn("absolute right-1.5 bottom-1.5 font-bold text-lg text-white leading-none tabular-nums", COVER_TEXT)}>{props.score ?? "?"}</span>
  </div>
);

const score1 = (a?: AnimeHit) => (a?.score ? (a.score / 10).toFixed(1) : "?");

const HigherOr = () => {
  const pair = useTwoCovers();
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-4">
        <RealCover hit={pair[0]} score={score1(pair[0])} className="w-28" />
        <span className="font-medium text-muted-foreground text-sm uppercase">or</span>
        <RealCover hit={pair[1]} className="w-28" />
      </div>
      <div className="flex gap-2">
        <Button variant="secondary">Higher</Button>
        <Button variant="outline">Lower</Button>
      </div>
    </div>
  );
};


// Dial, the gauge with smooth color transitions, the center reads the score on the same scale as the segments.
const COLORS = ["#ef4444", "#f97316", "#facc15", "#a3e635", "#4ade80", "#22c55e"];
const SEG = 17.5;
const GAP = 15;
const R = 90;
const CX = 120;
const CY = 112;
const SW = 15;
const polar = (deg: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: CX + R * Math.sin(a), y: CY - R * Math.cos(a) };
};
const segPath = (i: number) => {
  const start = -90 + i * (SEG + GAP);
  const s = polar(start);
  const e = polar(start + SEG);
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${R} ${R} 0 0 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
};
const activeCount = (v: number) => [16, 33, 50, 66, 83, 100].findIndex((t) => v <= t) + 1;

const DialGauge = () => {
  const [value, setValue] = useState(72);
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const setFromPointer = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const cx = rect.left + (CX / 240) * rect.width;
    const cy = rect.top + (CY / 124) * rect.height;
    let deg = (Math.atan2(clientX - cx, cy - clientY) * 180) / Math.PI;
    deg = Math.max(-90, Math.min(90, deg));
    setValue(Math.round(((deg + 90) / 180) * 100));
  };

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => setFromPointer(e.clientX, e.clientY);
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging]);

  const active = activeCount(value);
  const knob = polar(-90 + (value / 100) * 180);
  return (
    <div className="grid h-full place-items-center">
      <svg
        ref={svgRef}
        viewBox="0 0 240 124"
        className="w-full max-w-[14rem] touch-none select-none"
        role="img"
        aria-label="Satisfaction gauge"
        onPointerDown={(e) => {
          setDragging(true);
          setFromPointer(e.clientX, e.clientY);
        }}
      >
        <defs>
          <filter id="knobShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.25" />
          </filter>
        </defs>
        {COLORS.map((c, i) => (
          <path
            key={c}
            d={segPath(i)}
            stroke={c}
            strokeWidth={SW}
            strokeLinecap="round"
            fill="none"
            style={{ opacity: i < active ? 1 : 0.32, filter: i < active ? "brightness(1.06)" : undefined, transition: "opacity 0.3s ease, filter 0.3s ease" }}
          />
        ))}
        <circle
          cx={knob.x}
          cy={knob.y}
          r={9}
          strokeWidth={1.5}
          filter="url(#knobShadow)"
          className={cn("cursor-grab", dragging && "cursor-grabbing")}
          style={{ fill: "var(--background)", stroke: "var(--border)" }}
        />
        <text x={CX} y={CY - 4} textAnchor="middle" fontSize="24" fontWeight="700" style={{ fill: scoreColor(value), transition: "fill 0.3s ease" }}>
          {(value / 10).toFixed(1)}
        </text>
      </svg>
    </div>
  );
};

type Concept = { name: string; accent: string; variants: Array<() => ReactNode> };

const GAMES: Concept[] = [
  { name: "Cover", accent: "text-sky-700 dark:text-sky-300", variants: [CoverReveal] },
  { name: "Character", accent: "text-violet-700 dark:text-violet-300", variants: [CharacterReveal] },
  { name: "Dial", accent: "text-fuchsia-700 dark:text-fuchsia-300", variants: [DialGauge] },
];

const Tile = (props: { accent: string; name: string; children: ReactNode }) => (
  <div className="flex aspect-5/3 w-full max-w-xs flex-col gap-3">
    <div className="min-h-0 flex-1">{props.children}</div>
    <span className={cn("font-medium text-xs uppercase tracking-wider", props.accent)}>{props.name}</span>
  </div>
);

// Timeline, five real covers, two ways to show the reorder into release order.
const useFiveCovers = () => {
  const [hits, setHits] = useState<AnimeHit[]>([]);
  useEffect(() => {
    let active = true;
    browseAnime("popularity", 16).then((list) => {
      const picked = list.filter((a) => a.coverSourceUrl && a.year).slice(0, 3);
      if (active) setHits(picked);
    });
    return () => {
      active = false;
    };
  }, []);
  return hits;
};

const useToggle = (ms: number) => {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setOn((v) => !v), ms);
    return () => clearInterval(id);
  }, [ms]);
  return on;
};

const TimelineGrid = () => {
  const hits = useFiveCovers();
  const sorted = useToggle(2600);
  if (hits.length < 3) return <div className="h-40 text-muted-foreground text-sm">Loading…</div>;
  const withYear = hits.map((h) => ({ ...h, yr: h.year ?? 2000 }));
  const order = sorted ? [...withYear].sort((a, b) => a.yr - b.yr) : withYear;
  return (
    <div className="grid grid-cols-3 gap-3">
      {order.map((a) => (
        <motion.div layout="position" key={a.id} transition={{ type: "spring", stiffness: 240, damping: 30 }} className="relative aspect-2/3 w-full">
          {a.coverSourceUrl ? <Image src={a.coverSourceUrl} alt="" fill sizes="8rem" className="rounded-md object-cover" /> : null}
          <span className={cn("absolute top-1.5 right-1.5 left-1.5 line-clamp-2 font-semibold text-white text-xs leading-tight", COVER_TEXT)}>{a.title}</span>
          <span className={cn("absolute right-1.5 bottom-1.5 font-bold text-sm leading-none tabular-nums", COVER_TEXT, sorted ? "text-success" : "text-white")}>{sorted ? a.yr : "????"}</span>
        </motion.div>
      ))}
    </div>
  );
};

// Groups, an auto-playing demo that highlights a group then solves it on a loop.
const DEMO_GROUPS = [
  { label: "Shounen", color: "#f9df6d", tiles: ["Naruto", "Bleach", "One Piece", "Fairy Tail"] },
  { label: "Mecha", color: "#a0c35a", tiles: ["Gundam", "Evangelion", "Code Geass", "Gurren Lagann"] },
  { label: "Iyashikei", color: "#b0c4ef", tiles: ["Aria", "Mushishi", "Yokohama", "Flying Witch"] },
  { label: "Mind-bender", color: "#ba81c5", tiles: ["Akira", "Lain", "Paprika", "Ergo Proxy"] },
];
const TILE_ORDER = ["Naruto", "Gundam", "Aria", "Akira", "Bleach", "Evangelion", "Mushishi", "Lain", "One Piece", "Code Geass", "Yokohama", "Paprika", "Fairy Tail", "Gurren Lagann", "Flying Witch", "Ergo Proxy"];

const GroupsDemo = () => {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % 9), 1100);
    return () => clearInterval(id);
  }, []);
  const solvedCount = step === 8 ? 0 : Math.floor((step + 1) / 2);
  const selectingGroup = step < 8 && step % 2 === 0 ? Math.floor(step / 2) : -1;
  const solved = DEMO_GROUPS.slice(0, solvedCount);
  const solvedNames = new Set(solved.flatMap((g) => g.tiles));
  const remaining = TILE_ORDER.filter((t) => !solvedNames.has(t));
  const selected = new Set(selectingGroup >= 0 ? DEMO_GROUPS[selectingGroup].tiles : []);
  return (
    <div className="grid aspect-square w-full max-w-[20rem] grid-cols-4 grid-rows-4 gap-2 overflow-hidden">
      {solved.map((g) => (
        <motion.div
          layout
          key={g.label}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          className="col-span-4 flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 text-center text-black/85"
          style={{ backgroundColor: g.color }}
        >
          <span className="font-bold text-xs uppercase tracking-wide">{g.label}</span>
          <span className="font-medium text-[0.65rem]">{g.tiles.join(", ")}</span>
        </motion.div>
      ))}
      {remaining.map((t) => {
        const on = selected.has(t);
        return (
          <motion.div
            layout
            key={t}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className={cn("flex items-center justify-center rounded-xl px-1 text-center font-medium text-xs leading-tight", on ? "bg-foreground text-background" : "border border-border bg-card")}
          >
            {t}
          </motion.div>
        );
      })}
    </div>
  );
};

export default function TestPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <style>{CSS}</style>
      <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-border border-b bg-background/80 px-4 py-3 backdrop-blur sm:px-6">
        <Link href="/" className="font-medium text-sm">
          Home
        </Link>
        <span className="text-muted-foreground text-sm">Other game concepts</span>
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-4 py-10 sm:px-6">
        {GAMES.map((g) => (
          <section key={g.name} className="flex flex-col gap-4">
            <h2 className="font-semibold text-lg tracking-tight">{g.name}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {g.variants.map((V, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <span className="font-mono text-muted-foreground text-xs uppercase tracking-wider">Variant {String.fromCharCode(65 + i)}</span>
                  <Tile accent={g.accent} name={g.name}>
                    <V />
                  </Tile>
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className="flex flex-col gap-4">
          <h2 className="font-semibold text-lg tracking-tight">Higher or Lower</h2>
          <HigherOr />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-semibold text-lg tracking-tight">Timeline</h2>
          <p className="text-muted-foreground text-sm">A grid of covers with titles, the years stay hidden until they sort into release order.</p>
          <TimelineGrid />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-semibold text-lg tracking-tight">Groups</h2>
          <p className="text-muted-foreground text-sm">It highlights a group then solves it, looping with the same animation as the real board.</p>
          <GroupsDemo />
        </section>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDay } from "@/components/day-provider";
import { getHigherLower, guessHigherLower, type HLEntry, type HLPuzzle } from "@/app/actions/games";
import { Button } from "@/components/ui/button";
import { getAnonymousKey } from "@/lib/anonymous-key";
import { cn } from "@/lib/utils";

const COVER_TEXT = "[text-shadow:_0_0_0.2rem_rgb(0_0_0/0.95),_0_0.06rem_0.2rem_rgb(0_0_0/0.9),_0_0.12rem_0.5rem_rgb(0_0_0/0.5)]";

const Cover = (props: { entry: HLEntry; score?: number; tone?: "hit" | "miss"; linked?: boolean }) => {
  const a = props.entry;
  const style = a.coverColor ? { backgroundColor: a.coverColor } : undefined;
  const cls = "relative block aspect-2/3 w-40 shrink-0 overflow-hidden rounded-xl bg-muted";
  const inner = (
    <>
      {a.coverSourceUrl ? <Image src={a.coverSourceUrl} alt={a.title} fill sizes="10rem" className="object-cover" /> : null}
      <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/35 group-focus-visible:bg-black/35" />
      <span className={cn("absolute top-2 right-2 left-2 line-clamp-2 font-semibold text-sm text-white leading-tight", COVER_TEXT)}>{a.title}</span>
      <span className="absolute inset-x-2 bottom-2 flex flex-col items-center gap-0.5">
        <span className={cn("text-[10px] text-white/80 uppercase tracking-wide", COVER_TEXT)}>score</span>
        {props.score !== undefined ? (
          <span className={cn("font-bold text-3xl text-white leading-none tabular-nums", COVER_TEXT, props.tone === "hit" && "text-success", props.tone === "miss" && "text-destructive")}>
            {(props.score / 10).toFixed(1)}
          </span>
        ) : (
          <span className={cn("font-bold text-3xl text-white leading-none", COVER_TEXT)}>?</span>
        )}
      </span>
    </>
  );
  if (props.linked) {
    return (
      <Link href={`/anime/${a.animeId}`} prefetch={false} className={cn(cls, "group cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white")} style={style}>
        {inner}
      </Link>
    );
  }
  return (
    <div className={cls} style={style}>
      {inner}
    </div>
  );
};

const Panel = (props: { puzzle: HLPuzzle }) => {
  const { days, activeIdx, pickDay } = useDay();
  const prev = days[activeIdx + 1];
  const won = props.puzzle.status === "won";
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-col items-center gap-1.5 text-center">
        <span className={cn("font-medium text-xs uppercase tracking-[0.08em]", won ? "text-success" : "text-destructive")}>{won ? "Cleared the chain" : "Streak ended"}</span>
        <span className="font-semibold text-2xl tracking-tight">Streak {props.puzzle.index}</span>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" disabled={!prev} onClick={() => prev && pickDay(prev.iso)}>
          Play previous day
        </Button>
        <Button variant="outline" disabled>
          View leaderboard
        </Button>
      </div>
    </div>
  );
};

export const HigherBoard = () => {
  const { activeDay } = useDay();
  const [puzzle, setPuzzle] = useState<HLPuzzle | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [reveal, setReveal] = useState<{ score: number; correct: boolean } | null>(null);
  const [anonKey] = useState(() => getAnonymousKey());

  useEffect(() => {
    let active = true;
    setLoading(true);
    setReveal(null);
    getHigherLower(activeDay.iso, anonKey).then((p) => {
      if (!active) return;
      setPuzzle(p);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [activeDay.iso, anonKey]);

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground text-sm">Loading…</div>;
  }
  if (!puzzle) {
    return <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground text-sm">No puzzle for this day.</div>;
  }

  const over = puzzle.status !== "started";

  const call = async (direction: "higher" | "lower") => {
    if (busy || over || reveal) return;
    setBusy(true);
    const res = await guessHigherLower(puzzle.id, direction, anonKey);
    setBusy(false);
    if (!res) return;
    setReveal({ score: res.lastScore, correct: res.correct });
    setTimeout(() => {
      setReveal(null);
      setPuzzle(res.view);
    }, 1300);
  };

  return (
    <div className="flex flex-col items-center gap-10 pt-4">
      <div className="flex items-baseline gap-2">
        <span className="font-bold text-3xl tracking-tight tabular-nums">{puzzle.index}</span>
        <span className="text-muted-foreground text-sm">streak</span>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <Cover entry={puzzle.reference} score={puzzle.reference.score} linked={over} />
          <span className="font-medium text-muted-foreground text-xs uppercase">or</span>
          {puzzle.next ? <Cover entry={puzzle.next} score={reveal ? reveal.score : puzzle.next.score} tone={reveal ? (reveal.correct ? "hit" : "miss") : undefined} linked={over} /> : null}
        </div>
        {!over && !reveal ? (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => call("higher")} disabled={busy}>
              Higher
            </Button>
            <Button variant="outline" onClick={() => call("lower")} disabled={busy}>
              Lower
            </Button>
          </div>
        ) : null}
      </div>

      {over ? <Panel puzzle={puzzle} /> : null}
    </div>
  );
};

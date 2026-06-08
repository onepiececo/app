"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDay } from "@/components/day-provider";
import type { AnimeHit } from "@/app/actions/anime";
import { type CluePuzzle, type FieldCmp, getPuzzle, type GuessCompare, type ItemCmp, submitGuess } from "@/app/actions/games";
import { AnimeSearch } from "@/components/anime-search";
import { Button } from "@/components/ui/button";
import { getAnonymousKey } from "@/lib/anonymous-key";
import { cn } from "@/lib/utils";

const COLS = ["Title", "Year", "Studio", "Source", "Score", "Genres", "Tags"];

const tone = (s: "hit" | "miss") => (s === "hit" ? "text-success" : "text-destructive");

const Arrow = (props: { dir?: "up" | "down" }) =>
  props.dir === "up" ? <ChevronUp className="size-3.5 opacity-70" /> : props.dir === "down" ? <ChevronDown className="size-3.5 opacity-70" /> : null;

const Attr = (props: { cell: FieldCmp }) => (
  <span className={cn("relative inline-flex items-center justify-center font-medium text-sm", tone(props.cell.status))}>
    {props.cell.text}
    {props.cell.arrow ? (
      <span className="absolute left-full ml-0.5 flex items-center">
        <Arrow dir={props.cell.arrow} />
      </span>
    ) : null}
  </span>
);

const Items = (props: { items: ItemCmp[] }) => (
  <div className="flex flex-col items-center gap-0.5">
    {props.items.map((t) => (
      <span key={t.text} className={cn("text-center text-sm break-words", tone(t.status))}>
        {t.text}
      </span>
    ))}
  </div>
);

type Bound = { lo?: number; hi?: number; exact?: string };

const numericBound = (cells: FieldCmp[]): Bound => {
  const b: Bound = {};
  for (const c of cells) {
    const n = Number.parseFloat(c.text);
    if (Number.isNaN(n)) continue;
    if (c.status === "hit") b.exact = c.text;
    else if (c.arrow === "up") b.lo = b.lo === undefined ? n : Math.max(b.lo, n);
    else if (c.arrow === "down") b.hi = b.hi === undefined ? n : Math.min(b.hi, n);
  }
  return b;
};

const boundText = (b: Bound): string => {
  if (b.exact) return b.exact;
  if (b.lo !== undefined && b.hi !== undefined) return `${b.lo} – ${b.hi}`;
  if (b.lo !== undefined) return `> ${b.lo}`;
  if (b.hi !== undefined) return `< ${b.hi}`;
  return "—";
};

const confirmed = (cells: FieldCmp[]): string | null => cells.find((c) => c.status === "hit")?.text ?? null;

const hitItems = (lists: ItemCmp[][]): string[] => {
  const set = new Set<string>();
  for (const list of lists) for (const it of list) if (it.status === "hit") set.add(it.text);
  return [...set];
};

const SummaryRow = (props: { guesses: GuessCompare[] }) => {
  const g = props.guesses;
  const year = numericBound(g.map((x) => x.year));
  const score = numericBound(g.map((x) => x.score));
  const studio = confirmed(g.map((x) => x.studio));
  const source = confirmed(g.map((x) => x.source));
  const genres = hitItems(g.map((x) => x.genres));
  const tags = hitItems(g.map((x) => x.tags));
  const known = (v: string | null) => (v ? "text-success" : "text-muted-foreground");
  const range = (b: Bound) => (b.exact ? "text-success" : b.lo !== undefined || b.hi !== undefined ? "text-foreground" : "text-muted-foreground");
  return (
    <tr className="bg-foreground/[0.06]">
      <td className="px-3 py-3 font-medium text-foreground text-sm">Narrowed to</td>
      <td className={cn("whitespace-nowrap px-3 py-3 text-center text-sm", range(year))}>{boundText(year)}</td>
      <td className={cn("px-3 py-3 text-center text-sm", known(studio))}>{studio ?? "—"}</td>
      <td className={cn("px-3 py-3 text-center text-sm", known(source))}>{source ?? "—"}</td>
      <td className={cn("whitespace-nowrap px-3 py-3 text-center text-sm", range(score))}>{boundText(score)}</td>
      <td className={cn("px-3 py-3 text-center text-sm break-words", genres.length ? "text-success" : "text-muted-foreground")}>{genres.length ? genres.join(", ") : "—"}</td>
      <td className={cn("px-3 py-3 text-center text-sm break-words", tags.length ? "text-success" : "text-muted-foreground")}>{tags.length ? tags.join(", ") : "—"}</td>
    </tr>
  );
};

const GuessRow = (props: { row: GuessCompare }) => {
  const r = props.row;
  return (
    <tr>
      <td className="px-3 py-4 text-left align-middle text-balance break-words">
        <Link href={`/anime/${r.animeId}`} prefetch={false} className="font-medium text-sm hover:underline">
          {r.title}
        </Link>
      </td>
      <td className="px-3 py-4 text-center">
        <Attr cell={r.year} />
      </td>
      <td className="px-3 py-4 text-center">
        <Attr cell={r.studio} />
      </td>
      <td className="px-3 py-4 text-center">
        <Attr cell={r.source} />
      </td>
      <td className="px-3 py-4 text-center">
        <Attr cell={r.score} />
      </td>
      <td className="px-3 py-4">
        <Items items={r.genres} />
      </td>
      <td className="px-3 py-4">
        <Items items={r.tags} />
      </td>
    </tr>
  );
};

const Results = (props: { puzzle: CluePuzzle }) => {
  const guesses = props.puzzle.guesses;
  return (
    <div className="w-full min-w-0 overflow-x-auto">
      <table className="w-full min-w-[46rem] table-fixed border-collapse">
        <colgroup>
          <col className="w-[16%]" />
          <col className="w-[12%]" />
          <col className="w-[14%]" />
          <col className="w-[12%]" />
          <col className="w-[12%]" />
          <col className="w-[17%]" />
          <col className="w-[17%]" />
        </colgroup>
        <thead>
          <tr>
            {COLS.map((h, i) => (
              <th
                key={h}
                className={cn("px-3 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wide", i === 0 ? "text-left" : "text-center")}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {guesses.length === 0 ? (
            <tr>
              <td colSpan={COLS.length} className="px-3 py-12 text-center text-muted-foreground text-sm">
                Your guesses will show up here.
              </td>
            </tr>
          ) : (
            <>
              <SummaryRow guesses={guesses} />
              {[...guesses].reverse().map((g, i) => (
                <GuessRow key={`${g.animeId}-${i}`} row={g} />
              ))}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
};

const Panel = (props: { puzzle: CluePuzzle }) => {
  const { days, activeIdx, pickDay } = useDay();
  const prev = days[activeIdx + 1];
  const won = props.puzzle.status === "won";
  const a = props.puzzle.answer;
  if (!a) return null;
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-5">
        <div
          className="relative aspect-2/3 w-24 shrink-0 overflow-hidden rounded-xl bg-muted"
          style={a.coverColor ? { backgroundColor: a.coverColor } : undefined}
        >
          {a.coverSourceUrl ? <Image src={a.coverSourceUrl} alt={a.title} fill sizes="96px" className="object-cover" /> : null}
        </div>
        <div className="flex flex-col gap-1.5 text-left">
          <span className={cn("font-medium text-xs uppercase tracking-[0.08em]", won ? "text-success" : "text-destructive")}>
            {won ? "Correct" : "Out of guesses"}
          </span>
          <Link href={`/anime/${a.animeId}`} prefetch={false} className="font-semibold text-2xl tracking-tight underline-offset-4 hover:underline">
            {a.title}
          </Link>
          {a.sub ? <span className="text-muted-foreground text-sm">{a.sub}</span> : null}
        </div>
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

export const Clue = (props: { date: string }) => {
  const [puzzle, setPuzzle] = useState<CluePuzzle | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<AnimeHit | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [anonKey] = useState(() => getAnonymousKey());

  useEffect(() => {
    let active = true;
    setLoading(true);
    getPuzzle("clue", props.date, anonKey).then((p) => {
      if (!active) return;
      setPuzzle(p);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [props.date, anonKey]);

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground text-sm">Loading…</div>;
  }
  if (!puzzle) {
    return <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground text-sm">No puzzle for this day.</div>;
  }

  const over = puzzle.status !== "started";

  const submit = async () => {
    if (busy || over || !pending) return;
    const guess = pending;
    setBusy(true);
    const res = await submitGuess(puzzle.id, guess.id, guess.title, anonKey);
    setBusy(false);
    if (!res) return;
    setPending(null);
    setResetSignal((s) => s + 1);
    setPuzzle((p) => {
      if (!p || !res.guess) return p;
      return { ...p, guesses: [...p.guesses, res.guess], triesLeft: res.triesLeft, status: res.status, answer: res.answer ?? p.answer };
    });
  };

  return (
    <div className="flex flex-col items-center gap-8 pt-2">
      {over ? (
        <Panel puzzle={puzzle} />
      ) : (
        <>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-3xl tracking-tight tabular-nums">{puzzle.triesLeft}</span>
            <span className="text-muted-foreground text-sm">{puzzle.triesLeft === 1 ? "guess left" : "guesses left"}</span>
          </div>
          <div className="flex w-full max-w-md items-stretch gap-2">
            <div className="flex-1">
              <AnimeSearch
                placeholder="Type your answer here"
                resetSignal={resetSignal}
                onSelect={setPending}
                onClear={() => setPending(null)}
              />
            </div>
            <Button onClick={submit} disabled={!pending || busy}>
              Guess
            </Button>
          </div>
        </>
      )}
      <Results puzzle={puzzle} />
    </div>
  );
};

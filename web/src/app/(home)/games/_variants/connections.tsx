"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type Game } from "./shared";

type Group = { label: string; color: string; tiles: string[] };

// Difficulty order yellow to purple, the same color ladder NYT uses.
const GROUPS: Group[] = [
  { label: "Shounen", color: "#f9df6d", tiles: ["Naruto", "Bleach", "One Piece", "Fairy Tail"] },
  { label: "Space-faring", color: "#a0c35a", tiles: ["Bebop", "Trigun", "Outlaw Star", "Champloo"] },
  { label: "Key / drama", color: "#b0c4ef", tiles: ["Clannad", "Air", "Kanon", "Toradora"] },
  { label: "Mind-benders", color: "#ba81c5", tiles: ["Akira", "Ghost", "Eva", "Lain"] },
];
const ALL = GROUPS.flatMap((g) => g.tiles);

const shuffled = (arr: string[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const Board = (props: { tile: "card" | "soft" }) => {
  const [order, setOrder] = useState(ALL);
  const [selected, setSelected] = useState<string[]>([]);
  const [solvedColor, setSolvedColor] = useState<Record<string, string>>({});
  const [solvedTiles, setSolvedTiles] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState("");
  const [shake, setShake] = useState(false);

  const lost = mistakes >= 4;
  const solvedSet = new Set(solvedTiles);
  // Solved tiles float to the top so each group reads as a row, but every tile stays in place so the board height never changes.
  const display = [...solvedTiles, ...order.filter((t) => !solvedSet.has(t))];

  const toggle = (t: string) => {
    if (lost || solvedSet.has(t)) return;
    setMessage("");
    setSelected((s) => (s.includes(t) ? s.filter((x) => x !== t) : s.length < 4 ? [...s, t] : s));
  };

  const submit = () => {
    if (selected.length !== 4) return;
    const exact = GROUPS.find((g) => g.tiles.every((t) => selected.includes(t)));
    if (exact) {
      setSolvedTiles((s) => [...s, ...exact.tiles]);
      setSolvedColor((c) => ({ ...c, ...Object.fromEntries(exact.tiles.map((t) => [t, exact.color])) }));
      setSelected([]);
      setMessage("");
      return;
    }
    const oneAway = GROUPS.some((g) => selected.filter((t) => g.tiles.includes(t)).length === 3);
    setMistakes((m) => m + 1);
    setMessage(oneAway ? "One away" : "Not a group");
    setShake(true);
    setTimeout(() => setShake(false), 350);
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-3">
      <div className={cn("grid grid-cols-4 gap-2", shake && "motion-safe:animate-[wiggle_350ms_ease-in-out]")}>
        {display.map((t) => {
          const color = solvedColor[t];
          const on = selected.includes(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => toggle(t)}
              disabled={lost || Boolean(color)}
              style={color ? { backgroundColor: color } : undefined}
              className={cn(
                "flex aspect-square items-center justify-center rounded-xl px-1.5 text-center font-medium text-sm leading-tight transition-[background-color,transform] duration-150 ease-out active:scale-[0.97]",
                color && "cursor-default text-black/85",
                !color && props.tile === "card" && "bg-card shadow-[0_0_0_1px_var(--border)] hover:bg-accent",
                !color && props.tile === "soft" && "bg-muted hover:bg-accent",
                !color && on && "bg-foreground text-background shadow-none hover:bg-foreground",
                lost && !color && "opacity-60",
              )}
            >
              {t}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <span className="text-sm">
          {message ? (
            <span className="font-medium text-foreground">{message}</span>
          ) : lost ? (
            <span className="text-muted-foreground">Out of guesses</span>
          ) : (
            <span className="text-muted-foreground">{4 - mistakes} mistakes left</span>
          )}
        </span>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setOrder((o) => shuffled(o))} disabled={lost}>
            Shuffle
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected([])} disabled={selected.length === 0}>
            Deselect
          </Button>
          <Button size="sm" variant="secondary" onClick={submit} disabled={selected.length !== 4 || lost}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export const connections: Game = {
  key: "connections",
  name: "Connections",
  accent: "text-rose-500",
  tagline: "Sixteen anime, four hidden groupings, four wrong guesses before the board locks.",
  variants: [
    { id: "A", title: "Card tiles", note: "select four, shuffle, deselect, submit", Component: () => <Board tile="card" /> },
    { id: "B", title: "Soft tiles", note: "muted base, same mechanic", Component: () => <Board tile="soft" /> },
  ],
};

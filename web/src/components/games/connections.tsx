"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type Game } from "@/components/games/shared";

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

const Board = () => {
  const [order, setOrder] = useState(ALL);
  const [selected, setSelected] = useState<string[]>([]);
  const [solved, setSolved] = useState<Group[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState("");
  const [shake, setShake] = useState(false);

  const placed = new Set(solved.flatMap((g) => g.tiles));
  const board = order.filter((t) => !placed.has(t));
  const lost = mistakes >= 4;

  const toggle = (t: string) => {
    if (lost) return;
    setMessage("");
    setSelected((s) => (s.includes(t) ? s.filter((x) => x !== t) : s.length < 4 ? [...s, t] : s));
  };

  const submit = () => {
    if (selected.length !== 4) return;
    const exact = GROUPS.find((g) => g.tiles.every((t) => selected.includes(t)));
    if (exact) {
      setSolved((s) => [...s, exact]);
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
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
      <div className={cn("grid aspect-square grid-cols-4 grid-rows-4 gap-2", shake && "motion-safe:animate-[wiggle_350ms_ease-in-out]")}>
        {solved.map((g) => (
          <motion.div
            layout
            key={g.label}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="col-span-4 flex flex-col items-center justify-center gap-1 rounded-xl px-2 text-center text-black/85"
            style={{ backgroundColor: g.color }}
          >
            <span className="font-bold text-base uppercase tracking-wide">{g.label}</span>
            <span className="font-medium text-sm">{g.tiles.join(", ")}</span>
          </motion.div>
        ))}
        {board.map((t) => {
          const on = selected.includes(t);
          return (
            <motion.button
              layout
              key={t}
              type="button"
              onClick={() => toggle(t)}
              disabled={lost}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className={cn(
                "flex items-center justify-center rounded-xl px-1.5 text-center font-medium text-sm leading-tight transition-[background-color] duration-150 ease-out",
                "border border-border bg-card hover:bg-accent",
                on && "border-transparent bg-foreground text-background hover:bg-foreground",
                lost && "opacity-60",
              )}
            >
              {t}
            </motion.button>
          );
        })}
      </div>

      {board.length > 0 ? (
        <div className="flex items-center justify-between gap-3">
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
            <Button variant="ghost" onClick={() => setOrder((o) => shuffled(o))} disabled={lost}>
              Shuffle
            </Button>
            <Button variant="ghost" onClick={() => setSelected([])} disabled={selected.length === 0}>
              Deselect
            </Button>
            <Button variant="secondary" onClick={submit} disabled={selected.length !== 4 || lost}>
              Submit
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const connections: Game = {
  key: "connections",
  name: "Connections",
  accent: "text-rose-700 dark:text-rose-300",
  tagline: "Sixteen anime, four hidden groupings, four wrong guesses before the board locks.",
  variants: [{ id: "A", title: "Card tiles", note: "select four, shuffle, deselect, submit", Component: () => <Board /> }],
};

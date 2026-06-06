"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { type Game, GuessBar } from "./shared";

const CLUES = [
  { type: "Year", value: "1998" },
  { type: "Format", value: "TV" },
  { type: "Studio", value: "Sunrise" },
  { type: "Genre", value: "Space Western" },
  { type: "Episodes", value: "26" },
  { type: "Tag", value: "Bounty Hunter" },
];

// Bare columns, no boxes, no dividers, no counter. Values reveal left to right.
const Spread = (props: { stack: "label-top" | "value-top" }) => {
  const [open, setOpen] = useState(1);
  return (
    <div className="flex flex-col items-center gap-12">
      <div className="grid w-full grid-cols-3 gap-x-6 gap-y-10 sm:grid-cols-6">
        {CLUES.map((c, i) => {
          const shown = i < open;
          const label = (
            <span className="text-[11px] text-muted-foreground uppercase tracking-[0.08em]">{c.type}</span>
          );
          const value = (
            <span
              className={cn(
                "font-semibold text-lg leading-snug transition-opacity duration-200 ease-out",
                shown ? "opacity-100" : "text-muted-foreground/25",
              )}
            >
              {shown ? c.value : "—"}
            </span>
          );
          return (
            <div key={c.type} className="flex flex-col items-center gap-2 text-center">
              {props.stack === "label-top" ? (
                <>
                  {label}
                  {value}
                </>
              ) : (
                <>
                  {value}
                  {label}
                </>
              )}
            </div>
          );
        })}
      </div>
      <GuessBar onGuess={() => setOpen((o) => Math.min(o + 1, CLUES.length))} />
    </div>
  );
};

export const clue: Game = {
  key: "clue",
  name: "Clue",
  accent: "text-indigo-500",
  tagline: "One anime hides behind six progressive clues you unlock by guessing wrong.",
  variants: [
    { id: "A", title: "Label over value", note: "facet label sits above each value", Component: () => <Spread stack="label-top" /> },
    { id: "B", title: "Value over label", note: "value leads, facet label beneath", Component: () => <Spread stack="value-top" /> },
  ],
};

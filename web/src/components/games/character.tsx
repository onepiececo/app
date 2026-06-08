"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { type Game, GuessBar } from "@/components/games/shared";

const PORTRAIT = "radial-gradient(circle at 38% 32%, #c4b5fd, #6d28d9 55%, #4c1d95 100%)";
const BLURS = ["blur-2xl", "blur-xl", "blur-lg", "blur-md", "blur-sm", "blur-none"];

// Square avatar matches the sidebar's anonymous tile. The blur lifts one step per wrong guess.
const Centered = () => {
  const [step, setStep] = useState(0);
  const left = BLURS.length - 1 - step;
  return (
    <div className="flex flex-col items-center gap-5">
      <Avatar shape="square" className="size-40 overflow-hidden">
        <AvatarFallback className="p-0">
          <span
            className={cn("block size-full transition-[filter] duration-300 ease-out", BLURS[Math.min(step, BLURS.length - 1)])}
            style={{ background: PORTRAIT }}
          />
        </AvatarFallback>
      </Avatar>
      <GuessBar placeholder="Name the character" onGuess={() => setStep((s) => Math.min(s + 1, BLURS.length - 1))} />
      <span className="text-muted-foreground text-xs tabular-nums">{left} guesses left</span>
    </div>
  );
};

export const character: Game = {
  key: "character",
  name: "Character Guess",
  accent: "text-violet-700 dark:text-violet-300",
  tagline: "Name the character from a blurred portrait that clears across six chances.",
  variants: [{ id: "A", title: "Centered", note: "big square portrait, guesses left below", Component: () => <Centered /> }],
};

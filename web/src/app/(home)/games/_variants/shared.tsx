"use client";

import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Each game lives in its own file and exports a Game with several variants.
// Variants are components so they can hold their own interactive state.

export type Variant = { id: string; title: string; note: string; Component: () => ReactNode };
export type Game = { key: string; name: string; tagline: string; accent: string; variants: Variant[] };

export const ANIME = [
  { title: "Cowboy Bebop", year: 1998, color: "#b45309", pop: "412,008" },
  { title: "Attack on Titan", year: 2013, color: "#7c2d12", pop: "—" },
];

export const COVER_TEXT = "[text-shadow:_0_0_3px_rgb(0_0_0/0.95),_0_1px_3px_rgb(0_0_0/0.9)]";

// Width-capped so the field never sprawls. Enter or the button both fire onGuess.
export const GuessBar = (props: { placeholder?: string; onGuess?: () => void }) => (
  <div className="flex w-full max-w-xs items-center gap-2">
    <Input
      placeholder={props.placeholder ?? "Guess the anime"}
      className="flex-1"
      onKeyDown={(e) => {
        if (e.key === "Enter") props.onGuess?.();
      }}
    />
    <Button onClick={() => props.onGuess?.()}>Guess</Button>
  </div>
);

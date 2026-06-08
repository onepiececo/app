"use client";

import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Mock games still describe themselves as a Game so a route can render a header plus the board.
export type Variant = { id: string; title: string; note: string; Component: () => ReactNode };
export type Game = { key: string; name: string; tagline: string; accent: string; variants: Variant[] };

export const COVER_TEXT = "[text-shadow:_0_0_3px_rgb(0_0_0/0.95),_0_1px_3px_rgb(0_0_0/0.9)]";

// Width-capped so the field never sprawls. The button is disabled until something
// is typed, and the text is left in place after a guess rather than cleared.
export const GuessBar = (props: { placeholder?: string; onGuess?: () => void; disabled?: boolean }) => {
  const [value, setValue] = useState("");
  const empty = value.trim() === "";
  const fire = () => {
    if (empty || props.disabled) return;
    props.onGuess?.();
  };
  return (
    <div className="flex w-full max-w-xs items-center gap-2">
      <Input
        value={value}
        onValueChange={setValue}
        disabled={props.disabled}
        placeholder={props.placeholder ?? "Guess the anime"}
        className="flex-1"
        onKeyDown={(e) => {
          if (e.key === "Enter") fire();
        }}
      />
      <Button onClick={fire} disabled={props.disabled || empty}>Guess</Button>
    </div>
  );
};

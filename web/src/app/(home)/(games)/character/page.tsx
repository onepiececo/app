"use client";

import { cn } from "@/lib/utils";
import { character } from "@/components/games/character";

export default function CharacterPage() {
  const Body = character.variants[0].Component;
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h1 className={cn("font-semibold text-2xl tracking-tight", character.accent)}>{character.name}</h1>
        <p className="text-muted-foreground text-sm">{character.tagline}</p>
      </div>
      <div className="pt-2">
        <Body />
      </div>
    </>
  );
}

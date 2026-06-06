"use client";

import { useState } from "react";
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle";
import { GAMES } from "./_variants";

// Game picker and variant switcher sit on the title row, matching the anime
// database header. No bordered bar, no game name floating top left.

export default function GamesPage() {
  const [gameKey, setGameKey] = useState(GAMES[0].key);
  const [variantId, setVariantId] = useState("A");

  const game = GAMES.find((g) => g.key === gameKey) ?? GAMES[0];
  const variant = game.variants.find((v) => v.id === variantId) ?? game.variants[0];

  const pickGame = (k: string) => {
    setGameKey(k);
    setVariantId("A");
  };

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <div className="flex h-8 items-center justify-between gap-3">
          <h1 className="font-semibold text-2xl text-foreground leading-none tracking-tight">Games</h1>
          <div className="flex items-center gap-2">
            <ToggleGroup value={[variantId]} onValueChange={(v) => setVariantId(v?.[0] ?? "A")} size="sm">
              {game.variants.map((v) => (
                <ToggleGroupItem key={v.id} value={v.id}>{v.id}</ToggleGroupItem>
              ))}
            </ToggleGroup>
            <Select value={gameKey} onValueChange={(v) => pickGame(v as string)}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectPopup>
                {GAMES.map((g) => <SelectItem key={g.key} value={g.key}>{g.name}</SelectItem>)}
              </SelectPopup>
            </Select>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">{game.tagline}</p>
      </div>

      <div className="mx-auto w-full max-w-2xl pt-4">
        <variant.Component />
      </div>
    </>
  );
}

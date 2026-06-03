"use server";

import type { GameTone } from "@/components/game-tile";
import { serverJSON } from "@/lib/server-api";

export type DailyGame = {
  key: string;
  name: string;
  tone: GameTone;
  tagline: string;
  available: boolean;
};

// Web-side catalog carries the tone + tagline. The Go-owned `game` table is
// the canonical registry — when an unshipped game lands there, its name gets
// pulled in automatically here.
const META: Array<Omit<DailyGame, "available">> = [
  { key: "clue", name: "Clue", tone: "indigo", tagline: "One anime hides behind six progressive clues you unlock by guessing wrong." },
  { key: "wordle", name: "Wordle", tone: "emerald", tagline: "Any anime works, the grid colors how close yours is across seven facets." },
  { key: "higherlower", name: "Higher or Lower", tone: "amber", tagline: "Two anime, one metric, call which scores higher before the timer ends." },
  { key: "connections", name: "Connections", tone: "rose", tagline: "Sixteen anime, four hidden groupings, four wrong guesses before the board locks." },
  { key: "coverblur", name: "Cover Blur", tone: "sky", tagline: "A heavily blurred cover sharpens one notch with every wrong guess." },
  { key: "character", name: "Character Guess", tone: "violet", tagline: "Name the character from a blurred portrait that clears across six chances." },
  { key: "synopsis", name: "Reverse Synopsis", tone: "cyan", tagline: "Read the plot with character names redacted, then name the show." },
  { key: "mash", name: "Anime Mash", tone: "pink", tagline: "A portmanteau title hides two source anime, name both to clear." },
  { key: "wavelength", name: "Wavelength", tone: "fuchsia", tagline: "Slide between two extremes to land where today's anime really sits on the scale." },
];

type ServerGame = { id: string; name: string; description: string; isActive: boolean };
type ServerDays = { dates: string[] };

export async function getDailyGames(_iso: string): Promise<DailyGame[]> {
  const rows = await serverJSON<ServerGame[]>("/v1/games").catch(() => [] as ServerGame[]);
  const byId = new Map(rows.map((r) => [r.id, r.name]));
  return META.map((m) => ({
    ...m,
    name: byId.get(m.key) ?? m.name,
    available: true,
  }));
}

export async function getAvailableDays(limit = 30, before?: string): Promise<string[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (before) params.set("before", before);
  const res = await serverJSON<ServerDays>(`/v1/days?${params.toString()}`).catch(() => null);
  return res?.dates ?? [];
}

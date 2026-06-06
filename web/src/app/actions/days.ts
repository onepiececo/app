"use server";

import { serverJSON } from "@/lib/server-api";

export type DailyGame = {
  key: string;
  name: string;
  className: string;
  tagline: string;
  available: boolean;
};

const GAMES: Array<Omit<DailyGame, "available">> = [
  { key: "clue", name: "Clue", className: "text-indigo-700 hover:bg-indigo-500/8 dark:text-indigo-300", tagline: "One anime hides behind six progressive clues you unlock by guessing wrong." },
  { key: "wordle", name: "Wordle", className: "text-emerald-700 hover:bg-emerald-500/8 dark:text-emerald-300", tagline: "Any anime works, the grid colors how close yours is across seven facets." },
  { key: "higherlower", name: "Higher or Lower", className: "text-amber-800 hover:bg-amber-500/8 dark:text-amber-300", tagline: "Two anime, one metric, call which scores higher before the timer ends." },
  { key: "connections", name: "Connections", className: "text-rose-700 hover:bg-rose-500/8 dark:text-rose-300", tagline: "Sixteen anime, four hidden groupings, four wrong guesses before the board locks." },
  { key: "coverblur", name: "Cover Blur", className: "text-sky-700 hover:bg-sky-500/8 dark:text-sky-300", tagline: "A heavily blurred cover sharpens one notch with every wrong guess." },
  { key: "character", name: "Character Guess", className: "text-violet-700 hover:bg-violet-500/8 dark:text-violet-300", tagline: "Name the character from a blurred portrait that clears across six chances." },
  { key: "synopsis", name: "Reverse Synopsis", className: "text-cyan-700 hover:bg-cyan-500/8 dark:text-cyan-300", tagline: "Read the plot with character names redacted, then name the show." },
  { key: "mash", name: "Anime Mash", className: "text-pink-700 hover:bg-pink-500/8 dark:text-pink-300", tagline: "A portmanteau title hides two source anime, name both to clear." },
  { key: "wavelength", name: "Wavelength", className: "text-fuchsia-700 hover:bg-fuchsia-500/8 dark:text-fuchsia-300", tagline: "Slide between two extremes to land where today's anime really sits on the scale." },
];

type ServerGame = { id: string; name: string; description: string; isActive: boolean };
type ServerDays = { dates: string[] };

export async function getDailyGames(_iso: string): Promise<DailyGame[]> {
  const rows = await serverJSON<ServerGame[]>("/v1/games").catch(() => [] as ServerGame[]);
  const byId = new Map(rows.map((r) => [r.id, r.name]));
  return GAMES.map((g) => ({
    ...g,
    name: byId.get(g.key) ?? g.name,
    available: true,
  }));
}

// Returns null when the API is unreachable, an array (possibly empty) when it answered.
export async function getAvailableDays(limit = 30, before?: string): Promise<string[] | null> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (before) params.set("before", before);
  const res = await serverJSON<ServerDays>(`/v1/days?${params.toString()}`).catch(() => null);
  return res === null ? null : res.dates;
}

"use server";

import { serverJSON } from "@/lib/server-api";

export type DailyGame = {
  key: string;
  name: string;
  className: string;
  accent: string;
  tagline: string;
  available: boolean;
  href?: string;
};

type Presentation = { className: string; accent: string; href?: string };

// The roster, names, and taglines come from the game table, only the tone and route stay client side.
const PRESENTATION: Record<string, Presentation> = {
  clue: { className: "text-indigo-700 hover:bg-indigo-500/8 dark:text-indigo-300", accent: "text-indigo-700 dark:text-indigo-300", href: "/clue" },
  cover: { className: "text-sky-700 hover:bg-sky-500/8 dark:text-sky-300", accent: "text-sky-700 dark:text-sky-300" },
  character: { className: "text-violet-700 hover:bg-violet-500/8 dark:text-violet-300", accent: "text-violet-700 dark:text-violet-300" },
  higherlower: { className: "text-amber-800 hover:bg-amber-500/8 dark:text-amber-300", accent: "text-amber-800 dark:text-amber-300", href: "/higherlower" },
  groups: { className: "text-rose-700 hover:bg-rose-500/8 dark:text-rose-300", accent: "text-rose-700 dark:text-rose-300" },
  timeline: { className: "text-emerald-700 hover:bg-emerald-500/8 dark:text-emerald-300", accent: "text-emerald-700 dark:text-emerald-300" },
  dial: { className: "text-fuchsia-700 hover:bg-fuchsia-500/8 dark:text-fuchsia-300", accent: "text-fuchsia-700 dark:text-fuchsia-300" },
};

const ORDER = Object.keys(PRESENTATION);
const FALLBACK: Presentation = { className: "text-foreground hover:bg-muted/25", accent: "text-foreground" };

type ServerGame = { id: string; name: string; description: string; mode: string; isActive: boolean };
type ServerDays = { dates: string[] };

// Tiles render in the curated order above and anything the catalog adds beyond it falls to the end.
export async function getDailyGames(_iso: string): Promise<DailyGame[]> {
  const rows = await serverJSON<ServerGame[]>("/v1/games").catch(() => [] as ServerGame[]);
  const rank = (id: string) => {
    const i = ORDER.indexOf(id);
    return i < 0 ? ORDER.length : i;
  };
  return rows
    .map((row) => {
      const pres = PRESENTATION[row.id] ?? FALLBACK;
      return {
        key: row.id,
        name: row.name,
        tagline: row.description,
        className: pres.className,
        accent: pres.accent,
        href: pres.href,
        available: Boolean(pres.href),
      };
    })
    .sort((a, b) => rank(a.key) - rank(b.key));
}

export async function getGame(key: string): Promise<DailyGame | undefined> {
  const games = await getDailyGames("");
  return games.find((g) => g.key === key);
}

// Returns null when the API is unreachable, an array (possibly empty) when it answered.
export async function getAvailableDays(limit = 30, before?: string): Promise<string[] | null> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (before) params.set("before", before);
  const res = await serverJSON<ServerDays>(`/v1/days?${params.toString()}`).catch(() => null);
  return res === null ? null : res.dates;
}

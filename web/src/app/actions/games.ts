"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { serverJSON } from "@/lib/server-api";

export type FieldCmp = { text: string; status: "hit" | "miss"; arrow?: "up" | "down" };
export type ItemCmp = { text: string; status: "hit" | "miss" };
export type GuessCompare = {
  animeId: number;
  title: string;
  correct: boolean;
  year: FieldCmp;
  studio: FieldCmp;
  source: FieldCmp;
  score: FieldCmp;
  genres: ItemCmp[];
  tags: ItemCmp[];
};
export type ClueAnswer = {
  animeId: number;
  title: string;
  coverSourceUrl?: string;
  coverColor?: string;
  sub: string;
};
export type PuzzleStatus = "started" | "won" | "lost";

export type CluePuzzle = {
  id: number;
  game: string;
  date: string;
  status: PuzzleStatus;
  triesLeft: number;
  budget: number;
  categories: string[];
  guesses: GuessCompare[];
  answer?: ClueAnswer;
};

export type GuessResult = {
  correct: boolean;
  triesLeft: number;
  status: PuzzleStatus;
  guess?: GuessCompare;
  answer?: ClueAnswer;
};

// identity routes a signed in player to their bearer token and a signed out player to the anonymous key.
async function identity(anonKey: string): Promise<{ anonKey?: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session ? {} : { anonKey };
  } catch {
    return { anonKey };
  }
}

export type ClueDayStatus = { date: string; status: "in_progress" | "won" | "lost" };

// Read only per day standing for the home grid, the identity helper picks the bearer token or the anon key.
export async function getClueStatuses(game: string, anonKey: string): Promise<ClueDayStatus[]> {
  return serverJSON<ClueDayStatus[]>(`/v1/puzzles/statuses?game=${game}`, await identity(anonKey)).catch(() => []);
}

export async function getPuzzle(game: string, date: string | undefined, anonKey: string): Promise<CluePuzzle | null> {
  const params = new URLSearchParams({ game });
  if (date) params.set("date", date);
  return serverJSON<CluePuzzle>(`/v1/puzzles?${params.toString()}`, await identity(anonKey)).catch(() => null);
}

export async function submitGuess(puzzleId: number, animeId: number, title: string, anonKey: string): Promise<GuessResult | null> {
  return serverJSON<GuessResult>(`/v1/puzzles/${puzzleId}/guess`, {
    method: "POST",
    body: JSON.stringify({ animeId, title }),
    ...(await identity(anonKey)),
  }).catch(() => null);
}

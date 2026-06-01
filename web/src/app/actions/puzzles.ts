"use server";

import { serverFetch, serverJSON } from "@/lib/server-api";

// Match the Go shapes returned by /v1/puzzles/today, /guesses, /complete.
export type Puzzle = {
  id: number;
  gameId: string;
  puzzleDate?: string;
  payload: {
    game: string;
    maxGuesses: number;
    [key: string]: unknown;
  };
};

export type ScoreBreakdown = {
  base: number;
  multiplier: number;
  speedBonus: number;
  tier: string;
  total: number;
};

export type Attempt = {
  id: number;
  status: "started" | "won" | "lost";
  score: number;
  guessesCount: number;
  breakdown?: ScoreBreakdown;
};

export type PriorGuess = {
  position: number;
  rawGuess: string;
  result: {
    correct: boolean;
    status: string;
    detail?: Record<string, unknown>;
    nextClue?: { answer?: string; slug?: string };
  };
};

export type TodayResponse = {
  puzzle: Puzzle;
  attempt?: Attempt;
  guesses?: PriorGuess[];
};

export type GuessResultResp = {
  correct: boolean;
  status: "started" | "won" | "lost";
  guessesLeft: number;
  detail?: Record<string, unknown>;
  nextClue?: { answer?: string; slug?: string };
};

type Ok<T> = { success: true } & T;
type Err = { success: false; error: string };

// getTodayPuzzle pulls the puzzle for the active player (or anonymous via key).
// Server actions can be called both from server components for SSR and from client onMount.
export async function getTodayPuzzle(game: string, anonKey?: string): Promise<Ok<{ data: TodayResponse }> | Err> {
  try {
    const data = await serverJSON<TodayResponse>(
      `/v1/puzzles/today?game=${encodeURIComponent(game)}`,
      anonKey ? { anonKey } : undefined,
    );
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "failed to load puzzle" };
  }
}

export async function submitGuess(
  puzzleId: number,
  rawGuess: string,
  animeId: number | null,
  anonKey?: string,
): Promise<Ok<{ result: GuessResultResp }> | Err> {
  try {
    const res = await serverFetch(`/v1/puzzles/${puzzleId}/guesses`, {
      method: "POST",
      body: JSON.stringify({ rawGuess, animeId }),
      anonKey,
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string };
      return { success: false, error: typeof body.message === "string" ? body.message : `server returned ${res.status}` };
    }
    const result = (await res.json()) as GuessResultResp;
    return { success: true, result };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "guess failed" };
  }
}

export async function completePuzzle(puzzleId: number, anonKey?: string): Promise<Ok<{ status: string }> | Err> {
  try {
    const res = await serverFetch(`/v1/puzzles/${puzzleId}/complete`, {
      method: "POST",
      anonKey,
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string };
      return { success: false, error: typeof body.message === "string" ? body.message : `server returned ${res.status}` };
    }
    const body = (await res.json()) as { status: string };
    return { success: true, status: body.status };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "complete failed" };
  }
}

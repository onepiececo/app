"use server";

import { serverJSON } from "@/lib/server-api";

export type AnimeHit = {
  id: number;
  slug: string;
  title: string;
  year?: number;
  score?: number;
  coverSourceUrl?: string;
  coverColor?: string;
  cursor?: string;
};

export type AnimeSort = "title" | "popularity" | "year" | "score";

export async function browseAnime(
  sort: AnimeSort = "title",
  limit = 50,
  after?: string,
  format = "all",
): Promise<AnimeHit[]> {
  const params = new URLSearchParams({ sort, limit: String(limit) });
  if (after) params.set("after", after);
  if (format && format !== "all") params.set("format", format);
  return serverJSON<AnimeHit[]>(`/v1/anime/browse?${params.toString()}`).catch(() => []);
}

export async function searchAnime(q: string, format = "all", limit = 50): Promise<AnimeHit[]> {
  if (!q.trim()) return [];
  const params = new URLSearchParams({ q, limit: String(limit) });
  if (format && format !== "all") params.set("format", format);
  return serverJSON<AnimeHit[]>(`/v1/anime?${params.toString()}`).catch(() => []);
}

export async function getAnimeCount(): Promise<number> {
  const res = await serverJSON<{ count: number }>("/v1/anime/count").catch(() => null);
  return res?.count ?? 0;
}

export type AnimeAlias = { alias: string; source: string };
export type AnimeTag = { name: string; category?: string; rank?: number; isSpoiler: boolean };
export type AnimeStudio = { name: string; isMain: boolean };
export type AnimeRelation = {
  relationType: string;
  animeId?: number;
  title?: string;
  slug?: string;
  coverSourceUrl?: string;
  seasonYear?: number;
  externalSource?: string;
  externalId?: string;
};
export type AnimeCharacter = {
  id: number;
  name: string;
  native?: string;
  imageUrl?: string;
  role: "MAIN" | "SUPPORTING" | "BACKGROUND";
};

export type AnimeDetail = {
  id: number;
  slug: string;
  titlePrimary: string;
  titleRomaji?: string;
  titleEnglish?: string;
  titleNative?: string;
  format?: string;
  status?: string;
  source?: string;
  season?: string;
  seasonYear?: number;
  episodes?: number;
  durationMinutes?: number;
  averageScore?: number;
  meanScore?: number;
  popularity: number;
  isAdult: boolean;
  isGameEligible: boolean;
  coverSourceUrl?: string;
  bannerSourceUrl?: string;
  coverColor?: string;
  aliases?: AnimeAlias[];
  genres?: string[];
  tags?: AnimeTag[];
  studios?: AnimeStudio[];
  relations?: AnimeRelation[];
  characters?: AnimeCharacter[];
};

export async function getAnimeById(id: number): Promise<AnimeDetail | null> {
  return serverJSON<AnimeDetail>(`/v1/anime/by-id/${id}`).catch(() => null);
}

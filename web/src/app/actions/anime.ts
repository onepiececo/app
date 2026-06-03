"use server";

import { serverJSON } from "@/lib/server-api";

export type AnimeHit = {
  id: number;
  slug: string;
  title: string;
  year?: number;
  score?: number;
};

export type AnimeSort = "title" | "popularity" | "year" | "score";

export async function browseAnime(
  sort: AnimeSort = "title",
  limit = 50,
  offset = 0,
): Promise<AnimeHit[]> {
  const params = new URLSearchParams({
    sort,
    limit: String(limit),
    offset: String(offset),
  });
  return serverJSON<AnimeHit[]>(`/v1/anime/browse?${params.toString()}`).catch(() => []);
}

export async function searchAnime(q: string, limit = 50): Promise<AnimeHit[]> {
  if (!q.trim()) return [];
  const params = new URLSearchParams({ q, limit: String(limit) });
  return serverJSON<AnimeHit[]>(`/v1/anime?${params.toString()}`).catch(() => []);
}

export async function getAnimeCount(): Promise<number> {
  const res = await serverJSON<{ count: number }>("/v1/anime/count").catch(() => null);
  return res?.count ?? 0;
}

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
  favourites: number;
  isAdult: boolean;
  isGameEligible: boolean;
  coverSourceUrl?: string;
  bannerSourceUrl?: string;
  coverColor?: string;
};

export async function getAnimeById(id: number): Promise<AnimeDetail | null> {
  return serverJSON<AnimeDetail>(`/v1/anime/by-id/${id}`).catch(() => null);
}

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

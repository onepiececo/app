"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type AnimeCharacter, type AnimeHit, browseAnime, getAnimeById } from "@/app/actions/anime";

type PreviewData = { covers: AnimeHit[]; character: AnimeCharacter | null };
const PreviewDataContext = createContext<PreviewData>({ covers: [], character: null });

export const usePreviewData = () => useContext(PreviewDataContext);

// Fetches the shared popular pool and one main character a single time so the day sections stop refetching per copy.
export const PreviewDataProvider = (props: { children: ReactNode }) => {
  const [covers, setCovers] = useState<AnimeHit[]>([]);
  const [character, setCharacter] = useState<AnimeCharacter | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const list = await browseAnime("popularity", 30);
      if (!active) return;
      setCovers(list);
      for (const a of list) {
        const detail = await getAnimeById(a.id);
        const cands = detail?.characters?.filter((c) => c.imageUrl) ?? [];
        const main = cands.find((c) => c.role === "MAIN") ?? cands[0];
        if (main) {
          if (active) setCharacter(main);
          return;
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return <PreviewDataContext value={{ covers, character }}>{props.children}</PreviewDataContext>;
};

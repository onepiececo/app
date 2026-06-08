"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { browseAnime, type AnimeHit } from "@/app/actions/anime";
import { Button } from "@/components/ui/button";
import { CoverWall } from "@/components/cover-wall";

// Poster layout, the cover wall fills the screen behind oversized type with a flat even dim so the message stays readable.
export const NotFoundView = () => {
  const [covers, setCovers] = useState<AnimeHit[]>([]);

  useEffect(() => {
    browseAnime("popularity", 72)
      .then((hits) => setCovers(hits.filter((a) => a.coverSourceUrl)))
      .catch(() => {});
  }, []);

  return (
    <main className="relative flex min-h-dvh w-full flex-1 items-center justify-center overflow-hidden bg-background text-foreground">
      <CoverWall covers={covers} columns={11} perColumn={6} edgeFade />
      <div className="pointer-events-none absolute inset-0 bg-black/55" aria-hidden />
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        <span className="font-bold text-7xl text-white/90 tracking-tight sm:text-8xl">404</span>
        <div className="flex flex-col gap-2">
          <h1 className="font-semibold text-2xl text-white tracking-tight">Page not found</h1>
          <p className="max-w-sm text-sm text-white/70">
            That route does not exist. Head back to the home rail or the anime database.
          </p>
        </div>
        <Button variant="secondary" render={<Link href="/" />}>
          Back to home
        </Button>
      </div>
    </main>
  );
};

"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { browseAnime, type AnimeHit, type AnimeSort } from "@/app/actions/anime";
import { AnimeGrid } from "@/components/anime-grid";

export type AnimeBrowserProps = {
  initialAnime: AnimeHit[];
  sort: AnimeSort;
  total: number;
  pageSize: number;
};

export const AnimeBrowser = (props: AnimeBrowserProps) => {
  const [items, setItems] = useState<AnimeHit[]>(props.initialAnime);
  const [loading, setLoading] = useState(false);
  const [exhausted, setExhausted] = useState(props.initialAnime.length >= props.total);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const sortRef = useRef(props.sort);

  // Re-seed when the sort URL param changes. The page re-renders with a fresh
  // initialAnime slice for the new sort, so reset state to match.
  useEffect(() => {
    if (sortRef.current === props.sort) {
      setItems(props.initialAnime);
      setExhausted(props.initialAnime.length >= props.total);
      return;
    }
    sortRef.current = props.sort;
    setItems(props.initialAnime);
    setExhausted(props.initialAnime.length >= props.total);
  }, [props.sort, props.initialAnime, props.total]);

  useEffect(() => {
    if (exhausted) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (loading || exhausted) return;
        setLoading(true);
        browseAnime(props.sort, props.pageSize, items.length)
          .then((next) => {
            if (next.length === 0) {
              setExhausted(true);
              return;
            }
            setItems((prev) => {
              const seen = new Set(prev.map((a) => a.id));
              const merged = [...prev, ...next.filter((a) => !seen.has(a.id))];
              if (merged.length >= props.total) setExhausted(true);
              return merged;
            });
          })
          .finally(() => setLoading(false));
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [items.length, loading, exhausted, props.sort, props.pageSize, props.total]);

  return (
    <>
      <AnimeGrid anime={items} query="" />
      {!exhausted ? (
        <div
          ref={sentinelRef}
          className="flex items-center justify-center px-6 py-8 text-muted-foreground text-sm"
        >
          {loading ? <Loader2 className="size-5 animate-spin" /> : null}
        </div>
      ) : (
        <div className="px-6 py-8 text-center text-muted-foreground text-xs">
          End of catalog
        </div>
      )}
    </>
  );
};

"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { browseAnime, type AnimeHit, type AnimeSort } from "@/app/actions/anime";
import { AnimeGrid } from "@/components/anime-grid";

export type AnimeBrowserProps = {
  initialAnime: AnimeHit[];
  sort: AnimeSort;
  format: string;
  total: number;
  pageSize: number;
};

export const AnimeBrowser = (props: AnimeBrowserProps) => {
  const [items, setItems] = useState<AnimeHit[]>(props.initialAnime);
  const [loading, setLoading] = useState(false);
  const [exhausted, setExhausted] = useState(props.initialAnime.length >= props.total);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const sortRef = useRef(props.sort);
  const formatRef = useRef(props.format);

  // Reads from inside the observer callback so it stays mounted across fetches.
  const stateRef = useRef({ loading, exhausted });
  stateRef.current = { loading, exhausted };

  // Tags each fetch so a stale resolution from a prior sort or format bails out.
  const tokenRef = useRef(0);

  useEffect(() => {
    if (sortRef.current === props.sort && formatRef.current === props.format) return;
    sortRef.current = props.sort;
    formatRef.current = props.format;
    tokenRef.current++;
    setItems(props.initialAnime);
    setExhausted(props.initialAnime.length >= props.total);
    setLoading(false);
  }, [props.sort, props.format, props.initialAnime, props.total]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        const live = stateRef.current;
        if (live.loading || live.exhausted) return;
        const token = ++tokenRef.current;
        setLoading(true);
        browseAnime(props.sort, props.pageSize, items[items.length - 1]?.cursor, props.format)
          .then((next) => {
            if (token !== tokenRef.current) return;
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
          .finally(() => {
            if (token === tokenRef.current) setLoading(false);
          });
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [items.length, props.sort, props.format, props.pageSize, props.total]);

  return (
    <>
      <AnimeGrid anime={items} query="" />
      {!exhausted ? (
        <div
          ref={sentinelRef}
          className="flex items-center justify-center py-8 text-muted-foreground text-sm"
        >
          {loading ? <Loader2 className="size-5 animate-spin" /> : null}
        </div>
      ) : null}
    </>
  );
};

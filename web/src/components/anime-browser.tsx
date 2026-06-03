"use client";

import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import Link from "next/link";
import { browseAnime, searchAnime, type AnimeHit, type AnimeSort } from "@/app/actions/anime";
import { Input, InputGroup, InputGroupAddon } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SORT_OPTIONS: { value: AnimeSort; label: string }[] = [
  { value: "title", label: "A to Z" },
  { value: "popularity", label: "Most popular" },
  { value: "year", label: "Newest" },
  { value: "score", label: "Highest scored" },
];

export type AnimeBrowserProps = {
  initialAnime: AnimeHit[];
  initialSort: AnimeSort;
};

export const AnimeBrowser = (props: AnimeBrowserProps) => {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<AnimeSort>(props.initialSort);
  const [results, setResults] = useState<AnimeHit[]>(props.initialAnime);
  const [loading, setLoading] = useState(false);

  // Debounce — 300ms after the last keystroke (or sort change) before firing
  // the search or browse. Loading flips on at the start of the effect run so
  // the magnifier swaps to the spinner from the first keystroke through the
  // response landing, then flips back.
  useEffect(() => {
    setLoading(true);
    let cancelled = false;
    const handle = setTimeout(() => {
      const trimmed = query.trim();
      const promise = trimmed.length === 0
        ? browseAnime(sort)
        : searchAnime(trimmed, 50);
      promise
        .then((data) => {
          if (!cancelled) setResults(data);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query, sort]);

  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-10 flex flex-col gap-4 border-border border-b bg-sidebar px-6 py-5">
        <h1 className="font-semibold text-foreground text-lg tracking-tight">Anime Database</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
          <InputGroup className="flex-1">
            <InputGroupAddon align="inline-start">
              {loading ? <Loader2 className="animate-spin" /> : <Search />}
            </InputGroupAddon>
            <Input
              unstyled
              type="search"
              value={query}
              onValueChange={setQuery}
              placeholder="Search anime by title or alias"
              aria-label="Search anime"
            />
          </InputGroup>
          <Select value={sort} onValueChange={(v) => setSort(v as AnimeSort)}>
            <SelectTrigger size="default" className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectPopup>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
        </div>
      </header>
      {results.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-6 py-16 text-muted-foreground text-sm">
          {query.trim().length > 0 ? "No anime match that search." : "No anime in the catalog yet."}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-px bg-border md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((a) => (
            <li key={a.id} className="bg-background">
              <Link
                href={`/anime/${a.slug}`}
                prefetch={false}
                className="group flex aspect-[5/3] w-full flex-col justify-end gap-2 bg-muted/40 p-5 outline-none transition-colors duration-150 ease-out hover:bg-muted/60 focus-visible:bg-muted/60"
              >
                <div className="flex items-baseline justify-between gap-2 text-muted-foreground text-xs uppercase tracking-wider">
                  {a.year ? <span className="tabular-nums">{a.year}</span> : <span />}
                  {a.score && a.score > 0 ? (
                    <span className="tabular-nums">{Math.round(a.score)}</span>
                  ) : null}
                </div>
                <span className="line-clamp-3 font-semibold text-base text-foreground leading-snug">
                  {a.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

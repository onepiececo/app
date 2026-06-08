"use client";

import { useEffect, useState } from "react";
import { type AnimeHit, browseAnime, searchAnime } from "@/app/actions/anime";
import {
  Autocomplete,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
} from "@/components/ui/autocomplete";

export type AnimeSearchProps = {
  onSelect: (hit: AnimeHit) => void;
  onClear?: () => void;
  placeholder?: string;
  // Bump to clear the input from the parent, e.g. after a guess is submitted.
  resetSignal?: number;
};

// Shared anime picker, it browses alphabetically on focus and searches as you type, same as the database page.
export const AnimeSearch = (props: AnimeSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AnimeHit[]>([]);
  const [selected, setSelected] = useState<AnimeHit | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery("");
    setSelected(null);
    setOpen(false);
  }, [props.resetSignal]);

  useEffect(() => {
    const q = query.trim();
    let active = true;
    const load = () => {
      const p = q.length === 0 ? browseAnime("title", 8) : searchAnime(q, "all", 8);
      p.then((r) => {
        if (active) setResults(r);
      });
    };
    const t = setTimeout(load, q.length === 0 ? 0 : 200);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query]);

  return (
    <Autocomplete
      items={results}
      value={query}
      open={open}
      onOpenChange={setOpen}
      onValueChange={(v) => {
        setQuery(v);
        if (selected && v !== selected.title) {
          setSelected(null);
          props.onClear?.();
        }
      }}
      filter={() => true}
      itemToStringValue={(a: AnimeHit) => a.title}
    >
      <AutocompleteInput
        placeholder={props.placeholder ?? "Search anime"}
        aria-label="Search anime"
        onFocus={() => setOpen(true)}
      />
      <AutocompletePopup>
        <AutocompleteEmpty>{query.trim().length > 0 ? "No matches" : "Loading…"}</AutocompleteEmpty>
        <AutocompleteList>
          {(a: AnimeHit) => (
            <AutocompleteItem
              key={a.id}
              value={a}
              onClick={() => {
                setSelected(a);
                setQuery(a.title);
                props.onSelect(a);
              }}
            >
              {a.title}
            </AutocompleteItem>
          )}
        </AutocompleteList>
      </AutocompletePopup>
    </Autocomplete>
  );
};

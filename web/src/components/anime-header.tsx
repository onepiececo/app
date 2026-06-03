"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { AnimeSort } from "@/app/actions/anime";
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

export type AnimeHeaderProps = {
  currentQuery: string;
  currentSort: AnimeSort;
  total: number;
};

export const AnimeHeader = (props: AnimeHeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(props.currentQuery);
  const [sort, setSort] = useState<AnimeSort>(props.currentSort);
  const [debouncing, setDebouncing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isFirstRun = useRef(true);

  // Sync local state when external navigation moves the URL.
  useEffect(() => {
    setValue(props.currentQuery);
  }, [props.currentQuery]);
  useEffect(() => {
    setSort(props.currentSort);
  }, [props.currentSort]);

  // Debounce keystrokes, then push the new query/sort into the URL. The
  // server page receives the updated searchParams and re-fetches; the
  // useTransition wraps that navigation so isPending stays true through
  // the server roundtrip.
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    setDebouncing(true);
    const handle = setTimeout(() => {
      setDebouncing(false);
      const params = new URLSearchParams();
      const trimmed = value.trim();
      if (trimmed) params.set("q", trimmed);
      if (sort !== "title") params.set("sort", sort);
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    }, 300);
    return () => clearTimeout(handle);
  }, [value, sort, pathname, router]);

  const loading = debouncing || isPending;

  return (
    <header className="sticky top-0 z-10 flex flex-col gap-4 border-border border-b bg-sidebar px-6 py-5">
      <h1 className="font-semibold text-foreground text-lg tracking-tight">
        Anime Database{" "}
        <span className="font-normal text-muted-foreground tabular-nums">
          ({props.total.toLocaleString()})
        </span>
      </h1>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
        <InputGroup className="!bg-background flex-1 dark:!bg-[color-mix(in_srgb,var(--foreground)_2%,var(--background))]">
          <InputGroupAddon align="inline-start">
            {loading ? <Loader2 className="animate-spin" /> : <Search />}
          </InputGroupAddon>
          <Input
            unstyled
            type="search"
            value={value}
            onValueChange={setValue}
            placeholder="Search anime by title or alias"
            aria-label="Search anime"
          />
        </InputGroup>
        <Select value={sort} onValueChange={(v) => setSort(v as AnimeSort)}>
          <SelectTrigger size="sm" className="w-full min-h-8.5 sm:w-48 sm:min-h-7.5">
            <SelectValue>
              {(v) => SORT_OPTIONS.find((o) => o.value === v)?.label ?? "Sort"}
            </SelectValue>
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
  );
};

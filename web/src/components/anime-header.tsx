"use client";

import { useEffect, useState, useTransition } from "react";
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
import { useDebouncedValue } from "@/hooks/use-debounced-value";

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
  const [isPending, startTransition] = useTransition();
  const debouncedValue = useDebouncedValue(value, 300);

  useEffect(() => {
    setValue(props.currentQuery);
  }, [props.currentQuery]);
  useEffect(() => {
    setSort(props.currentSort);
  }, [props.currentSort]);

  useEffect(() => {
    const trimmed = debouncedValue.trim();
    if (trimmed === props.currentQuery && sort === props.currentSort) return;
    const params = new URLSearchParams();
    if (trimmed) params.set("q", trimmed);
    if (sort !== "title") params.set("sort", sort);
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }, [debouncedValue, sort, props.currentQuery, props.currentSort, pathname, router]);

  const loading = value !== debouncedValue || isPending;

  return (
    <header className="sticky top-0 z-10 flex flex-col gap-5 border-border border-b bg-sidebar px-6 py-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-2xl text-foreground tracking-tight">
          Anime Database
        </h1>
        <p className="text-muted-foreground text-sm tabular-nums">
          {props.total.toLocaleString()} titles
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
        <InputGroup className="bg-background! flex-1 dark:bg-[color-mix(in_srgb,var(--foreground)_2%,var(--background))]!">
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

"use client";

import { useEffect, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { AnimeSort } from "@/app/actions/anime";
import { Input, InputGroup, InputGroupAddon } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const SORT_OPTIONS: { value: AnimeSort; label: string }[] = [
  { value: "title", label: "A to Z" },
  { value: "popularity", label: "Popular" },
  { value: "year", label: "Newest" },
  { value: "score", label: "Top rated" },
];

// Values match the format column in the anime table so the Go endpoint can
// filter on equality, labels stay friendly for display.
const FORMAT_OPTIONS = [
  { value: "all", label: "All" },
  { value: "TV", label: "TV" },
  { value: "MOVIE", label: "Movie" },
  { value: "ONA", label: "ONA" },
  { value: "OVA", label: "OVA" },
];

export type AnimeHeaderProps = {
  currentQuery: string;
  currentSort: AnimeSort;
  currentFormat: string;
  total: number;
};

export const AnimeHeader = (props: AnimeHeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(props.currentQuery);
  const [sort, setSort] = useState<AnimeSort>(props.currentSort);
  const [format, setFormat] = useState(props.currentFormat);
  const [, startTransition] = useTransition();
  const debouncedValue = useDebouncedValue(value, 300);

  useEffect(() => {
    setValue(props.currentQuery);
  }, [props.currentQuery]);
  useEffect(() => {
    setSort(props.currentSort);
  }, [props.currentSort]);
  useEffect(() => {
    setFormat(props.currentFormat);
  }, [props.currentFormat]);

  useEffect(() => {
    const trimmed = debouncedValue.trim();
    if (
      trimmed === props.currentQuery &&
      sort === props.currentSort &&
      format === props.currentFormat
    ) return;
    const params = new URLSearchParams();
    if (trimmed) params.set("q", trimmed);
    if (sort !== "title") params.set("sort", sort);
    if (format !== "all") params.set("format", format);
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }, [debouncedValue, sort, format, props.currentQuery, props.currentSort, props.currentFormat, pathname, router]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex h-8 items-center gap-3">
        <h1 className="font-semibold text-2xl text-foreground leading-none tracking-tight">Anime Database</h1>
        <span className="text-muted-foreground text-sm tabular-nums">{props.total.toLocaleString()}</span>
      </div>
      <InputGroup className="bg-background! w-full max-w-md dark:bg-[color-mix(in_srgb,var(--foreground)_2%,var(--background))]!">
        <InputGroupAddon align="inline-start">
          <Search />
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ToggleGroup value={[format]} onValueChange={(v) => setFormat(v?.[0] ?? "all")} size="sm">
          {FORMAT_OPTIONS.map((o) => (
            <ToggleGroupItem key={o.value} value={o.value}>{o.label}</ToggleGroupItem>
          ))}
        </ToggleGroup>
        <ToggleGroup value={[sort]} onValueChange={(v) => setSort((v?.[0] as AnimeSort) ?? "title")} size="sm">
          {SORT_OPTIONS.map((o) => (
            <ToggleGroupItem key={o.value} value={o.value}>{o.label}</ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
};

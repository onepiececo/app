"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Empty, EmptyDescription } from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import { serverJSON } from "@/lib/server-client";

type Hit = {
  id: number;
  slug: string;
  title: string;
  year?: number;
};

type GuessInputProps = {
  onSubmit: (rawGuess: string, animeId: number | null) => void | Promise<void>;
  disabled?: boolean;
};

export const GuessInput = (props: GuessInputProps) => {
  const [value, setValue] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.trim().length < 2) {
      setHits([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const res = await serverJSON<Hit[]>(`/v1/anime/search?q=${encodeURIComponent(value)}&limit=8`);
        if (!cancelled) {
          setHits(res);
          setHighlighted(0);
        }
      } catch {
        if (!cancelled) setHits([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 180);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [value]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const commit = (hit?: Hit) => {
    const pick = hit ?? hits[highlighted];
    if (pick) {
      props.onSubmit(pick.title, pick.id);
      setValue("");
      setHits([]);
      setOpen(false);
      return;
    }
    if (value.trim().length > 0) {
      props.onSubmit(value.trim(), null);
      setValue("");
      setHits([]);
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center gap-2">
        <Input
          autoFocus
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlighted((i) => Math.min(i + 1, hits.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlighted((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              commit();
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder="type the anime..."
          disabled={props.disabled}
          aria-label="Guess input"
        />
        <Button onClick={() => commit()} disabled={props.disabled || value.trim().length === 0}>
          guess
        </Button>
      </div>

      {open && (value.trim().length >= 2) ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.25rem)] z-40 overflow-hidden rounded-lg border bg-popover shadow-md">
          {loading ? (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
              <Spinner /> searching
            </div>
          ) : hits.length === 0 ? (
            <Empty className="py-6">
              <EmptyDescription>no matches, hit guess anyway to submit as text</EmptyDescription>
            </Empty>
          ) : (
            <ul role="listbox" className="max-h-72 overflow-y-auto p-1">
              {hits.map((h, i) => (
                <li
                  key={h.id}
                  role="option"
                  aria-selected={i === highlighted}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-sm",
                    i === highlighted ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent/60",
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    commit(h);
                  }}
                  onMouseEnter={() => setHighlighted(i)}
                >
                  <span className="truncate font-medium">{h.title}</span>
                  {h.year ? <span className="ms-3 shrink-0 text-xs text-muted-foreground">{h.year}</span> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
};

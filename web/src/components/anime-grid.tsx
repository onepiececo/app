import { type ReactNode } from "react";
import { ImageIcon } from "lucide-react";
import Link from "next/link";
import type { AnimeHit } from "@/app/actions/anime";
import { cn } from "@/lib/utils";

export type AnimeGridProps = {
  anime: AnimeHit[];
  query: string;
};

// Highlight the first case-insensitive occurrence of `query` inside the title.
const highlight = (title: string, query: string): ReactNode => {
  const q = query.trim();
  if (q.length === 0) return title;
  const idx = title.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return title;
  return (
    <>
      {title.slice(0, idx)}
      <span className="rounded-sm bg-amber-400/30 px-0.5 text-foreground">
        {title.slice(idx, idx + q.length)}
      </span>
      {title.slice(idx + q.length)}
    </>
  );
};

const isLastCol = (i: number, total: number, cols: number) =>
  (i + 1) % cols === 0 || i === total - 1;

// Last-row detection that handles partial last rows. For N items in C columns,
// items per last row = N % C (or C when evenly divisible).
const isLastRow = (i: number, total: number, cols: number) => {
  const inLast = total % cols === 0 ? cols : total % cols;
  return i >= total - inLast;
};

export const AnimeGrid = (props: AnimeGridProps) => {
  if (props.anime.length === 0 && props.query.length > 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16 text-muted-foreground text-sm">
        No anime match that search.
      </div>
    );
  }
  const total = props.anime.length;
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {props.anime.map((a, i) => (
        <li
          key={a.id}
          className={cn(
            "[&>a]:border-border",
            // Mobile (1 col) — bottom border on every tile except the last.
            i < total - 1 && "[&>a]:border-b",
            // sm (2 cols) — right border except last column, bottom except last row.
            !isLastCol(i, total, 2) && "sm:[&>a]:border-r",
            isLastCol(i, total, 2) && "sm:[&>a]:border-r-0",
            !isLastRow(i, total, 2) && "sm:[&>a]:border-b",
            isLastRow(i, total, 2) && "sm:[&>a]:border-b-0",
            // lg (3 cols) — same rule, re-evaluated for 3-col layout.
            !isLastCol(i, total, 3) && "lg:[&>a]:border-r",
            isLastCol(i, total, 3) && "lg:[&>a]:border-r-0",
            !isLastRow(i, total, 3) && "lg:[&>a]:border-b",
            isLastRow(i, total, 3) && "lg:[&>a]:border-b-0",
          )}
        >
          <Link
            href={`/anime/${a.id}`}
            prefetch={false}
            className="group relative flex aspect-[5/3] w-full flex-col justify-end gap-1 bg-muted/40 p-5 outline-none transition-colors duration-150 ease-out hover:bg-muted/60 focus-visible:bg-muted/60"
          >
            <ImageIcon
              aria-hidden
              className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 size-10 text-foreground/10"
            />
            <span className="line-clamp-3 font-semibold text-base text-foreground leading-snug">
              {highlight(a.title, props.query)}
            </span>
            {a.year ? (
              <span className="font-medium text-muted-foreground text-xs tabular-nums">
                {a.year}
              </span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
};

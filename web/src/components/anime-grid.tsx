import { type ReactNode } from "react";
import { ImageIcon } from "lucide-react";
import Link from "next/link";
import type { AnimeHit } from "@/app/actions/anime";
import { cn } from "@/lib/utils";

export type AnimeGridProps = {
  anime: AnimeHit[];
  query: string;
};

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

export const AnimeGrid = (props: AnimeGridProps) => {
  if (props.anime.length === 0 && props.query.length > 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16 text-muted-foreground text-sm">
        No anime match that search.
      </div>
    );
  }
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {props.anime.map((a, i) => (
        <li
          key={a.id}
          className={cn(
            "[&>a]:border-border [&>a]:border-b",
            "sm:[&>a]:border-r",
            i % 2 === 1 && "sm:[&>a]:border-r-0",
            "lg:[&>a]:border-r",
            i % 3 === 2 && "lg:[&>a]:border-r-0",
          )}
        >
          <Link
            href={`/anime/${a.id}`}
            prefetch={false}
            className="group relative flex aspect-5/3 w-full flex-col justify-end gap-1 bg-muted/40 p-5 outline-none transition-colors duration-150 ease-out hover:bg-muted/60 focus-visible:bg-muted/60"
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

import { type ReactNode } from "react";
import { ImageIcon } from "lucide-react";
import Link from "next/link";
import type { AnimeHit } from "@/app/actions/anime";

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

// Color band reads the score as a temperature, emerald for excellent, amber
// for solid, orange for okay, rose for weak, so nothing falls to a flat gray
// and the eye can scan quality at a glance.
const scoreBand = (n: number | undefined) => {
  if (typeof n !== "number") return "text-foreground";
  if (n >= 85) return "text-emerald-600 dark:text-emerald-400";
  if (n >= 75) return "text-amber-600 dark:text-amber-400";
  if (n >= 65) return "text-orange-600 dark:text-orange-400";
  return "text-rose-600 dark:text-rose-400";
};

const Tile = (props: { anime: AnimeHit; query: string }) => {
  const a = props.anime;
  const s = typeof a.score === "number" ? (a.score / 10).toFixed(1) : null;
  return (
    <Link
      href={`/anime/${a.id}`}
      prefetch={false}
      className="group -m-2 block cursor-pointer rounded-lg p-2 outline-none transition-colors hover:bg-accent/40 focus-visible:bg-accent/50"
    >
      <div className="relative aspect-2/3 overflow-hidden bg-muted/40">
        <ImageIcon aria-hidden className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 size-7 text-foreground/15" />
        <span className="absolute top-2 right-2 left-2 line-clamp-2 font-semibold text-foreground text-xs leading-tight">
          {highlight(a.title, props.query)}
        </span>
        <div className="absolute right-2 bottom-2 flex flex-col items-end gap-0 tabular-nums">
          {s ? <span className={`font-bold text-lg leading-none ${scoreBand(a.score)}`}>{s}</span> : null}
          {a.year ? <span className="text-[10px] text-muted-foreground">{a.year}</span> : null}
        </div>
      </div>
    </Link>
  );
};

export const AnimeGrid = (props: AnimeGridProps) => {
  if (props.anime.length === 0 && props.query.length > 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-16 text-muted-foreground text-sm">
        No anime match that search.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
      {props.anime.map((a) => <Tile key={a.id} anime={a} query={props.query} />)}
    </div>
  );
};

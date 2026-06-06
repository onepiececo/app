import { type ReactNode } from "react";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
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

// Color band reads the score as a temperature, emerald for excellent, amber
// for solid, orange for okay, rose for weak, so nothing falls to a flat gray
// and the eye can scan quality at a glance.
const scoreBand = (n: number | undefined) => {
  if (typeof n !== "number") return "text-foreground";
  if (n >= 85) return "text-emerald-400";
  if (n >= 75) return "text-amber-400";
  if (n >= 65) return "text-orange-400";
  return "text-rose-400";
};

// Three-stop shadow stack, a tight crisp halo plus a softer body so text reads
// over both light and dark covers without needing a backdrop strip.
const COVER_TEXT = "[text-shadow:_0_0_3px_rgb(0_0_0/0.95),_0_1px_3px_rgb(0_0_0/0.9),_0_2px_8px_rgb(0_0_0/0.5)]";

const Tile = (props: { anime: AnimeHit; query: string }) => {
  const a = props.anime;
  const s = typeof a.score === "number" ? (a.score / 10).toFixed(1) : null;
  return (
    <Link
      href={`/anime/${a.id}`}
      prefetch={false}
      className="group -m-2 block cursor-pointer rounded-lg p-2 outline-none transition-colors hover:bg-accent/40 focus-visible:bg-accent/50"
    >
      <div
        className={cn("relative aspect-2/3 overflow-hidden", !a.coverColor && "bg-muted/40")}
        style={a.coverColor ? { backgroundColor: a.coverColor } : undefined}
      >
        {a.coverSourceUrl ? (
          <Image
            src={a.coverSourceUrl}
            alt={a.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 20vw"
            className="origin-center object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-110"
          />
        ) : (
          <ImageIcon aria-hidden className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 size-7 text-foreground/15" />
        )}
        <span className={cn("absolute top-2 right-2 left-2 line-clamp-2 font-semibold text-white text-sm leading-tight", COVER_TEXT)}>
          {highlight(a.title, props.query)}
        </span>
        <div className="absolute right-2 bottom-2 flex flex-col items-end gap-0.5 tabular-nums">
          {s ? <span className={cn("font-bold text-xl leading-none", COVER_TEXT, scoreBand(a.score))}>{s}</span> : null}
          {a.year ? <span className={cn("text-white text-xs", COVER_TEXT)}>{a.year}</span> : null}
        </div>
      </div>
    </Link>
  );
};

export const AnimeGrid = (props: AnimeGridProps) => {
  if (props.anime.length === 0) {
    return <EmptyGrid context={props.query.length > 0 ? "search" : "filter"} />;
  }
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
      {props.anime.map((a) => <Tile key={a.id} anime={a} query={props.query} />)}
    </div>
  );
};

export const EmptyGrid = (props: { context: "search" | "filter" }) => (
  <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
    <div className="grid size-12 place-items-center rounded-full bg-muted">
      <ImageIcon aria-hidden className="size-5 text-muted-foreground" />
    </div>
    <p className="font-medium text-foreground text-sm">No matches</p>
    <p className="max-w-xs text-muted-foreground text-xs">
      {props.context === "search"
        ? "Nothing in the database matches that search. Try a different alias or a shorter query."
        : "Nothing in the database matches those filters yet. Try a different format, or wait for ingest to backfill more anime."}
    </p>
  </div>
);

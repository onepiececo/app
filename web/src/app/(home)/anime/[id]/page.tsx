import { ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAnimeById, type AnimeDetail, type AnimeRelation } from "@/app/actions/anime";
import { CharacterStrip } from "@/components/character-strip";
import { TagSection } from "@/components/tag-section";
import { cn } from "@/lib/utils";

const SECTION_LABEL = "font-medium text-muted-foreground text-xs uppercase tracking-wider";

type AnimeDetailProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: AnimeDetailProps) {
  const { id } = await props.params;
  const anime = await getAnimeById(Number(id));
  return {
    title: anime ? `${anime.titlePrimary} | onepiece` : "Anime | onepiece",
  };
}

const altTitles = (anime: AnimeDetail) => {
  const set = new Set<string>();
  const out: string[] = [];
  for (const t of [anime.titleEnglish, anime.titleRomaji, anime.titleNative]) {
    if (!t) continue;
    if (t === anime.titlePrimary) continue;
    if (set.has(t)) continue;
    set.add(t);
    out.push(t);
  }
  return out;
};

const scoreBand = (n: number | undefined) => {
  if (typeof n !== "number") return "text-foreground";
  if (n >= 85) return "text-emerald-600 dark:text-emerald-400";
  if (n >= 75) return "text-amber-600 dark:text-amber-400";
  if (n >= 65) return "text-orange-600 dark:text-orange-400";
  return "text-rose-600 dark:text-rose-400";
};

const RELATION_LABEL: Record<string, string> = {
  SEQUEL: "Sequel",
  PREQUEL: "Prequel",
  ADAPTATION: "Adaptation",
  SOURCE: "Source",
  SIDE_STORY: "Side story",
  PARENT: "Parent story",
  CHARACTER: "Shared character",
  SUMMARY: "Summary",
  ALTERNATIVE: "Alternative",
  SPIN_OFF: "Spin off",
  OTHER: "Related",
  CONTAINS: "Contains",
  COMPILATION: "Compilation",
};

// Color buckets, continuation (sequel/prequel/parent) reads amber as the
// hottest tier, adaptations across mediums read sky, branches read violet,
// everything else falls to muted zinc.
const relationColor = (type: string) => {
  if (type === "SEQUEL" || type === "PREQUEL" || type === "PARENT") return "text-amber-300";
  if (type === "ADAPTATION" || type === "SOURCE") return "text-sky-300";
  if (type === "SIDE_STORY" || type === "SPIN_OFF" || type === "ALTERNATIVE") return "text-violet-300";
  return "text-zinc-300";
};

// Best order. Relationship type sets the priority so the story reads forward,
// source then prequel, sequel, parent, then the branches, with loose links
// last. Within a type the oldest entry leads so a run of sequels reads as a
// release timeline.
const RELATION_PRIORITY = ["SOURCE", "PREQUEL", "SEQUEL", "PARENT", "SIDE_STORY", "SPIN_OFF", "ALTERNATIVE", "SUMMARY", "COMPILATION", "ADAPTATION", "CHARACTER", "CONTAINS", "OTHER"];
const relationRank = (type: string) => {
  const i = RELATION_PRIORITY.indexOf(type);
  return i === -1 ? RELATION_PRIORITY.length : i;
};
const byBestOrder = (a: AnimeRelation, b: AnimeRelation) => {
  if (relationRank(a.relationType) !== relationRank(b.relationType)) return relationRank(a.relationType) - relationRank(b.relationType);
  return (a.seasonYear ?? 0) - (b.seasonYear ?? 0);
};


const COVER_OVERLAY_TEXT = "[text-shadow:_0_0_3px_rgb(0_0_0/0.95),_0_1px_3px_rgb(0_0_0/0.9),_0_2px_8px_rgb(0_0_0/0.5)]";

const Cover = (props: { url?: string; alt: string; color?: string }) => {
  const tint = props.color ? { backgroundColor: props.color } : undefined;
  if (!props.url) {
    return (
      <div
        className={cn("relative flex aspect-2/3 w-32 shrink-0 items-center justify-center sm:w-44", !props.color && "bg-muted/40")}
        style={tint}
      >
        <ImageIcon aria-hidden className="size-10 text-foreground/15" />
      </div>
    );
  }
  return (
    <div
      className={cn("relative aspect-2/3 w-32 shrink-0 overflow-hidden sm:w-44", !props.color && "bg-muted/40")}
      style={tint}
    >
      <Image src={props.url} alt={props.alt} fill sizes="(max-width: 640px) 8rem, 11rem" className="object-cover" priority />
    </div>
  );
};

const Banner = (props: { url?: string; color?: string }) => {
  const fade = `linear-gradient(to bottom, transparent 60%, var(--background))`;
  if (!props.url) {
    return (
      <div
        className="h-40 rounded-lg sm:h-56 lg:h-64"
        style={{ background: props.color ? `${props.color}33` : undefined }}
      />
    );
  }
  return (
    <div className="relative h-40 overflow-hidden rounded-lg sm:h-56 lg:h-64">
      <Image src={props.url} alt="" fill sizes="100vw" className="object-cover" priority />
      <div className="absolute inset-0" style={{ background: fade }} />
    </div>
  );
};

const Stat = (props: { label: string; value: string | number | null | undefined }) => {
  if (props.value === null || props.value === undefined || props.value === "") return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">{props.label}</span>
      <span className="font-medium text-foreground text-sm tabular-nums">{props.value}</span>
    </div>
  );
};


// Relations whose target is not in our catalog yet collapse into one placeholder
// rather than a row of empty boxes, the count keeps the same poster footprint.
const PendingTile = (props: { count: number }) => (
  <div className="-m-2 p-2">
    <div className="relative flex aspect-2/3 items-center justify-center border border-border bg-gradient-to-br from-muted/60 to-muted/20">
      <div className="flex flex-col items-center gap-0.5">
        <span className="font-semibold text-3xl text-foreground/80 tabular-nums">{props.count}</span>
        <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Pending</span>
      </div>
    </div>
  </div>
);

const RelationCard = (props: { relation: AnimeRelation }) => {
  const r = props.relation;
  const label = RELATION_LABEL[r.relationType] ?? r.relationType;
  return (
    <Link
      href={`/anime/${r.animeId}`}
      prefetch={false}
      className="-m-2 block rounded-lg p-2 outline-none transition-colors hover:bg-accent/40 focus-visible:bg-accent/50"
    >
      <div className="relative aspect-2/3 overflow-hidden bg-muted/40">
        {r.coverSourceUrl ? (
          <Image src={r.coverSourceUrl} alt={r.title ?? ""} fill sizes="10rem" className="object-cover" />
        ) : (
          <ImageIcon aria-hidden className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 size-6 text-foreground/15" />
        )}
        <span className={cn("absolute top-2 right-2 left-2 line-clamp-2 font-semibold text-white text-xs leading-tight", COVER_OVERLAY_TEXT)}>
          {r.title ?? "External"}
        </span>
        <span className={cn("absolute bottom-2 left-2 font-semibold text-[10px] uppercase tracking-wide", relationColor(r.relationType), COVER_OVERLAY_TEXT)}>
          {label}
        </span>
        {r.seasonYear ? (
          <span className={cn("absolute right-2 bottom-2 font-medium text-white text-xs tabular-nums", COVER_OVERLAY_TEXT)}>
            {r.seasonYear}
          </span>
        ) : null}
      </div>
    </Link>
  );
};

export default async function AnimeDetailPage(props: AnimeDetailProps) {
  const { id } = await props.params;
  const numId = Number(id);
  // Ids start at one, bail before the api call so a stray /anime/0 stops pinging the server.
  if (!Number.isInteger(numId) || numId < 1) notFound();
  const anime = await getAnimeById(numId);
  if (!anime) notFound();

  const alts = altTitles(anime);
  const tags = (anime.tags ?? []).filter((t) => !t.isSpoiler).slice(0, 16);
  const studios = anime.studios ?? [];
  const mainStudios = studios.filter((s) => s.isMain);
  const otherStudios = studios.filter((s) => !s.isMain);
  const allRelations = anime.relations ?? [];
  const presentRelations = allRelations.filter((r) => r.animeId).sort(byBestOrder);
  const pendingCount = allRelations.length - presentRelations.length;
  const score = typeof anime.averageScore === "number" ? (anime.averageScore / 10).toFixed(1) : null;

  return (
    <>
      <Banner url={anime.bannerSourceUrl} color={anime.coverColor} />

      <header className="-mt-20 flex flex-col gap-4 sm:-mt-24 sm:flex-row sm:items-end sm:gap-6">
        <Cover url={anime.coverSourceUrl} alt={anime.titlePrimary} color={anime.coverColor} />
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="font-semibold text-3xl text-foreground leading-tight tracking-tight">
            {anime.titlePrimary}
          </h1>
          {alts.length > 0 ? (
            <ul className="flex flex-col gap-0.5 text-muted-foreground text-sm">
              {alts.map((t) => <li key={t}>{t}</li>)}
            </ul>
          ) : null}
        </div>
      </header>

      <section className="flex flex-wrap gap-x-8 gap-y-4">
        <Stat label="Year" value={anime.seasonYear ?? null} />
        <Stat label="Season" value={anime.season ? anime.season.charAt(0) + anime.season.slice(1).toLowerCase() : null} />
        <Stat label="Format" value={anime.format ?? null} />
        <Stat label="Status" value={anime.status ? anime.status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase()) : null} />
        <Stat label="Episodes" value={anime.episodes ?? null} />
        <Stat label="Duration" value={anime.durationMinutes ? `${anime.durationMinutes} min` : null} />
        <Stat label="Source" value={anime.source ? anime.source.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase()) : null} />
        {score ? (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">Score</span>
            <span className={cn("font-medium text-sm tabular-nums", scoreBand(anime.averageScore))}>{score}</span>
          </div>
        ) : null}
        <Stat label="Popularity" value={anime.popularity > 0 ? anime.popularity.toLocaleString() : null} />
      </section>

      {anime.genres && anime.genres.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className={SECTION_LABEL}>Genres</h2>
          <div className="flex flex-wrap items-center gap-2">
            {anime.genres.map((g) => (
              <span key={g} className="rounded-md bg-muted/60 px-2 py-1 font-medium text-foreground text-xs">
                {g}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {tags.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className={SECTION_LABEL}>Tags</h2>
          <TagSection tags={tags} />
        </section>
      ) : null}

      {studios.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className={SECTION_LABEL}>Studios</h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {mainStudios.map((s) => (
              <span key={s.name} className="font-medium text-foreground text-sm">{s.name}</span>
            ))}
            {otherStudios.map((s) => (
              <span key={s.name} className="text-muted-foreground text-sm">{s.name}</span>
            ))}
          </div>
        </section>
      ) : null}

      {anime.characters && anime.characters.length > 0 ? (
        <CharacterStrip characters={anime.characters} />
      ) : null}

      {presentRelations.length > 0 || pendingCount > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className={SECTION_LABEL}>Relations</h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            {presentRelations.map((r) => (
              <RelationCard key={`${r.relationType}-${r.animeId}`} relation={r} />
            ))}
            {pendingCount > 0 ? <PendingTile count={pendingCount} /> : null}
          </div>
        </section>
      ) : null}
    </>
  );
}

import { ImageIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAnimeById, type AnimeDetail } from "@/app/actions/anime";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export async function generateMetadata(props: PageProps<"/anime/[id]">) {
  const { id } = await props.params;
  const anime = await getAnimeById(Number(id));
  return {
    title: anime ? `${anime.titlePrimary} — onepiece` : "Anime — onepiece",
  };
}

const Row = (props: { label: string; value: string | number | null | undefined }) => {
  if (props.value === null || props.value === undefined || props.value === "") return null;
  return (
    <div className="flex items-baseline justify-between gap-4 border-border border-b py-3 last:border-b-0">
      <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
        {props.label}
      </span>
      <span className="text-foreground text-sm tabular-nums">{props.value}</span>
    </div>
  );
};

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

export default async function AnimeDetailPage(props: PageProps<"/anime/[id]">) {
  const { id } = await props.params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) notFound();
  const anime = await getAnimeById(numId);
  if (!anime) notFound();

  const alts = altTitles(anime);

  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="flex flex-col gap-8 px-6 py-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbLink render={<Link href="/anime" />}>Anime Database</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbPage>{anime.titlePrimary}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          <div className="relative flex aspect-[2/3] w-32 shrink-0 items-center justify-center rounded-lg bg-muted/40 sm:w-40">
            <ImageIcon aria-hidden className="size-10 text-foreground/15" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="font-semibold text-2xl text-foreground leading-tight tracking-tight">
              {anime.titlePrimary}
            </h1>
            {alts.length > 0 ? (
              <ul className="flex flex-col gap-0.5 text-muted-foreground text-sm">
                {alts.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </header>

        <section className="flex max-w-xl flex-col">
          <Row label="Year" value={anime.seasonYear ?? null} />
          <Row label="Season" value={anime.season ?? null} />
          <Row label="Format" value={anime.format ?? null} />
          <Row label="Status" value={anime.status ?? null} />
          <Row label="Episodes" value={anime.episodes ?? null} />
          <Row label="Duration" value={anime.durationMinutes ? `${anime.durationMinutes} min` : null} />
          <Row label="Source" value={anime.source ?? null} />
          <Row label="Average score" value={anime.averageScore ?? null} />
          <Row label="Popularity" value={anime.popularity.toLocaleString()} />
          <Row label="Favourites" value={anime.favourites.toLocaleString()} />
        </section>
      </div>
    </main>
  );
}

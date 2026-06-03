import { browseAnime, getAnimeCount, searchAnime, type AnimeSort } from "@/app/actions/anime";
import { AnimeGrid } from "@/components/anime-grid";
import { AnimeHeader } from "@/components/anime-header";

export const metadata = {
  title: "Anime Database — onepiece",
};

const VALID_SORTS = new Set<AnimeSort>(["title", "popularity", "year", "score"]);

export default async function AnimePage(props: PageProps<"/anime">) {
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const rawSort = typeof sp.sort === "string" ? sp.sort : "title";
  const sort: AnimeSort = VALID_SORTS.has(rawSort as AnimeSort)
    ? (rawSort as AnimeSort)
    : "title";
  const [anime, total] = await Promise.all([
    q.length > 0 ? searchAnime(q, 50) : browseAnime(sort, 100),
    getAnimeCount(),
  ]);

  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <AnimeHeader currentQuery={q} currentSort={sort} total={total} />
      <AnimeGrid anime={anime} query={q} />
    </main>
  );
}

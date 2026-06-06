import { browseAnime, getAnimeCount, searchAnime, type AnimeSort } from "@/app/actions/anime";
import { AnimeBrowser } from "@/components/anime-browser";
import { AnimeGrid } from "@/components/anime-grid";
import { AnimeHeader } from "@/components/anime-header";

export const metadata = {
  title: "Anime Database | onepiece",
};

const VALID_SORTS = new Set<AnimeSort>(["title", "popularity", "year", "score"]);
const VALID_FORMATS = new Set(["all", "TV", "TV_SHORT", "MOVIE", "ONA", "OVA", "SPECIAL"]);
const PAGE_SIZE = 50;

export default async function AnimePage(props: PageProps<"/anime">) {
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const rawSort = typeof sp.sort === "string" ? sp.sort : "title";
  const sort: AnimeSort = VALID_SORTS.has(rawSort as AnimeSort)
    ? (rawSort as AnimeSort)
    : "title";
  const rawFormat = typeof sp.format === "string" ? sp.format : "all";
  const format = VALID_FORMATS.has(rawFormat) ? rawFormat : "all";
  const [anime, total] = await Promise.all([
    q.length > 0 ? searchAnime(q, 50) : browseAnime(sort, PAGE_SIZE, 0, format),
    getAnimeCount(),
  ]);

  return (
    <>
      <AnimeHeader currentQuery={q} currentSort={sort} currentFormat={format} total={total} />
      {q.length > 0 ? (
        <AnimeGrid anime={anime} query={q} />
      ) : (
        <AnimeBrowser
          initialAnime={anime}
          sort={sort}
          format={format}
          total={total}
          pageSize={PAGE_SIZE}
        />
      )}
    </>
  );
}

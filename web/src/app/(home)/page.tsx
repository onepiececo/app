import { getDailyGames } from "@/app/actions/days";
import { DayScroller } from "@/components/day-scroller";
import { GameTile } from "@/components/game-tile";
import { safeParseIso, todayIso } from "@/lib/days";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "onepiece",
};

export default async function HomePage(props: PageProps<"/">) {
  const sp = await props.searchParams;
  const initialIso = safeParseIso(sp.date, todayIso());
  const games = await getDailyGames(initialIso);

  return (
    <DayScroller>
      <ul className="grid grid-cols-1 gap-px bg-border md:grid-cols-2 lg:h-full lg:grid-cols-3 lg:grid-rows-3">
        {games.map((g, i) => (
          <li
            key={g.key}
            className={cn(
              "bg-background",
              i === games.length - 1 && "md:col-span-2 lg:col-span-1",
            )}
          >
            <GameTile name={g.name} className={g.className} available={g.available}>
              {g.tagline}
            </GameTile>
          </li>
        ))}
      </ul>
    </DayScroller>
  );
}

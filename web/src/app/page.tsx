import { getAvailableDays, getDailyGames } from "@/app/actions/days";
import { DayProvider } from "@/components/day-provider";
import { DayScroller } from "@/components/day-scroller";
import { GameTile } from "@/components/game-tile";
import { MobileBar } from "@/components/mobile-bar";
import { Sidebar } from "@/components/sidebar";
import { DAYS, makeDay, safeParseIso, TODAY_ISO } from "@/lib/days";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "onepiece",
};

export default async function HomePage(props: PageProps<"/">) {
  const sp = await props.searchParams;
  const [isoList, games] = await Promise.all([
    getAvailableDays(),
    getDailyGames(safeParseIso(sp.date, TODAY_ISO)),
  ]);
  const days = isoList.length > 0 ? isoList.map(makeDay) : DAYS;
  const initialIso = safeParseIso(sp.date, days[0].iso);

  return (
    <DayProvider days={days} initialIso={initialIso}>
      <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground lg:flex-row">
        <Sidebar />
        <MobileBar />
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
                <GameTile name={g.name} tone={g.tone} available={g.available}>
                  {g.tagline}
                </GameTile>
              </li>
            ))}
          </ul>
        </DayScroller>
      </div>
    </DayProvider>
  );
}

import { type ReactNode } from "react";
import { getDailyGames } from "@/app/actions/days";
import { DayScroller } from "@/components/day-scroller";
import { CluePreview } from "@/components/games/clue-preview";
import { CharacterPreview, CoverPreview, DialPreview, GroupsPreview, HigherPreview, TimelinePreview } from "@/components/games/previews";
import { GameTile } from "@/components/game-tile";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "onepiece",
};

const PREVIEWS: Record<string, ReactNode> = {
  clue: <CluePreview />,
  cover: <CoverPreview />,
  character: <CharacterPreview />,
  higherlower: <HigherPreview />,
  groups: <GroupsPreview />,
  timeline: <TimelinePreview />,
  dial: <DialPreview />,
};

export default async function HomePage(props: PageProps<"/">) {
  const sp = await props.searchParams;
  const games = await getDailyGames(typeof sp.date === "string" ? sp.date : "");

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
            <GameTile
              name={g.name}
              className={g.className}
              available={g.available}
              href={g.href}
              preview={PREVIEWS[g.key]}
            >
              {g.tagline}
            </GameTile>
          </li>
        ))}
      </ul>
    </DayScroller>
  );
}

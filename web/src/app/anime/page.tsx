import { browseAnime } from "@/app/actions/anime";
import { getAvailableDays } from "@/app/actions/days";
import { AnimeBrowser } from "@/components/anime-browser";
import { DayProvider } from "@/components/day-provider";
import { HomeDateBlock } from "@/components/home-date-block";
import { HomeMobileDate } from "@/components/home-mobile-date";
import { MobileBar } from "@/components/mobile-bar";
import { Sidebar } from "@/components/sidebar";
import { makeDay, TODAY_ISO } from "@/lib/days";

export const metadata = {
  title: "Anime Database — onepiece",
};

const FALLBACK_DAYS = [makeDay(TODAY_ISO)];

export default async function AnimePage() {
  const [isoList, initialAnime] = await Promise.all([
    getAvailableDays(),
    browseAnime("title", 100),
  ]);
  const days = isoList.length > 0 ? isoList.map(makeDay) : FALLBACK_DAYS;

  return (
    <DayProvider days={days} initialIso={days[0].iso}>
      <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground lg:flex-row">
        <Sidebar>
          <HomeDateBlock />
        </Sidebar>
        <MobileBar>
          <HomeMobileDate />
        </MobileBar>
        <main className="min-h-0 flex-1 overflow-y-auto">
          <AnimeBrowser initialAnime={initialAnime} initialSort="title" />
        </main>
      </div>
    </DayProvider>
  );
}

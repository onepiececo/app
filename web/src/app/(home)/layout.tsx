import { type ReactNode } from "react";
import { getAvailableDays } from "@/app/actions/days";
import { DayProvider } from "@/components/day-provider";
import { HomeDateBlock } from "@/components/home-date-block";
import { HomeMobileDate } from "@/components/home-mobile-date";
import { MobileBar } from "@/components/mobile-bar";
import { Sidebar } from "@/components/sidebar";
import { makeDay, todayIso } from "@/lib/days";

export default async function HomeLayout(props: { children: ReactNode }) {
  const isoList = await getAvailableDays();
  const days = isoList.length > 0 ? isoList.map(makeDay) : [makeDay(todayIso())];

  return (
    <DayProvider days={days}>
      <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground lg:flex-row">
        <Sidebar>
          <HomeDateBlock />
        </Sidebar>
        <MobileBar>
          <HomeMobileDate />
        </MobileBar>
        {props.children}
      </div>
    </DayProvider>
  );
}

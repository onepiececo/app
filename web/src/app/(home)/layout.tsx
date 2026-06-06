import { type ReactNode } from "react";
import { getAvailableDays } from "@/app/actions/days";
import { AppSidebar } from "@/components/app-sidebar";
import { DayProvider } from "@/components/day-provider";
import { HomeMobileDate } from "@/components/home-mobile-date";
import { MobileBar } from "@/components/mobile-bar";
import { ServerOffline } from "@/components/server-offline";
import { makeDay, todayIso } from "@/lib/days";

export default async function HomeLayout(props: { children: ReactNode }) {
  const isoList = await getAvailableDays();
  if (isoList === null) {
    return <ServerOffline />;
  }
  // With no puzzle history yet the API answers with an empty list, fall back to today so the rail still renders.
  const days = (isoList.length > 0 ? isoList : [todayIso()]).map(makeDay);

  return (
    <DayProvider days={days}>
      <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground lg:flex-row">
        <AppSidebar />
        <MobileBar>
          <HomeMobileDate />
        </MobileBar>
        {props.children}
      </div>
    </DayProvider>
  );
}

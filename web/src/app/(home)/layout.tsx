import { type ReactNode } from "react";
import { getAvailableDays } from "@/app/actions/days";
import { AppSidebar } from "@/components/app-sidebar";
import { DayProvider } from "@/components/day-provider";
import { HomeMobileDate } from "@/components/home-mobile-date";
import { MobileBar } from "@/components/mobile-bar";
import { ServerOffline } from "@/components/server-offline";
import { makeDay } from "@/lib/days";

export default async function HomeLayout(props: { children: ReactNode }) {
  const isoList = await getAvailableDays();
  if (isoList.length === 0) {
    return <ServerOffline />;
  }
  const days = isoList.map(makeDay);

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

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useDay } from "@/components/day-provider";
import { SidebarChrome } from "@/components/sidebar-chrome";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popup,
  PopupBody,
  PopupContent,
  PopupHeader,
  PopupTitle,
  PopupTrigger,
} from "@/components/ui/popup";
import { SELECTED_DAY_CLASS, toIso } from "@/lib/days";

export const MobileBar = () => {
  const day = useDay();
  const [open, setOpen] = useState(false);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-border border-b bg-sidebar px-3 lg:hidden">
      <Popup open={open} onOpenChange={setOpen}>
        <PopupTrigger
          render={
            <Button variant="ghost" className="-ms-2 gap-2">
              <span className="font-semibold text-foreground text-sm tabular-nums">
                {day.activeDay.weekdayShort}, {day.activeDay.monthShort} {day.activeDay.day}, {day.activeDay.year}
              </span>
              <ChevronDown className="opacity-70" />
            </Button>
          }
        />
        <PopupContent>
          <PopupHeader>
            <PopupTitle>Pick a day</PopupTitle>
          </PopupHeader>
          <PopupBody className="flex justify-center pb-6">
            <Calendar
              mode="single"
              selected={day.activeDay.date}
              defaultMonth={day.activeDay.date}
              startMonth={day.calendarStartMonth}
              endMonth={day.calendarEndMonth}
              disabled={[{ before: day.firstDate }, { after: day.lastDate }]}
              classNames={{ day_button: SELECTED_DAY_CLASS }}
              onSelect={(picked) => {
                if (!picked) return;
                day.pickDay(toIso(picked));
                setOpen(false);
              }}
            />
          </PopupBody>
        </PopupContent>
      </Popup>
      <div className="ms-auto">
        <SidebarChrome />
      </div>
    </header>
  );
};

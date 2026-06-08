"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useDay } from "@/components/day-provider";
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

export const HomeMobileDate = () => {
  const day = useDay();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // The day picker only belongs on the home rail, other routes keep the bar clean.
  if (pathname !== "/") return null;
  return (
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
  );
};

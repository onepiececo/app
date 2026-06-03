"use client";

import { useState } from "react";
import { AnimateDigits, AnimateText } from "@/components/animate-number";
import { useDay } from "@/components/day-provider";
import { SidebarChrome } from "@/components/sidebar-chrome";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover";
import { SELECTED_DAY_CLASS, toIso } from "@/lib/days";

export const Sidebar = () => {
  const day = useDay();
  const [open, setOpen] = useState(false);

  return (
    <aside className="hidden w-[24rem] shrink-0 flex-col items-start gap-3 overflow-hidden border-border border-r bg-sidebar p-10 lg:flex xl:w-[26rem] xl:p-16">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              aria-label="Change day"
              className="group -mx-3 flex flex-col items-start gap-2 rounded-xl px-3 py-3 text-left outline-none transition-colors duration-150 ease-out hover:bg-accent/40 focus-visible:bg-accent/50"
            />
          }
        >
          <AnimateText
            value={day.activeDay.weekday}
            variant="mask"
            className="font-medium text-muted-foreground text-sm uppercase tracking-wider"
          />
          <AnimateDigits
            value={day.activeDay.day}
            pad={2}
            variant="mask"
            className="font-semibold text-[9rem] leading-[0.85] tracking-tight text-foreground xl:text-[10rem]"
          />
          <AnimateText
            value={day.activeDay.month}
            variant="mask"
            className="font-semibold text-2xl tracking-tight"
          />
          <AnimateDigits
            value={day.activeDay.year}
            variant="mask"
            className="font-medium text-muted-foreground text-sm"
          />
        </PopoverTrigger>
        <PopoverPopup side="bottom" align="start">
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
        </PopoverPopup>
      </Popover>
      <div className="mt-auto pt-6">
        <SidebarChrome />
      </div>
    </aside>
  );
};

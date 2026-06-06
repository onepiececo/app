"use client";

import { useState } from "react";
import { AnimateDigits } from "@/components/animate-number";
import { AnimateText } from "@/components/animate-text";
import { useDay } from "@/components/day-provider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover";
import { useThrottledValue } from "@/hooks/use-throttled-value";
import { SELECTED_DAY_CLASS, toIso } from "@/lib/days";

// Roughly one spring period for the slot variant so the digit animation can complete between updates during fast drag.
const ANIM_INTERVAL = 260;

export const HomeDateBlock = () => {
  const day = useDay();
  const [open, setOpen] = useState(false);
  const weekday = useThrottledValue(day.activeDay.weekday, ANIM_INTERVAL);
  const dayNum = useThrottledValue(day.activeDay.day, ANIM_INTERVAL);
  const month = useThrottledValue(day.activeDay.month, ANIM_INTERVAL);
  const year = useThrottledValue(day.activeDay.year, ANIM_INTERVAL);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label="Change day"
            className="-mx-3 flex flex-col items-start gap-2 self-stretch rounded-xl px-3 py-3 text-left outline-none transition-colors hover:bg-accent/40 focus-visible:bg-accent/50"
          />
        }
      >
        <AnimateText
          value={weekday}
          variant="mask"
          className="font-medium text-muted-foreground text-sm uppercase tracking-wider"
        />
        <AnimateDigits
          value={dayNum}
          pad={2}
          variant="mask"
          className="font-semibold text-[9rem] leading-[0.85] tracking-tight text-foreground xl:text-[10rem]"
        />
        <AnimateText
          value={month}
          variant="mask"
          className="font-semibold text-2xl tracking-tight"
        />
        <AnimateDigits
          value={year}
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
  );
};

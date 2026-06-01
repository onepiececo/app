"use client";

import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverPopup,
  PopoverTrigger,
} from "@/components/ui/popover";

const formatDate = (d: Date | undefined) =>
  d
    ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Pick a date";

export function CalendarVariants() {
  const [single, setSingle] = useState<Date | undefined>(new Date());

  return (
    <div className="flex flex-col gap-2">
      <Label>Date picker</Label>
      <Popover>
        <PopoverTrigger
          render={
            <Button variant="outline" className="w-56 justify-start font-normal">
              <CalendarIcon aria-hidden />
              {formatDate(single)}
            </Button>
          }
        />
        <PopoverPopup
          align="start"
          className="rounded-lg bg-white text-zinc-950 shadow-[0_0_0_1px_var(--color-zinc-300),0_8px_18px_rgb(0_0_0/0.12)] inset-shadow-[0_1px_0_rgb(255_255_255/0.75)] dark:bg-zinc-900 dark:text-white dark:shadow-[0_0_0_1px_rgb(255_255_255/0.14),0_8px_18px_rgb(0_0_0/0.45)] dark:inset-shadow-[0_1px_0_rgb(255_255_255/0.08)]"
        >
          <Calendar mode="single" selected={single} onSelect={setSingle} />
        </PopoverPopup>
      </Popover>
    </div>
  );
}

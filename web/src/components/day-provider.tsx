"use client";

import { createContext, useContext, type ReactNode, type RefCallback } from "react";
import { useRouter } from "next/navigation";
import { useDayScroll } from "@/hooks/use-day-scroll";
import type { Day } from "@/lib/days";

type DayContextValue = {
  days: Day[];
  activeDay: Day;
  activeIdx: number;
  jumpTo: (idx: number) => void;
  pickDay: (iso: string) => void;
  registerScroller: RefCallback<HTMLElement>;
  registerSection: (idx: number) => RefCallback<HTMLElement>;
  firstDate: Date;
  lastDate: Date;
  calendarStartMonth: Date;
  calendarEndMonth: Date;
};

const DayContext = createContext<DayContextValue | null>(null);

export const useDay = () => {
  const ctx = useContext(DayContext);
  if (!ctx) throw new Error("useDay must be used within a DayProvider");
  return ctx;
};

export type DayProviderProps = {
  days: Day[];
  initialIso: string;
  children: ReactNode;
};

export const DayProvider = (props: DayProviderProps) => {
  const router = useRouter();
  const initialIdx = Math.max(0, props.days.findIndex((d) => d.iso === props.initialIso));
  const scroll = useDayScroll({ count: props.days.length, initialIdx });

  const pickDay = (iso: string) => {
    router.replace(`/?date=${iso}`, { scroll: false });
    const idx = props.days.findIndex((d) => d.iso === iso);
    if (idx >= 0) scroll.jumpTo(idx);
  };

  // Calendar bounds derived from the day window — the first valid day, last
  // valid day, and the month range the calendar can navigate within.
  const lastDate = props.days[0].date;
  const firstDate = props.days[props.days.length - 1].date;
  const calendarStartMonth = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
  const calendarEndMonth = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, 0);

  const value: DayContextValue = {
    days: props.days,
    activeDay: props.days[scroll.activeIdx],
    activeIdx: scroll.activeIdx,
    jumpTo: scroll.jumpTo,
    pickDay,
    registerScroller: scroll.registerScroller,
    registerSection: scroll.registerSection,
    firstDate,
    lastDate,
    calendarStartMonth,
    calendarEndMonth,
  };

  return <DayContext value={value}>{props.children}</DayContext>;
};

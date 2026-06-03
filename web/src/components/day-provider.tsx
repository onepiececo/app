"use client";

import { createContext, useContext, useEffect, useState, type ReactNode, type RefCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getAvailableDays } from "@/app/actions/days";
import { useDayScroll } from "@/hooks/use-day-scroll";
import { makeDay, safeParseIso, TODAY_ISO, type Day } from "@/lib/days";

type DayContextValue = {
  days: Day[];
  activeDay: Day;
  activeIdx: number;
  scrolling: boolean;
  scrollToDay: (idx: number) => void;
  pickDay: (iso: string) => void;
  registerScroller: RefCallback<HTMLElement>;
  registerSection: (idx: number) => RefCallback<HTMLElement>;
  firstDate: Date;
  lastDate: Date;
  calendarStartMonth: Date;
  calendarEndMonth: Date;
  loadingMore: boolean;
};

const DayContext = createContext<DayContextValue | null>(null);

export const useDay = () => {
  const ctx = useContext(DayContext);
  if (!ctx) throw new Error("useDay must be used within a DayProvider");
  return ctx;
};

export type DayProviderProps = {
  days: Day[];
  children: ReactNode;
};

const PAGE_SIZE = 30;
const PREFETCH_THRESHOLD = 3;

export const DayProvider = (props: DayProviderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const dateParam = sp.get("date");
  const initialIso = safeParseIso(dateParam, props.days[0]?.iso ?? TODAY_ISO);

  const [days, setDays] = useState<Day[]>(props.days);
  const [loadingMore, setLoadingMore] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const initialIdx = Math.max(0, days.findIndex((d) => d.iso === initialIso));
  const scroll = useDayScroll({ count: days.length, initialIdx });

  const loadMore = async () => {
    if (loadingMore || exhausted) return;
    const oldest = days[days.length - 1];
    if (!oldest) return;
    setLoadingMore(true);
    const more = await getAvailableDays(PAGE_SIZE, oldest.iso);
    setLoadingMore(false);
    if (more.length === 0) {
      setExhausted(true);
      return;
    }
    const known = new Set(days.map((d) => d.iso));
    const appended = more.filter((iso) => !known.has(iso)).map(makeDay);
    if (appended.length === 0) {
      setExhausted(true);
      return;
    }
    setDays((prev) => [...prev, ...appended]);
  };

  useEffect(() => {
    if (exhausted || loadingMore) return;
    if (scroll.activeIdx >= days.length - PREFETCH_THRESHOLD) {
      loadMore();
    }
  }, [scroll.activeIdx, days.length, exhausted, loadingMore]);

  const pickDay = (iso: string) => {
    const params = new URLSearchParams(sp.toString());
    params.set("date", iso);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    const idx = days.findIndex((d) => d.iso === iso);
    if (idx >= 0) scroll.scrollToDay(idx);
  };

  const lastDate = days[0].date;
  const firstDate = days[days.length - 1].date;
  const calendarStartMonth = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
  const calendarEndMonth = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, 0);

  const value: DayContextValue = {
    days,
    activeDay: days[scroll.activeIdx],
    activeIdx: scroll.activeIdx,
    scrolling: scroll.scrolling,
    scrollToDay: scroll.scrollToDay,
    pickDay,
    registerScroller: scroll.registerScroller,
    registerSection: scroll.registerSection,
    firstDate,
    lastDate,
    calendarStartMonth,
    calendarEndMonth,
    loadingMore,
  };

  return <DayContext value={value}>{props.children}</DayContext>;
};

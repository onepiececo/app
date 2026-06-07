"use client";

import { createContext, useContext, useEffect, useState, type ReactNode, type RefCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getAvailableDays } from "@/app/actions/days";
import { useDayScroll } from "@/hooks/use-day-scroll";
import { makeDay, safeParseIso, type Day } from "@/lib/days";

type DayContextValue = {
  days: Day[];
  activeDay: Day;
  activeIdx: number;
  scrolling: boolean;
  scrollToDay: (idx: number) => void;
  pickDay: (iso: string) => void;
  registerScroller: RefCallback<HTMLElement>;
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

// router.replace would refetch RSC on every scroll settle, history.replaceState updates the URL without navigation.
const writeDateParam = (iso: string) => {
  const url = new URL(window.location.href);
  if (url.searchParams.get("date") === iso) return;
  url.searchParams.set("date", iso);
  window.history.replaceState(window.history.state, "", url.toString());
};

export const DayProvider = (props: DayProviderProps) => {
  const sp = useSearchParams();
  const pathname = usePathname();
  // The date only belongs in the url on the home rail, other routes keep the day in memory without leaking the param.
  const onHome = pathname === "/";
  const dateParam = sp.get("date");
  // The server date list is the single source of truth, newest first, so today is days[0].
  const fallbackIso = props.days[0]?.iso ?? "";
  const initialIso = safeParseIso(dateParam, fallbackIso);

  const [days, setDays] = useState<Day[]>(props.days);
  const [loadingMore, setLoadingMore] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const initialIdx = Math.max(0, days.findIndex((d) => d.iso === initialIso));
  const scroll = useDayScroll({ count: days.length, initialIdx });

  useEffect(() => {
    if (!onHome || scroll.scrolling) return;
    const activeIso = days[scroll.activeIdx]?.iso;
    if (!activeIso) return;
    writeDateParam(activeIso);
  }, [onHome, scroll.scrolling, scroll.activeIdx, days]);

  const loadMore = async () => {
    if (loadingMore || exhausted) return;
    const oldest = days[days.length - 1];
    if (!oldest) return;
    setLoadingMore(true);
    const more = (await getAvailableDays(PAGE_SIZE, oldest.iso)) ?? [];
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
    if (onHome) writeDateParam(iso);
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
    firstDate,
    lastDate,
    calendarStartMonth,
    calendarEndMonth,
    loadingMore,
  };

  return <DayContext value={value}>{props.children}</DayContext>;
};

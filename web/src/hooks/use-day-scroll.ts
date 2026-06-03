"use client";

import { useEffect, useRef, useState, type RefCallback } from "react";

export type UseDayScrollOptions = {
  count: number;
  initialIdx?: number;
};

export type UseDayScrollResult = {
  activeIdx: number;
  jumpTo: (idx: number) => void;
  registerScroller: RefCallback<HTMLElement>;
  registerSection: (idx: number) => RefCallback<HTMLElement>;
};

// Encapsulates the multi-day scroll-snap behavior. Owns the active index,
// a wheel hijack (one tick equals one day), keyboard nav (arrow keys, home,
// end), and an IntersectionObserver that drives the index from touch scroll.
// Programmatic jumps suppress the observer for the duration of the smooth
// scroll so the index doesn't cascade through intermediate sections.
export const useDayScroll = (opts: UseDayScrollOptions): UseDayScrollResult => {
  const [activeIdx, setActiveIdx] = useState(opts.initialIdx ?? 0);
  const scrollerRef = useRef<HTMLElement | null>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const activeIdxRef = useRef(activeIdx);
  activeIdxRef.current = activeIdx;
  const suppressUntil = useRef(0);
  const count = opts.count;
  // Keep a live ref so handlers registered once still see the latest count
  // when the day list grows from infinite-scroll loadMore.
  const countRef = useRef(count);
  countRef.current = count;

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    // Direct scroll listener instead of IntersectionObserver — IO only fires
    // at threshold crossings and can miss slow scrollbar drags. scrollTop /
    // clientHeight gives a continuous read on every scroll event.
    const onScroll = () => {
      if (Date.now() < suppressUntil.current) return;
      const h = root.clientHeight;
      if (h <= 0) return;
      const idx = Math.min(count - 1, Math.max(0, Math.round(root.scrollTop / h)));
      if (idx !== activeIdxRef.current) setActiveIdx(idx);
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, [count]);

  const jumpTo = (idx: number) => {
    const clamped = Math.max(0, Math.min(countRef.current - 1, idx));
    if (clamped === activeIdxRef.current) return;
    suppressUntil.current = Date.now() + 900;
    setActiveIdx(clamped);
    sectionRefs.current[clamped]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    let lastFire = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 4) return;
      e.preventDefault();
      const now = Date.now();
      if (now - lastFire < 500) return;
      lastFire = now;
      jumpTo(activeIdxRef.current + (e.deltaY > 0 ? 1 : -1));
    };
    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
        case "j":
          e.preventDefault();
          jumpTo(activeIdxRef.current + 1);
          break;
        case "ArrowUp":
        case "PageUp":
        case "k":
          e.preventDefault();
          jumpTo(activeIdxRef.current - 1);
          break;
        case "Home":
          e.preventDefault();
          jumpTo(0);
          break;
        case "End":
          e.preventDefault();
          jumpTo(count - 1);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count]);

  const registerScroller: RefCallback<HTMLElement> = (el) => {
    scrollerRef.current = el;
  };

  const registerSection = (idx: number): RefCallback<HTMLElement> => (el) => {
    sectionRefs.current[idx] = el;
  };

  return { activeIdx, jumpTo, registerScroller, registerSection };
};

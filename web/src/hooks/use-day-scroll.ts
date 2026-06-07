"use client";

import { useEffect, useRef, useState, type RefCallback } from "react";

export type UseDayScrollOptions = {
  count: number;
  initialIdx?: number;
};

export type UseDayScrollResult = {
  activeIdx: number;
  scrolling: boolean;
  scrollToDay: (idx: number) => void;
  registerScroller: RefCallback<HTMLElement>;
};

// Drives snap scrolling between days and tracks which one is active while the user moves.
export const useDayScroll = (opts: UseDayScrollOptions): UseDayScrollResult => {
  const initialIdx = opts.initialIdx ?? 0;
  const [activeIdx, setActiveIdx] = useState(initialIdx);
  const [scrolling, setScrolling] = useState(false);
  const [scroller, setScroller] = useState<HTMLElement | null>(null);
  const activeIdxRef = useRef(activeIdx);
  activeIdxRef.current = activeIdx;
  const ignoreScrollUntil = useRef(0);
  const scrollIdleTimer = useRef<number | null>(null);
  const settleTimer = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const count = opts.count;
  // Listeners attach once but reach the latest handlers through this ref so they never capture a stale closure.
  const handlers = useRef<{ flagScrolling: () => void; scrollToDay: (idx: number) => void }>(undefined!);

  // Flag motion on each scroll tick and debounce it off 150ms after the last one so both real and programmatic scrolls settle the same way.
  const flagScrolling = () => {
    setScrolling(true);
    if (scrollIdleTimer.current !== null) {
      window.clearTimeout(scrollIdleTimer.current);
    }
    scrollIdleTimer.current = window.setTimeout(() => {
      setScrolling(false);
      scrollIdleTimer.current = null;
    }, 150);
  };

  useEffect(() => {
    if (!scroller) return;
    const computeIdx = () => {
      const h = scroller.clientHeight;
      if (h <= 0) return null;
      return Math.min(count - 1, Math.max(0, Math.round(scroller.scrollTop / h)));
    };
    // Wheel and keyboard updates settle after 60ms so the AnimateDigits spring runs once when the user stops, scrollbar and touch drag bypass the settle so the date flips per day boundary as the user crosses it.
    const onScroll = () => {
      handlers.current.flagScrolling();
      if (Date.now() < ignoreScrollUntil.current) return;
      if (draggingRef.current) {
        const idx = computeIdx();
        if (idx !== null && idx !== activeIdxRef.current) setActiveIdx(idx);
        return;
      }
      if (settleTimer.current !== null) window.clearTimeout(settleTimer.current);
      settleTimer.current = window.setTimeout(() => {
        settleTimer.current = null;
        const idx = computeIdx();
        if (idx !== null && idx !== activeIdxRef.current) setActiveIdx(idx);
      }, 60);
    };
    const onPointerDown = () => {
      draggingRef.current = true;
    };
    const onPointerEnd = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      const idx = computeIdx();
      if (idx !== null && idx !== activeIdxRef.current) setActiveIdx(idx);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    scroller.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerEnd);
    window.addEventListener("pointercancel", onPointerEnd);
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      scroller.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerEnd);
      window.removeEventListener("pointercancel", onPointerEnd);
      if (settleTimer.current !== null) {
        window.clearTimeout(settleTimer.current);
        settleTimer.current = null;
      }
    };
  }, [scroller, count]);

  // Reapply the saved index whenever the scroller mounts since DayScroller remounts across routes while this hook persists in DayProvider.
  useEffect(() => {
    if (!scroller) return;
    const target = activeIdxRef.current > 0 ? activeIdxRef.current : initialIdx;
    if (target <= 0) return;
    const h = scroller.clientHeight;
    if (h <= 0) return;
    ignoreScrollUntil.current = Date.now() + 900;
    scroller.scrollTop = target * h;
  }, [scroller, initialIdx]);

  const scrollToDay = (idx: number) => {
    const clamped = Math.max(0, Math.min(count - 1, idx));
    if (clamped === activeIdxRef.current) return;
    ignoreScrollUntil.current = Date.now() + 900;
    setActiveIdx(clamped);
    scroller?.scrollTo({ top: clamped * scroller.clientHeight, behavior: "smooth" });
  };
  handlers.current = { flagScrolling, scrollToDay };

  useEffect(() => {
    if (!scroller) return;
    let lastFire = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 4) return;
      e.preventDefault();
      const now = Date.now();
      if (now - lastFire < 500) return;
      lastFire = now;
      handlers.current.flagScrolling();
      handlers.current.scrollToDay(activeIdxRef.current + (e.deltaY > 0 ? 1 : -1));
    };
    scroller.addEventListener("wheel", onWheel, { passive: false });
    return () => scroller.removeEventListener("wheel", onWheel);
  }, [scroller]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!scroller) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
        case "j":
          e.preventDefault();
          handlers.current.scrollToDay(activeIdxRef.current + 1);
          break;
        case "ArrowUp":
        case "PageUp":
        case "k":
          e.preventDefault();
          handlers.current.scrollToDay(activeIdxRef.current - 1);
          break;
        case "Home":
          e.preventDefault();
          handlers.current.scrollToDay(0);
          break;
        case "End":
          e.preventDefault();
          handlers.current.scrollToDay(count - 1);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scroller, count]);

  return { activeIdx, scrolling, scrollToDay, registerScroller: setScroller };
};

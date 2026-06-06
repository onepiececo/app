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
  registerSection: (idx: number) => RefCallback<HTMLElement>;
};

// Manages day-based scroll navigation with snap-style wheel/keyboard controls,
// scroll-driven index tracking, smooth programmatic jumps, and a `scrolling`
// flag that consumers can use to blur the date while the user is in motion.
export const useDayScroll = (opts: UseDayScrollOptions): UseDayScrollResult => {
  const initialIdx = opts.initialIdx ?? 0;
  const [activeIdx, setActiveIdx] = useState(initialIdx);
  const [scrolling, setScrolling] = useState(false);
  const [scroller, setScroller] = useState<HTMLElement | null>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const activeIdxRef = useRef(activeIdx);
  activeIdxRef.current = activeIdx;
  const ignoreScrollUntil = useRef(0);
  const didInitScroll = useRef(false);
  const scrollIdleTimer = useRef<number | null>(null);
  const settleTimer = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const count = opts.count;
  const countRef = useRef(count);
  countRef.current = count;

  // Mark scrolling=true on every scroll tick, then debounce it back to false
  // ~150ms after the user stops. Cleared by both real scroll and programmatic
  // scrollIntoView, which fires scroll events too.
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
      flagScrolling();
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

  // Restore scroll on every scroller mount, including remounts after navigating
  // away and back to a route that hosts the scroller. The hook lives in
  // DayProvider on the (home) layout so activeIdxRef survives across route
  // changes, the consumer (DayScroller) does not.
  useEffect(() => {
    if (!scroller) {
      didInitScroll.current = false;
      return;
    }
    const target = activeIdxRef.current > 0 ? activeIdxRef.current : initialIdx;
    if (target <= 0) {
      didInitScroll.current = true;
      return;
    }
    const h = scroller.clientHeight;
    if (h <= 0) return;
    didInitScroll.current = true;
    ignoreScrollUntil.current = Date.now() + 900;
    scroller.scrollTop = target * h;
  }, [scroller, initialIdx]);

  const scrollToDay = (idx: number) => {
    const clamped = Math.max(0, Math.min(countRef.current - 1, idx));
    if (clamped === activeIdxRef.current) return;
    ignoreScrollUntil.current = Date.now() + 900;
    setActiveIdx(clamped);
    sectionRefs.current[clamped]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (!scroller) return;
    let lastFire = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 4) return;
      e.preventDefault();
      const now = Date.now();
      if (now - lastFire < 500) return;
      lastFire = now;
      flagScrolling();
      scrollToDay(activeIdxRef.current + (e.deltaY > 0 ? 1 : -1));
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
          scrollToDay(activeIdxRef.current + 1);
          break;
        case "ArrowUp":
        case "PageUp":
        case "k":
          e.preventDefault();
          scrollToDay(activeIdxRef.current - 1);
          break;
        case "Home":
          e.preventDefault();
          scrollToDay(0);
          break;
        case "End":
          e.preventDefault();
          scrollToDay(count - 1);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scroller, count]);

  const registerSection = (idx: number): RefCallback<HTMLElement> => (el) => {
    sectionRefs.current[idx] = el;
  };

  return { activeIdx, scrolling, scrollToDay, registerScroller: setScroller, registerSection };
};

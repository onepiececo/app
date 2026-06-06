"use client";

import { useEffect, useRef, useState } from "react";

// Caps how often the returned value can change so springs and transitions have
// time to complete between updates. Leading edge fires immediately, mid-window
// changes latch and flush once the cooldown elapses.
export const useThrottledValue = <T,>(value: T, ms = 250): T => {
  const [shown, setShown] = useState(value);
  const lastAt = useRef(0);
  const pending = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const now = window.performance ? performance.now() : Date.now();
    const elapsed = now - lastAt.current;
    if (elapsed >= ms) {
      lastAt.current = now;
      setShown(value);
      return;
    }
    if (pending.current !== null) window.clearTimeout(pending.current);
    pending.current = window.setTimeout(() => {
      lastAt.current = window.performance ? performance.now() : Date.now();
      pending.current = null;
      setShown(value);
    }, ms - elapsed);
    return () => {
      if (pending.current !== null) {
        window.clearTimeout(pending.current);
        pending.current = null;
      }
    };
  }, [value, ms]);

  return shown;
};

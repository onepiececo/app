"use client";

import { useEffect, useState } from "react";

export const useDebouncedValue = <T,>(value: T, ms = 300): T => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(handle);
  }, [value, ms]);
  return debounced;
};

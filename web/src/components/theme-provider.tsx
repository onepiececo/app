"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "theme";

const disableTransitionsDuring = (fn: () => void) => {
  const style = document.createElement("style");
  style.appendChild(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none !important;transition:none !important;animation:none !important}",
    ),
  );
  document.head.appendChild(style);
  fn();
  // Force a reflow so the transitionless styles commit before we remove them
  void window.getComputedStyle(document.body).opacity;
  requestAnimationFrame(() => {
    document.head.removeChild(style);
  });
};

const applyTheme = (theme: Theme) => {
  disableTransitionsDuring(() => {
    const el = document.documentElement;
    el.classList.toggle("dark", theme === "dark");
    el.style.colorScheme = theme;
  });
};

type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider = (props: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof document === "undefined") return "light";
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") return;
      const next: Theme = mql.matches ? "dark" : "light";
      setThemeState(next);
      applyTheme(next);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
    applyTheme(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {props.children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

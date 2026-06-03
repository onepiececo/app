"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";
import { useTheme } from "@/components/theme-provider";

type ThemeToggleProps = {
  variant?: "default" | "secondary" | "outline" | "ghost";
};

export const ThemeToggle = (props: ThemeToggleProps) => {
  const mounted = useMounted();
  const { theme, setTheme } = useTheme();
  const variant = props.variant ?? "outline";

  if (!mounted) {
    return (
      <Button variant={variant} size="icon-lg" disabled aria-label="Toggle theme">
        <Sun />
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size="icon-lg"
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
};

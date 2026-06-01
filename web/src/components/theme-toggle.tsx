"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";
import { useTheme } from "@/components/theme-provider";

type ThemeToggleProps = {
  size?: "default" | "sm" | "lg" | "icon";
};

export const ThemeToggle = (props: ThemeToggleProps) => {
  const mounted = useMounted();
  const { theme, setTheme } = useTheme();
  const size = props.size ?? "icon";

  if (!mounted) {
    return (
      <Button variant="outline" size={size} disabled aria-label="Toggle theme">
        <Sun />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size={size}
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
};

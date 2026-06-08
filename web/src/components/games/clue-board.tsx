"use client";

import { useDay } from "@/components/day-provider";
import { Clue } from "@/components/games/clue";

// Bridges the active day from the rail into the board so the page itself can stay a server component.
export const ClueBoard = () => {
  const { activeDay } = useDay();
  return <Clue date={activeDay.iso} />;
};

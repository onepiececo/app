"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type ClueDayStatus, getClueStatuses } from "@/app/actions/games";
import { useDay } from "@/components/day-provider";
import { getAnonymousKey } from "@/lib/anonymous-key";
import { cn } from "@/lib/utils";

type Status = ClueDayStatus["status"];
type StatusMap = Map<string, Status>;

const ClueStatusContext = createContext<StatusMap>(new Map());

// Fetches the player's clue standing once per mount so the duplicated day sections all read one shared map.
export const ClueStatusProvider = (props: { children: ReactNode }) => {
  const [map, setMap] = useState<StatusMap>(() => new Map());
  useEffect(() => {
    let active = true;
    getClueStatuses("clue", getAnonymousKey()).then((rows) => {
      if (!active) return;
      setMap(new Map(rows.map((r) => [r.date, r.status])));
    });
    return () => {
      active = false;
    };
  }, []);
  return <ClueStatusContext value={map}>{props.children}</ClueStatusContext>;
};

const LABEL: Record<Status, { word: string; tone: string }> = {
  in_progress: { word: "In progress", tone: "text-amber-600 dark:text-amber-400" },
  won: { word: "Correct", tone: "text-success" },
  lost: { word: "Incorrect", tone: "text-destructive" },
};

// Caps label that mirrors the active day's standing, nothing shows for a day the player has not touched.
export const ClueStatus = () => {
  const { activeDay } = useDay();
  const map = useContext(ClueStatusContext);
  const status = map.get(activeDay.iso);
  if (!status) return null;
  const label = LABEL[status];
  return <span className={cn("font-medium text-xs uppercase tracking-wider", label.tone)}>{label.word}</span>;
};

import { type ReactNode } from "react";
import { CalendarClock, ImageIcon } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { cn } from "@/lib/utils";

export type GameTone =
  | "indigo"
  | "emerald"
  | "amber"
  | "rose"
  | "sky"
  | "violet"
  | "cyan"
  | "pink"
  | "fuchsia";

const EYEBROW: Record<GameTone, string> = {
  indigo: "text-indigo-700 dark:text-indigo-300",
  emerald: "text-emerald-700 dark:text-emerald-300",
  amber: "text-amber-800 dark:text-amber-300",
  rose: "text-rose-700 dark:text-rose-300",
  sky: "text-sky-700 dark:text-sky-300",
  violet: "text-violet-700 dark:text-violet-300",
  cyan: "text-cyan-700 dark:text-cyan-300",
  pink: "text-pink-700 dark:text-pink-300",
  fuchsia: "text-fuchsia-700 dark:text-fuchsia-300",
};

const HOVER: Record<GameTone, string> = {
  indigo: "hover:bg-indigo-500/8",
  emerald: "hover:bg-emerald-500/8",
  amber: "hover:bg-amber-500/8",
  rose: "hover:bg-rose-500/8",
  sky: "hover:bg-sky-500/8",
  violet: "hover:bg-violet-500/8",
  cyan: "hover:bg-cyan-500/8",
  pink: "hover:bg-pink-500/8",
  fuchsia: "hover:bg-fuchsia-500/8",
};

export type GameTileProps = {
  name: string;
  tone: GameTone;
  available?: boolean;
  children: ReactNode;
};

export const GameTile = (props: GameTileProps) => {
  const available = props.available ?? false;
  const Icon = available ? ImageIcon : CalendarClock;
  return (
    <div
      className={cn(
        "relative flex aspect-[5/3] w-full flex-col justify-end gap-2 p-5 transition-colors duration-150 ease-out lg:aspect-auto lg:h-full lg:gap-1.5 lg:px-6 lg:py-10 xl:px-8 xl:py-16",
        available ? cn("bg-muted/40", HOVER[props.tone]) : "bg-muted/15 hover:bg-muted/25",
      )}
    >
      <Icon
        aria-hidden
        className={cn(
          "-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2",
          available ? "size-12 text-foreground/10" : "size-10 text-foreground/15",
        )}
      />
      <span
        className={cn(
          "font-medium text-xs uppercase tracking-wider",
          available ? EYEBROW[props.tone] : "text-muted-foreground/70",
        )}
      >
        {props.name}
      </span>
      <Heading className="text-sm leading-snug lg:text-[11px]">
        {available ? props.children : "Coming soon"}
      </Heading>
    </div>
  );
};

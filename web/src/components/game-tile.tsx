import { type ReactNode } from "react";
import { CalendarClock, ImageIcon } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { cn } from "@/lib/utils";

export type GameTileProps = {
  name: string;
  className: string;
  available?: boolean;
  children: ReactNode;
};

export const GameTile = (props: GameTileProps) => {
  const available = props.available ?? false;
  const Icon = available ? ImageIcon : CalendarClock;
  return (
    <div
      className={cn(
        "relative flex aspect-5/3 w-full flex-col justify-end gap-2 p-5 transition-colors duration-150 ease-out lg:aspect-auto lg:h-full lg:gap-1.5 lg:px-6 lg:py-10 xl:px-8 xl:py-16",
        available ? cn("bg-muted/40", props.className) : "bg-muted/15 hover:bg-muted/25",
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
          available ? null : "text-muted-foreground/70",
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

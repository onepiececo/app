import { type ReactNode } from "react";
import Link from "next/link";
import { CalendarClock, ImageIcon } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { cn } from "@/lib/utils";

export type GameTileProps = {
  name: string;
  className: string;
  available?: boolean;
  href?: string;
  preview?: ReactNode;
  status?: ReactNode;
  children: ReactNode;
};

export const GameTile = (props: GameTileProps) => {
  const available = props.available ?? false;
  const Icon = available ? ImageIcon : CalendarClock;

  const surface =
    "relative flex aspect-5/3 w-full flex-col justify-end gap-2 p-5 transition-colors duration-150 ease-out lg:aspect-auto lg:h-full lg:gap-1.5 lg:px-6 lg:py-10 xl:px-8 xl:py-16";

  const nameRow = (muted?: boolean) => (
    <div className="flex items-center justify-between gap-2">
      <span className={cn("font-medium text-xs uppercase tracking-wider", muted && "text-muted-foreground/70")}>{props.name}</span>
      {props.status}
    </div>
  );

  // A tile with an animated preview fills the card with it, the name and description stay at the bottom.
  if (props.preview) {
    const inner = (
      <>
        <div className="min-h-0 flex-1 pb-2">{props.preview}</div>
        {nameRow()}
        <Heading className="text-sm leading-snug lg:text-[11px]">{props.children}</Heading>
      </>
    );
    if (available && props.href) {
      return (
        <Link href={props.href} className={cn(surface, "bg-muted/40", props.className)}>
          {inner}
        </Link>
      );
    }
    return <div className={cn(surface, "bg-muted/40", props.className)}>{inner}</div>;
  }

  const body = (
    <>
      <Icon
        aria-hidden
        className={cn(
          "-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2",
          available ? "size-12 text-foreground/10" : "size-10 text-foreground/15",
        )}
      />
      {nameRow(!available)}
      <Heading className="text-sm leading-snug lg:text-[11px]">{props.children}</Heading>
    </>
  );

  if (available && props.href) {
    return (
      <Link href={props.href} className={cn(surface, "bg-muted/40", props.className)}>
        {body}
      </Link>
    );
  }

  return (
    <div className={cn(surface, available ? cn("bg-muted/40", props.className) : "bg-muted/15 hover:bg-muted/25")}>
      {body}
    </div>
  );
};

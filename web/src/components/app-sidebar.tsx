"use client";

import { HelpCircle, Home, Library, LogOut, PanelLeftClose, PanelLeftOpen, Settings, UserCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimateDigits } from "@/components/animate-number";
import { AnimateText } from "@/components/animate-text";
import { useDay } from "@/components/day-provider";
import { Calendar } from "@/components/ui/calendar";
import { Menu, MenuItem, MenuPopup, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover";
import { useThrottledValue } from "@/hooks/use-throttled-value";
import { SELECTED_DAY_CLASS, toIso } from "@/lib/days";
import { cn } from "@/lib/utils";

const ANIM_INTERVAL = 260;

export type AppSidebarUser = { name: string; email?: string };

export type AppSidebarProps = {
  user?: AppSidebarUser;
};

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/anime", label: "Anime Database", icon: Library },
] as const;

const NavRow = (props: { href: string; label: string; icon: typeof Home; active: boolean }) => {
  const Icon = props.icon;
  return (
    <Link
      href={props.href}
      prefetch
      aria-current={props.active ? "page" : undefined}
      aria-label={props.label}
      className={cn(
        "flex h-8 w-full items-center gap-2 overflow-hidden rounded-md p-2 font-medium text-sm transition-[width,background-color,color] duration-300 ease-out",
        "in-data-[collapsed=true]:size-8!",
        props.active ? "bg-accent/50 text-foreground" : "text-foreground/80 hover:bg-accent/40",
      )}
    >
      <Icon className="size-4 shrink-0 opacity-80" />
      <span className="truncate">{props.label}</span>
    </Link>
  );
};

// Header row, expanded shows brand on the left and the collapse button on the
// right, collapsed renders one button that defaults to the brand and swaps to
// the panel-open icon on hover so a click expands the rail again.
const Header = (props: { collapsed: boolean; onToggle: () => void }) => {
  if (props.collapsed) {
    return (
      <button
        type="button"
        onClick={props.onToggle}
        aria-label="Expand sidebar"
        className="group/header grid size-8 cursor-pointer place-items-center rounded-md outline-none transition-colors hover:bg-accent/40"
      >
        <span className="grid size-6 place-items-center rounded bg-foreground font-bold font-mono text-[10px] text-background tracking-tighter transition-opacity group-hover/header:opacity-0">
          OP
        </span>
        <PanelLeftOpen className="absolute size-4 text-muted-foreground opacity-0 transition-opacity group-hover/header:opacity-100" />
      </button>
    );
  }
  return (
    <div className="flex h-8 w-full items-center justify-between px-1">
      <Link
        href="/"
        aria-label="Back to home"
        className="grid size-6 place-items-center rounded bg-foreground font-bold font-mono text-[10px] text-background tracking-tighter outline-none transition-opacity hover:opacity-90 focus-visible:opacity-90"
      >
        OP
      </Link>
      <button
        type="button"
        onClick={props.onToggle}
        aria-label="Collapse sidebar"
        className="grid size-6 cursor-pointer place-items-center rounded text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
      >
        <PanelLeftClose className="size-4" />
      </button>
    </div>
  );
};

// The date button stays subscribed to DayProvider so the throttled slot-roll
// animation from the old HomeDateBlock still runs. CSS scales the font sizes
// during the rail width transition so the digits morph rather than swap.
const DateButton = () => {
  const day = useDay();
  const [open, setOpen] = useState(false);
  const weekday = useThrottledValue(day.activeDay.weekday, ANIM_INTERVAL);
  const dayNum = useThrottledValue(day.activeDay.day, ANIM_INTERVAL);
  const month = useThrottledValue(day.activeDay.month, ANIM_INTERVAL);
  const year = useThrottledValue(day.activeDay.year, ANIM_INTERVAL);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label="Change day"
            className={cn(
              "flex w-full cursor-pointer flex-col overflow-hidden rounded-md p-2 text-left outline-none transition-[width,padding,gap] duration-300 ease-out hover:bg-accent/40 focus-visible:bg-accent/50",
              "items-start gap-1",
              "in-data-[collapsed=true]:size-8! in-data-[collapsed=true]:items-center in-data-[collapsed=true]:justify-center in-data-[collapsed=true]:gap-0 in-data-[collapsed=true]:p-0!",
            )}
          />
        }
      >
        <AnimateText
          value={weekday}
          variant="mask"
          className="overflow-hidden whitespace-nowrap font-medium text-muted-foreground text-xs uppercase tracking-wider transition-all duration-300 in-data-[collapsed=true]:hidden"
        />
        <AnimateDigits
          value={dayNum}
          pad={2}
          variant="mask"
          className="font-semibold text-foreground tabular-nums tracking-tight transition-[font-size,line-height] duration-300 in-data-[collapsed=true]:text-base in-data-[collapsed=false]:text-7xl in-data-[collapsed=false]:leading-[0.85]"
        />
        <AnimateText
          value={month}
          variant="mask"
          className="overflow-hidden whitespace-nowrap font-semibold text-foreground text-xl leading-tight tracking-tight transition-all duration-300 in-data-[collapsed=true]:hidden"
        />
        <AnimateDigits
          value={year}
          variant="mask"
          className="font-medium text-muted-foreground tabular-nums transition-[font-size] duration-300 in-data-[collapsed=true]:hidden in-data-[collapsed=false]:text-sm"
        />
      </PopoverTrigger>
      <PopoverPopup side="right" align="start">
        <Calendar
          mode="single"
          selected={day.activeDay.date}
          defaultMonth={day.activeDay.date}
          startMonth={day.calendarStartMonth}
          endMonth={day.calendarEndMonth}
          disabled={[{ before: day.firstDate }, { after: day.lastDate }]}
          classNames={{ day_button: SELECTED_DAY_CLASS }}
          onSelect={(picked) => {
            if (!picked) return;
            day.pickDay(toIso(picked));
            setOpen(false);
          }}
        />
      </PopoverPopup>
    </Popover>
  );
};

const ACCOUNT_BUTTON_CLASS = cn(
  "flex h-8 w-full cursor-pointer items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-none transition-[width,background-color] duration-300 ease-out hover:bg-accent/40",
  "in-data-[collapsed=true]:size-8!",
);

const Account = (props: { user?: AppSidebarUser }) => {
  if (!props.user) {
    return (
      <Link href="/signin" prefetch aria-label="Sign in" className={ACCOUNT_BUTTON_CLASS}>
        <HelpCircle aria-hidden className="size-4 shrink-0 opacity-80" />
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate font-medium text-foreground text-xs">Guest</span>
          <span className="truncate text-[11px] text-muted-foreground">Sign in to sync</span>
        </div>
      </Link>
    );
  }
  const user = props.user;
  return (
    <Menu>
      <MenuTrigger
        openOnHover
        delay={120}
        render={
          <button type="button" aria-label={user.name} className={ACCOUNT_BUTTON_CLASS}>
            <span className="grid size-4 shrink-0 place-items-center rounded-sm bg-foreground/15 font-bold text-[9px] text-foreground tabular-nums">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="truncate font-medium text-foreground text-xs">{user.name}</span>
              <span className="truncate text-[11px] text-muted-foreground">{user.email ?? "Signed in"}</span>
            </div>
          </button>
        }
      />
      <MenuPopup side="top" align="start" sideOffset={6} className="min-w-(--anchor-width)">
        <MenuItem>
          <UserCircle aria-hidden className="text-sky-500" />
          Profile
        </MenuItem>
        <MenuItem>
          <Settings aria-hidden className="text-muted-foreground" />
          Settings
        </MenuItem>
        <MenuSeparator />
        <MenuItem variant="destructive">
          <LogOut aria-hidden />
          Sign out
        </MenuItem>
      </MenuPopup>
    </Menu>
  );
};

export const AppSidebar = (props: AppSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  return (
    <aside
      data-collapsed={collapsed}
      style={{ width: collapsed ? "3.5rem" : "16rem" }}
      className="relative hidden shrink-0 flex-col items-stretch gap-2 overflow-hidden border-border border-r bg-sidebar p-3 transition-[width] duration-300 ease-out lg:flex"
    >
      <Header collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <nav className="flex w-full flex-col gap-1">
        {NAV.map((item) => (
          <NavRow
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)}
          />
        ))}
      </nav>
      <DateButton />
      <div className="mt-auto w-full">
        <Account user={props.user} />
      </div>
    </aside>
  );
};

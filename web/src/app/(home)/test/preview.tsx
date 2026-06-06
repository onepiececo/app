"use client";

import { CalendarDays, HelpCircle, Home, Library, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const ROUND = 20;

type VariantId = "A" | "B" | "C";
type NavKey = "home" | "anime";

type Variant = {
  id: VariantId;
  title: string;
  description: string;
};

const MOCK_USER = { name: "Kyle Matzen", email: "kyle@onepiece.co" };

const VARIANTS: Variant[] = [
  {
    id: "A",
    title: "OP at the top of the rail",
    description: "Brand mark sits at the top of the rail in both states, nav under it, big calendar button below nav, avatar at the bottom.",
  },
  {
    id: "B",
    title: "OP only when collapsed",
    description: "No brand mark in expanded mode, the eye lands on the nav first. Collapsed mode brings OP back at the top so the rail still reads as the app's frame.",
  },
  {
    id: "C",
    title: "Mini OP at the bottom",
    description: "Nav at the top so it's the primary action, calendar below, avatar in the bottom slot, and a quiet miniature OP mark sits as a footer beneath the avatar to anchor the rail.",
  },
];

const Brand = (props: { collapsed: boolean; size?: "sm" | "md" }) => {
  const size = props.collapsed ? "size-9 text-sm" : props.size === "sm" ? "size-7 text-xs" : "size-9 text-sm";
  return (
    <div className={cn("grid place-items-center rounded-lg bg-foreground font-bold font-mono text-background tracking-tighter", size)}>
      OP
    </div>
  );
};

const NavRow = (props: {
  icon: typeof Home;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) => {
  const Icon = props.icon;
  if (props.collapsed) {
    return (
      <button
        type="button"
        onClick={props.onClick}
        aria-pressed={props.active}
        aria-label={props.label}
        className={cn(
          "grid size-9 cursor-pointer place-items-center rounded-lg transition-colors",
          props.active ? "bg-accent/50 text-foreground" : "text-foreground/80 hover:bg-accent/40",
        )}
      >
        <Icon className="size-4" />
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={props.onClick}
      aria-pressed={props.active}
      className={cn(
        "-mx-3 flex w-[calc(100%+1.5rem)] cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left font-medium text-sm transition-colors",
        props.active ? "bg-accent/50 text-foreground" : "text-foreground/80 hover:bg-accent/40",
      )}
    >
      <Icon className="size-4 shrink-0 opacity-80" />
      <span className="truncate">{props.label}</span>
    </button>
  );
};

const DateButton = (props: { collapsed: boolean }) => {
  if (props.collapsed) {
    return (
      <button
        type="button"
        aria-label="June 12, 2026"
        className="flex w-12 cursor-pointer flex-col items-center rounded-lg py-1.5 leading-none text-foreground transition-colors hover:bg-accent/40"
      >
        <span className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">Jun</span>
        <span className="font-semibold text-xl tabular-nums">12</span>
      </button>
    );
  }
  return (
    <button
      type="button"
      aria-label="Change day"
      className="-mx-3 flex w-[calc(100%+1.5rem)] cursor-pointer flex-col items-start gap-1.5 rounded-xl px-3 py-3 text-left outline-none transition-colors hover:bg-accent/40 focus-visible:bg-accent/50"
    >
      <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">Friday</span>
      <span className="font-semibold text-7xl text-foreground leading-[0.85] tracking-tight">12</span>
      <span className="flex items-baseline gap-2">
        <span className="font-semibold text-foreground text-xl tracking-tight">June</span>
        <span className="font-medium text-muted-foreground text-sm tabular-nums">2026</span>
      </span>
    </button>
  );
};

const Account = (props: { user?: typeof MOCK_USER; collapsed: boolean }) => {
  const signedIn = !!props.user;
  const avatar = (
    <Avatar shape="square" size="md">
      <AvatarFallback tone="neutral">
        {signedIn ? props.user!.name.slice(0, 1).toUpperCase() : <HelpCircle aria-hidden className="size-4" />}
      </AvatarFallback>
    </Avatar>
  );
  if (props.collapsed) return avatar;
  return (
    <button type="button" className="-mx-3 flex w-[calc(100%+1.5rem)] cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent/40">
      {avatar}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium text-foreground text-sm">
          {signedIn ? props.user!.name : "Anonymous"}
        </span>
        <span className="truncate text-muted-foreground text-xs">
          {signedIn ? props.user!.email ?? "Signed in" : "Play resumes on this device"}
        </span>
      </div>
    </button>
  );
};

const Rail = (props: { collapsed: boolean; children: React.ReactNode }) => (
  <aside
    className={cn(
      "flex shrink-0 flex-col items-start gap-3 overflow-hidden border-border border-r bg-sidebar transition-[width,padding] duration-300 ease-out",
      props.collapsed ? "w-20 items-center p-4" : "w-[26rem] p-16",
    )}
  >
    {props.children}
  </aside>
);

const PaneStub = (props: { label: string }) => (
  <div className="flex-1 bg-background p-10">
    <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">{props.label}</span>
    <div className="mt-3 h-32 rounded-md bg-muted/40" />
  </div>
);

const Nav = (props: { active: NavKey; collapsed: boolean; onPick: (k: NavKey) => void }) => (
  <nav className={cn("flex w-full flex-col gap-1", props.collapsed && "items-center")}>
    <NavRow icon={Home} label="Home" active={props.active === "home"} collapsed={props.collapsed} onClick={() => props.onPick("home")} />
    <NavRow icon={Library} label="Anime Database" active={props.active === "anime"} collapsed={props.collapsed} onClick={() => props.onPick("anime")} />
  </nav>
);

export const Preview = () => {
  const [current, setCurrent] = useState<VariantId>("A");
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState<NavKey>("home");
  const variant = VARIANTS.find((v) => v.id === current) ?? VARIANTS[0];
  const paneLabel = active === "home" ? "Home grid" : "Anime database";

  const render = () => {
    if (current === "A") {
      return (
        <Rail collapsed={collapsed}>
          <Brand collapsed={collapsed} />
          {!collapsed ? <div className="h-2" /> : null}
          <Nav active={active} collapsed={collapsed} onPick={setActive} />
          <DateButton collapsed={collapsed} />
          <div className={cn("mt-auto", collapsed ? "" : "w-full")}>
            <Account collapsed={collapsed} />
          </div>
        </Rail>
      );
    }
    if (current === "B") {
      return (
        <Rail collapsed={collapsed}>
          {collapsed ? <Brand collapsed /> : null}
          {collapsed ? <div className="h-3" /> : null}
          <Nav active={active} collapsed={collapsed} onPick={setActive} />
          <DateButton collapsed={collapsed} />
          <div className={cn("mt-auto", collapsed ? "" : "w-full")}>
            <Account collapsed={collapsed} />
          </div>
        </Rail>
      );
    }
    return (
      <Rail collapsed={collapsed}>
        {collapsed ? <Brand collapsed /> : null}
        {collapsed ? <div className="h-3" /> : null}
        <Nav active={active} collapsed={collapsed} onPick={setActive} />
        <DateButton collapsed={collapsed} />
        <div className={cn("mt-auto flex flex-col gap-3", collapsed ? "items-center" : "w-full")}>
          <Account collapsed={collapsed} />
          {!collapsed ? <Brand collapsed={false} size="sm" /> : null}
        </div>
      </Rail>
    );
  };

  return (
    <>
      <div className="flex items-baseline gap-3">
        <h1 className="font-semibold text-2xl text-foreground tracking-tight">Home sidebar, OP placement</h1>
        <span className="text-muted-foreground text-sm tabular-nums">Round {ROUND}</span>
      </div>
      <p className="max-w-2xl text-muted-foreground text-sm">
        All three variants share the same skeleton, nav at the top, calendar button below it, avatar at the bottom. The variation is where the OP brand mark lives, top of the rail, only when collapsed, or as a small footer in expanded.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {VARIANTS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setCurrent(v.id)}
            aria-pressed={v.id === current}
            className={cn(
              "flex items-center gap-2 rounded-md border px-3 py-1.5 font-medium text-xs transition-colors",
              v.id === current
                ? "border-foreground/15 bg-foreground/5 text-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="font-mono uppercase tracking-wider">{v.id}</span>
            <span>{v.title}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="ml-auto flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-medium text-foreground text-xs hover:bg-accent/40"
        >
          {collapsed ? <PanelLeftOpen className="size-3.5" /> : <PanelLeftClose className="size-3.5" />}
          {collapsed ? "Expand sidebar" : "Collapse sidebar"}
        </button>
      </div>

      <p className="text-muted-foreground text-sm">{variant.description}</p>

      <div className="flex min-h-[36rem] overflow-hidden rounded-lg border border-border">
        {render()}
        <PaneStub label={paneLabel} />
      </div>
    </>
  );
};

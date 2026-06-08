"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode } from "react";
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs";

type TabValue = "signin" | "signup";

const pathFor = (tab: TabValue) => (tab === "signin" ? "/signin" : "/signup");

// The persistent half of the auth card, it lives in the layout so the tab indicator animates across the route change.
// The matching form renders below as children from the route page.
export const AuthShell = (props: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const tab: TabValue = pathname === "/signup" ? "signup" : "signin";
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/"
          aria-label="Back to home"
          className="grid size-10 place-items-center rounded-lg bg-foreground font-bold font-mono text-background text-sm tracking-tighter outline-none transition-opacity hover:opacity-90 focus-visible:opacity-90"
        >
          OP
        </Link>
        <h1 className="font-semibold text-2xl tracking-tight">
          {tab === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {tab === "signin"
            ? "Sign in to sync your puzzles and history across devices."
            : "An account keeps your streak, scores, and history synced everywhere."}
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => router.push(pathFor(v as TabValue), { scroll: false })}>
        <TabsList variant="inset" fullWidth>
          <TabsTab value="signin" className="flex-1">Sign in</TabsTab>
          <TabsTab value="signup" className="flex-1">Create account</TabsTab>
        </TabsList>
      </Tabs>

      {props.children}
    </div>
  );
};

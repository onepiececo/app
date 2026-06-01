"use client";

import { CheckIcon } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Select,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectLabel,
  SelectPopup,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COMPONENT = "Select";
const ROUND = 1;

const planLabels: Record<string, string> = {
  business: "Business, $99/mo",
  enterprise: "Enterprise, custom",
  pro: "Pro, $12/mo",
  starter: "Starter, free",
  team: "Team, $40/mo",
};

const PlanSelect = (props: { defaultOpen?: boolean; label: string }) => {
  return (
    <Select defaultOpen={props.defaultOpen} defaultValue="starter">
      <SelectLabel>{props.label}</SelectLabel>
      <SelectTrigger className="w-60">
        <SelectValue placeholder="Choose a plan">
          {(value) => (typeof value === "string" ? planLabels[value] : null)}
        </SelectValue>
      </SelectTrigger>
      <SelectPopup>
        <SelectGroup>
          <SelectGroupLabel>Personal</SelectGroupLabel>
          <SelectItem value="starter">Starter, free</SelectItem>
          <SelectItem value="pro">Pro, $12/mo</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectGroupLabel>Teams</SelectGroupLabel>
          <SelectItem value="team">Team, $40/mo</SelectItem>
          <SelectItem value="business">Business, $99/mo</SelectItem>
          <SelectItem disabled value="enterprise">Enterprise, custom</SelectItem>
        </SelectGroup>
      </SelectPopup>
    </Select>
  );
};

export default function TestPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-border bg-background/80 px-4 py-3 backdrop-blur sm:px-6">
        <Link href="/" className="justify-self-start font-medium text-sm">
          Template
        </Link>
        <span className="text-muted-foreground text-sm">
          {COMPONENT} · Round {ROUND}
        </span>
        <div className="justify-self-end">
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="font-semibold text-2xl tracking-tight">
            {COMPONENT} primitive
          </h1>
          <p className="mt-2 max-w-3xl text-muted-foreground text-sm">
            Actual Select primitive using the chosen trigger and popup treatment. The selected item now uses Lucide&apos;s CheckIcon instead of a custom inline path.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-lg tracking-tight">Closed state</h2>
            <p className="mt-1 text-muted-foreground text-sm">
              Button-like outline trigger, token-backed popup surface, and standard Select anatomy.
            </p>
            <div className="mt-5">
              <PlanSelect label="Plan" />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-lg tracking-tight">Open state</h2>
            <p className="mt-1 text-muted-foreground text-sm">
              The trigger ring remains visible while the popup is open.
            </p>
            <div className="mt-5 min-h-72">
              <PlanSelect defaultOpen label="Plan" />
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold text-lg tracking-tight">Indicator icon</h2>
          <p className="mt-1 text-muted-foreground text-sm">
            This is the replacement for the custom SVG path.
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 font-medium text-sm">
              <CheckIcon className="size-4 opacity-80" />
              Lucide CheckIcon
            </div>
            <div className="text-muted-foreground text-sm">
              The same icon is used inside selected Select items.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

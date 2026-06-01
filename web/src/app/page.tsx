import {
  Component,
  KeyRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Heading, Subheading } from "@/components/ui/heading";
import { ThemeToggle } from "@/components/theme-toggle";
import { ConceptsTable } from "@/components/concepts/concepts-table";

type Quick = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

const QUICK: Quick[] = [
  {
    href: "/components",
    title: "Components",
    description: "Every UI primitive in one showcase, with variant rounds and design history.",
    icon: Component,
  },
  {
    href: "/auth",
    title: "Auth",
    description: "Better-Auth variants for sign-in, sign-up, and protected routes.",
    icon: KeyRound,
  },
];

export default function Page() {
  return (
    <main className="flex min-h-dvh flex-col bg-background">
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-6 py-3">
        <span className="font-semibold text-sm">Template</span>
        <span className="text-muted-foreground text-xs">
          Next.js 16, Better-Auth, Tailwind CSS v4
        </span>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12">
        <section className="flex flex-col gap-2">
          <Heading>Template</Heading>
          <Subheading>
            A starter scaffolded with Bun, React Compiler, and Turbopack
            filesystem cache.
          </Subheading>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-semibold text-sm">Quick links</h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {QUICK.map((q) => (
              <li key={q.href}>
                <Link
                  href={q.href}
                  className="group flex h-full flex-col gap-2 rounded-xl border border-border bg-card p-5 outline-hidden transition-shadow hover:shadow-[0_2px_8px_-2px_rgb(0_0_0/0.08)] focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <q.icon className="size-5 opacity-70 transition-opacity group-hover:opacity-100" />
                  <span className="font-semibold text-sm">{q.title}</span>
                  <span className="text-muted-foreground text-sm leading-snug">
                    {q.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="font-semibold text-sm">Concepts</h2>
            <p className="text-muted-foreground text-sm">
              Real-product compositions built from the primitives. Add a concept
              by dropping a folder under <span className="font-mono text-xs">src/app/concepts/</span>.
            </p>
          </div>
          <ConceptsTable />
        </section>
      </div>
    </main>
  );
}

import { Puzzle, Grid3x3, KeyRound, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Heading, Subheading } from "@/components/ui/heading";
import { ThemeToggle } from "@/components/theme-toggle";

type Quick = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

const QUICK: Quick[] = [
  {
    href: "/clue",
    title: "Daily Anime Clue",
    description: "Guess the anime, six progressive clues, one chance per day.",
    icon: Puzzle,
  },
  {
    href: "/wordle",
    title: "Daily Anime Wordle",
    description: "Guess any anime, color-coded comparison across seven categories.",
    icon: Grid3x3,
  },
  {
    href: "/auth",
    title: "Sign in",
    description: "Better Auth, anonymous play merges into your account once you sign in.",
    icon: KeyRound,
  },
];

export default function Page() {
  return (
    <main className="flex min-h-dvh flex-col bg-background">
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-6 py-3">
        <span className="font-semibold text-sm">onepiece</span>
        <span className="text-muted-foreground text-xs">daily anime guessing games</span>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12">
        <section className="flex flex-col gap-2">
          <Heading>onepiece</Heading>
          <Subheading>
            Wordle style anime puzzles, no clips, no spoilers, just brain damage.
          </Subheading>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-semibold text-sm">Play</h2>
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
      </div>
    </main>
  );
}

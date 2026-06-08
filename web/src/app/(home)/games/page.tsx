import type { ReactNode } from "react";
import { getDailyGames } from "@/app/actions/days";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Games scratchpad | onepiece",
};

type Status = "new" | "progress" | "won" | "lost";
const STATES: { key: Status; caption: string }[] = [
  { key: "new", caption: "Not started" },
  { key: "progress", caption: "In progress" },
  { key: "won", caption: "Won" },
  { key: "lost", caption: "Lost" },
];

// Wording and tones follow the clue result line, Correct in success green and the loss in destructive red.
const WORD: Record<Status, string> = { new: "Not started", progress: "In progress", won: "Correct", lost: "Incorrect" };
const TEXT_TONE: Record<Status, string> = {
  new: "text-muted-foreground",
  progress: "text-amber-600 dark:text-amber-400",
  won: "text-success",
  lost: "text-destructive",
};
const RING_TONE: Record<Status, string> = {
  new: "ring-border text-muted-foreground",
  progress: "ring-amber-500/40 text-amber-600 dark:text-amber-400",
  won: "ring-success/40 text-success",
  lost: "ring-destructive/40 text-destructive",
};
const BADGE_VARIANT: Record<Status, "default" | "success" | "destructive" | "warning"> = {
  new: "default",
  progress: "warning",
  won: "success",
  lost: "destructive",
};

const TREATMENTS: { id: string; title: string; render: (s: Status) => ReactNode }[] = [
  {
    id: "A",
    title: "Solid badge",
    render: (s) => <Badge variant={BADGE_VARIANT[s]}>{WORD[s]}</Badge>,
  },
  {
    id: "B",
    title: "Soft badge",
    render: (s) => <Badge appearance="soft" variant={BADGE_VARIANT[s]}>{WORD[s]}</Badge>,
  },
  {
    id: "C",
    title: "Caps label",
    render: (s) => <span className={cn("font-medium text-xs uppercase tracking-wider", TEXT_TONE[s])}>{WORD[s]}</span>,
  },
  {
    id: "D",
    title: "Outline chip",
    render: (s) => <span className={cn("rounded-md px-1.5 py-0.5 font-medium text-xs ring-1 ring-inset", RING_TONE[s])}>{WORD[s]}</span>,
  },
];

// A close stand in for the home Cover tile, the status rides the name row to the right of the title.
const Tile = (props: { tagline: string; status: ReactNode }) => (
  <div className="flex aspect-5/3 w-72 max-w-full flex-col justify-end gap-1.5 bg-muted/40 p-5 text-sky-700 dark:text-sky-300">
    <div className="flex items-center justify-between gap-2">
      <span className="font-medium text-xs uppercase tracking-wider">Cover</span>
      {props.status}
    </div>
    <p className="text-foreground text-sm leading-snug">{props.tagline}</p>
  </div>
);

export default async function GamesPage() {
  const games = await getDailyGames("");
  const cover = games.find((g) => g.key === "cover") ?? games[0];
  const tagline = cover?.tagline ?? "Guess the anime from a blurred cover that clears with each wrong guess.";

  return (
    <main className="relative min-h-0 flex-1 overflow-y-auto">
      <div className="flex flex-col gap-10 px-6 pt-3 pb-10 lg:px-8 xl:px-12">
        {TREATMENTS.map((t) => (
          <section key={t.id} className="flex flex-col gap-4">
            <h2 className="font-medium text-foreground text-sm">{t.title}</h2>
            <div className="flex flex-wrap items-center gap-x-10 gap-y-5">
              <Tile tagline={tagline} status={t.render("progress")} />
              <div className="flex flex-col gap-2.5">
                {STATES.map((st) => (
                  <div key={st.key} className="flex items-center gap-3">
                    <span className="w-24 text-muted-foreground text-xs">{st.caption}</span>
                    {t.render(st.key)}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

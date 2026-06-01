import { Heading } from "@/components/ui/heading";
import { WordleBoard } from "./wordle-board";

export const metadata = {
  title: "Daily Anime Wordle",
  description: "Guess any anime. Each guess shows how close it is across seven categories.",
};

const Page = () => {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-1">
        <Heading level={1}>Daily Anime Wordle</Heading>
        <p className="text-sm text-muted-foreground">
          Type any anime, the grid shows how close it is across format, year, episodes, score, source, studios, and genres. Six guesses.
        </p>
      </header>
      <WordleBoard />
    </main>
  );
};

export default Page;

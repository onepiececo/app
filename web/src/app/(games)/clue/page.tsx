import { Heading } from "@/components/ui/heading";
import { getTodayPuzzle } from "@/app/actions/puzzles";
import { ClueBoard } from "./clue-board";

export const metadata = {
  title: "Daily Anime Clue",
  description: "Guess the anime, six clues, one chance per day.",
};

const Page = async () => {
  // Public puzzle load on the server, the anon-key-bound attempt and guesses fill in client side on mount.
  const initial = await getTodayPuzzle("clue");

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-1">
        <Heading level={1}>Daily Anime Clue</Heading>
        <p className="text-sm text-muted-foreground">
          Guess the anime. Each wrong guess reveals one new clue. Six chances.
        </p>
      </header>
      <ClueBoard initial={initial.success ? initial.data : null} initialError={initial.success ? null : initial.error} />
    </main>
  );
};

export default Page;

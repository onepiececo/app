import { getGame } from "@/app/actions/days";
import { cn } from "@/lib/utils";
import { ClueBoard } from "@/components/games/clue-board";

export default async function CluePage() {
  const game = await getGame("clue");
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h1 className={cn("font-semibold text-2xl tracking-tight", game?.accent)}>{game?.name ?? "Clue"}</h1>
        <p className="text-muted-foreground text-sm">{game?.tagline}</p>
      </div>
      <ClueBoard />
    </>
  );
}

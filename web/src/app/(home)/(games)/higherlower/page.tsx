import { getGame } from "@/app/actions/days";
import { HigherBoard } from "@/components/games/higher-board";
import { cn } from "@/lib/utils";

export default async function HigherLowerPage() {
  const game = await getGame("higherlower");
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h1 className={cn("font-semibold text-2xl tracking-tight", game?.accent)}>{game?.name ?? "Higher or Lower"}</h1>
        <p className="text-muted-foreground text-sm">{game?.tagline}</p>
      </div>
      <HigherBoard />
    </>
  );
}

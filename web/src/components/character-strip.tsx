import { ImageIcon } from "lucide-react";
import Image from "next/image";
import type { AnimeCharacter } from "@/app/actions/anime";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type CharacterStripProps = {
  characters: AnimeCharacter[];
  // Hard cap, infinite scroll would be overkill for the detail page.
  limit?: number;
};

// Same shadow stack the anime grid uses so text reads against any character art.
const OVERLAY_TEXT = "[text-shadow:_0_0_3px_rgb(0_0_0/0.95),_0_1px_3px_rgb(0_0_0/0.9),_0_2px_8px_rgb(0_0_0/0.5)]";

// Role color, amber leads for main cast since they carry the story, sky for
// supporting reads as a quieter second tier, zinc for background fades.
const roleColor = (role: AnimeCharacter["role"]) => {
  if (role === "MAIN") return "text-amber-300";
  if (role === "SUPPORTING") return "text-sky-300";
  return "text-zinc-300";
};

const CharacterTile = (props: { character: AnimeCharacter }) => {
  const c = props.character;
  return (
    <div className="relative aspect-2/3 w-24 shrink-0 overflow-hidden bg-muted/40">
      {c.imageUrl ? (
        <Image src={c.imageUrl} alt={c.name} fill sizes="6rem" className="object-cover" />
      ) : (
        <ImageIcon aria-hidden className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 size-5 text-foreground/15" />
      )}
      <span className={cn("absolute top-1.5 right-1.5 left-1.5 line-clamp-2 font-semibold text-white text-xs leading-tight", OVERLAY_TEXT)}>
        {c.name}
      </span>
      <span className={cn("absolute right-1.5 bottom-1.5 font-semibold text-[10px] capitalize", roleColor(c.role), OVERLAY_TEXT)}>
        {c.role.toLowerCase()}
      </span>
    </div>
  );
};

export const CharacterStrip = (props: CharacterStripProps) => {
  const limit = props.limit ?? 20;
  const mains = props.characters.filter((c) => c.role === "MAIN");
  const rest = props.characters.filter((c) => c.role !== "MAIN");
  const ordered = [...mains, ...rest].slice(0, limit);
  if (ordered.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">Characters</h2>
        <span className="text-muted-foreground text-xs tabular-nums">
          {props.characters.length} total
        </span>
      </div>
      <div className="h-40 overflow-hidden">
        <ScrollArea scrollFade>
          <div className="flex items-start gap-3">
            {ordered.map((c) => <CharacterTile key={c.id} character={c} />)}
          </div>
        </ScrollArea>
      </div>
    </section>
  );
};

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

const ACCENT = "text-indigo-700 dark:text-indigo-300";

// A sample answer's clue columns, the spotlight hops around sharpening one at a time.
const FACETS = [
  { label: "Year", value: "2008" },
  { label: "Studio", value: "J.C.Staff" },
  { label: "Source", value: "Light novel" },
  { label: "Score", value: "8.1" },
  { label: "Genres", value: "Romance" },
  { label: "Tags", value: "School" },
];

const HOP = [0, 4, 2, 5, 1, 3];
const SECONDS = 2.6;
const BLUR = "5px";

const CSS = `
@keyframes clueHopBlur {
  0% { filter: blur(var(--b)); }
  10% { filter: blur(0); }
  22% { filter: blur(0); }
  32% { filter: blur(var(--b)); }
  100% { filter: blur(var(--b)); }
}
@media (prefers-reduced-motion: reduce) {
  .clue-preview-val { animation: none !important; filter: none !important; }
}
`;

export const CluePreview = () => (
  <>
    <style>{CSS}</style>
    <div className="grid h-full grid-cols-2 grid-rows-3 gap-x-6 gap-y-2">
      {FACETS.map((f, i) => {
        const delay = HOP.indexOf(i) * (SECONDS / 6);
        const style: CSSProperties = {
          "--b": BLUR,
          animation: `clueHopBlur ${SECONDS}s ease-out ${delay}s infinite`,
        } as CSSProperties;
        return (
          <div key={f.label} className="flex min-w-0 flex-col justify-center gap-0.5">
            <span className="truncate text-[9px] text-muted-foreground uppercase tracking-wide">{f.label}</span>
            <span className={cn("clue-preview-val truncate font-semibold text-sm", ACCENT)} style={style}>
              {f.value}
            </span>
          </div>
        );
      })}
    </div>
  </>
);

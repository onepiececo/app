import { type ReactNode } from "react";

// Owns the shared chrome for /anime and /anime/[id], horizontal padding mirrors
// the sidebar's p-10 xl:p-16 and the top pad accounts for the date block's own
// py-3 button padding so the page title sits at the same baseline as Friday.
// Children compose as flex siblings, the gap-8 spaces them so individual
// sections do not duplicate vertical margins.
export default function AnimeLayout(props: { children: ReactNode }) {
  return (
    <main className="relative min-h-0 flex-1 overflow-y-auto">
      <div className="flex flex-col gap-8 px-10 pt-13 pb-10 xl:px-16 xl:pt-19">
        {props.children}
      </div>
    </main>
  );
}

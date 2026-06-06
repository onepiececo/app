import { type ReactNode } from "react";

// Owns the shared chrome for /anime and /anime/[id], children stack as flex siblings and gap-8 carries the inter-section spacing.
export default function AnimeLayout(props: { children: ReactNode }) {
  return (
    <main className="relative min-h-0 flex-1 overflow-y-auto">
      <div className="flex flex-col gap-8 px-6 pt-3 pb-10 lg:px-8 xl:px-12">
        {props.children}
      </div>
    </main>
  );
}

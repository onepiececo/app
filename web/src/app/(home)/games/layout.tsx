import { type ReactNode } from "react";

// Same scrollable, padded chrome as the anime database so the games sit in the real app shell.
export default function GamesLayout(props: { children: ReactNode }) {
  return (
    <main className="relative min-h-0 flex-1 overflow-y-auto">
      <div className="flex flex-col gap-8 px-6 pt-3 pb-10 lg:px-8 xl:px-12">
        {props.children}
      </div>
    </main>
  );
}

import { type ReactNode } from "react";

// Two-column auth shell, the form lives on the left, a decorative panel
// carries the brand on the right at lg and up.
export default function AuthLayout(props: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center bg-background p-6 sm:p-12">
        <div className="w-full max-w-sm">{props.children}</div>
      </div>
      <div className="hidden lg:block">
        <BrandPanel />
      </div>
    </div>
  );
}

const BrandPanel = () => (
  <div
    className="relative h-full w-full overflow-hidden"
    style={{
      background:
        "radial-gradient(at 30% 20%, color-mix(in srgb, var(--primary) 28%, var(--background)), var(--background) 70%)",
    }}
  >
    <div className="relative flex h-full flex-col justify-between p-10">
      <div className="grid size-10 place-items-center rounded-lg bg-foreground font-bold font-mono text-background text-sm tracking-tighter">
        OP
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-semibold text-foreground text-2xl tracking-tight">
          Daily anime puzzles, no spoilers, no clips.
        </h2>
        <p className="max-w-md text-muted-foreground text-sm">
          Sign in to sync your streak across devices and unlock the daily leaderboard.
        </p>
      </div>
    </div>
  </div>
);

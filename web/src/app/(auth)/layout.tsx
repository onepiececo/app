import Link from "next/link";
import { type ReactNode } from "react";
import { browseAnime } from "@/app/actions/anime";
import { AuthShell } from "@/components/auth-shell";
import { CoverWall } from "@/components/cover-wall";

// Refetch the wall on every visit so the panel never feels static.
export const dynamic = "force-dynamic";

const HEADLINE = "Guess the daily anime, no spoilers and no clips.";
const SUBCOPY = "Sign in to keep your streak and history synced across every device.";

// AuthCard lives in the layout so it survives the signin to signup route change and the tabs animate instead of remounting.
export default async function AuthLayout(props: { children: ReactNode }) {
  const covers = (await browseAnime("popularity", 48).catch(() => [])).filter((a) => a.coverSourceUrl);
  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center bg-background p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <AuthShell>{props.children}</AuthShell>
        </div>
      </div>
      <div className="hidden lg:block">
        <BrandPanel covers={covers} />
      </div>
    </div>
  );
}

type BrandPanelProps = {
  covers: Awaited<ReturnType<typeof browseAnime>>;
};

const BrandPanel = (props: BrandPanelProps) => (
  <div className="relative h-full w-full overflow-hidden bg-muted">
    <CoverWall covers={props.covers} columns={6} perColumn={6} edgeFade />
    {/* Scrim fades the wall into the page background so the brand copy stays legible. */}
    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(to top, color-mix(in srgb, var(--background) 94%, transparent), color-mix(in srgb, var(--background) 45%, transparent) 45%, color-mix(in srgb, var(--primary) 24%, transparent))",
      }}
    />
    <div className="relative flex h-full flex-col justify-between p-10">
      <Link
        href="/"
        aria-label="Back to home"
        className="grid size-10 place-items-center rounded-lg bg-foreground font-bold font-mono text-background text-sm tracking-tighter outline-none transition-opacity hover:opacity-90 focus-visible:opacity-90"
      >
        OP
      </Link>
      <div className="flex flex-col gap-2">
        <h2 className="max-w-md font-semibold text-foreground text-2xl tracking-tight">{HEADLINE}</h2>
        <p className="max-w-md text-muted-foreground text-sm">{SUBCOPY}</p>
      </div>
    </div>
  </div>
);

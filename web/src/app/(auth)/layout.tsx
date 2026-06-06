import Image from "next/image";
import Link from "next/link";
import { type ReactNode } from "react";
import { browseAnime, type AnimeHit } from "@/app/actions/anime";
import { cloudinaryFetch, hasCloudinary } from "@/lib/image";

// Re-pick the backdrop cover on every visit so the panel never feels static.
export const dynamic = "force-dynamic";

const HEADLINE = "Guess the daily anime, no spoilers and no clips.";
const SUBCOPY = "Sign in to keep your streak and history synced across every device.";

// Pull a recognizable popular cover at random. Covers are official key art so they never spoil.
const pickCover = async (): Promise<AnimeHit | null> => {
  const pool = await browseAnime("popularity", 40).catch(() => []);
  const withCover = pool.filter((a) => a.coverSourceUrl);
  if (withCover.length === 0) return null;
  return withCover[Math.floor(Math.random() * withCover.length)];
};

// Two-column auth shell, the form lives on the left, a cover-backed brand
// panel carries the pitch on the right at lg and up.
export default async function AuthLayout(props: { children: ReactNode }) {
  const cover = await pickCover();
  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center bg-background p-6 sm:p-12">
        <div className="w-full max-w-sm">{props.children}</div>
      </div>
      <div className="hidden lg:block">
        <BrandPanel cover={cover} />
      </div>
    </div>
  );
}

type BrandPanelProps = {
  cover: AnimeHit | null;
};

const BrandPanel = (props: BrandPanelProps) => {
  const cover = props.cover;
  const src = cover?.coverSourceUrl
    ? hasCloudinary()
      ? cloudinaryFetch(cover.coverSourceUrl, { width: 1400 })
      : cover.coverSourceUrl
    : null;

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-muted"
      style={cover?.coverColor ? { backgroundColor: cover.coverColor } : undefined}
    >
      {src ? (
        <Image src={src} alt="" aria-hidden fill priority sizes="50vw" className="object-cover" />
      ) : null}
      {/* Scrim fades the cover into the page background so the brand copy stays legible. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, color-mix(in srgb, var(--background) 94%, transparent), color-mix(in srgb, var(--background) 35%, transparent) 45%, color-mix(in srgb, var(--primary) 28%, transparent))",
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
          <h2 className="max-w-md font-semibold text-foreground text-2xl tracking-tight">
            {HEADLINE}
          </h2>
          <p className="max-w-md text-muted-foreground text-sm">{SUBCOPY}</p>
        </div>
      </div>
    </div>
  );
};

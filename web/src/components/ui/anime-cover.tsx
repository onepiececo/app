"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { cloudinaryFetch, hasCloudinary } from "@/lib/image";

type AnimeCoverProps = {
  sourceUrl: string | null | undefined;
  // Hex color from AniList's coverImage.color. Used as the skeleton background while loading.
  coverColor?: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
  // Blur intensity 0 to 2000. Zero ships a sharp image.
  blur?: number;
  // Eager load and fetch with high priority for an above-the-fold cover so it is not lazy loaded.
  priority?: boolean;
};

export const AnimeCover = (props: AnimeCoverProps) => {
  const [loaded, setLoaded] = useState(false);

  if (!props.sourceUrl) {
    return (
      <div
        className={cn("rounded-md bg-muted", props.className)}
        style={{ width: props.width, height: props.height, backgroundColor: props.coverColor ?? undefined }}
        aria-hidden="true"
      />
    );
  }

  const src = hasCloudinary()
    ? cloudinaryFetch(props.sourceUrl, { width: props.width * 2, blur: props.blur })
    : props.sourceUrl;

  return (
    <div
      className={cn("relative overflow-hidden rounded-md", props.className)}
      style={{ width: props.width, height: props.height, backgroundColor: props.coverColor ?? undefined }}
    >
      <Image
        src={src}
        alt={props.alt}
        width={props.width}
        height={props.height}
        priority={props.priority}
        onLoad={() => setLoaded(true)}
        className={cn("h-full w-full object-cover transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0")}
      />
    </div>
  );
};

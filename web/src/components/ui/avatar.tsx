"use client";

import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import { PlusIcon, UserIcon } from "lucide-react";
import type React from "react";
import { Children, type ComponentProps, type ReactNode } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { mergeBaseUiClassName } from "@/lib/base-ui-class-name";

export type AvatarTone =
  | "neutral"
  | "amber"
  | "emerald"
  | "sky"
  | "blue"
  | "violet"
  | "pink"
  | "rose";

const TONE_CYCLE: AvatarTone[] = [
  "amber",
  "emerald",
  "sky",
  "blue",
  "violet",
  "pink",
  "rose",
];

export function avatarToneFromSeed(seed: string): AvatarTone {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return TONE_CYCLE[hash % TONE_CYCLE.length];
}

export const avatarVariants = tv({
  slots: {
    root: "relative inline-flex shrink-0 select-none items-center justify-center overflow-visible bg-background align-middle font-semibold",
    image: "size-full rounded-[inherit] object-cover",
    fallback: "flex size-full items-center justify-center rounded-[inherit]",
    iconFallback: "flex size-full items-center justify-center rounded-[inherit]",
    icon: "size-[58%]",
    badge:
      "pointer-events-none absolute z-10 inline-flex items-center justify-center rounded-full in-data-[shape=square]:rounded-[30%] bg-background text-[10px] font-semibold leading-none ring-2 ring-background",
    status: "size-1/4 rounded-full! p-0",
    empty:
      "cursor-pointer border-2 border-dashed border-border bg-transparent text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground",
    emptyIcon: "size-[45%]",
    group:
      "flex items-center [&_[data-slot=avatar]]:ring-2 [&_[data-slot=avatar]]:ring-background",
  },
  variants: {
    size: {
      xs: { root: "size-5 text-[10px]" },
      sm: { root: "size-6 text-xs" },
      md: { root: "size-8 text-sm" },
      lg: { root: "size-10 text-base" },
      xl: { root: "size-12 text-lg" },
      "2xl": { root: "size-14 text-xl" },
    },
    shape: {
      circle: { root: "rounded-full" },
      square: { root: "rounded-[25%]" },
    },
    tone: {
      neutral: {
        fallback: "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200",
      },
      amber: {
        fallback: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
      },
      emerald: {
        fallback: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
      },
      sky: {
        fallback: "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300",
      },
      blue: {
        fallback: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
      },
      violet: {
        fallback: "bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300",
      },
      pink: {
        fallback: "bg-pink-100 text-pink-800 dark:bg-pink-500/20 dark:text-pink-300",
      },
      rose: {
        fallback: "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300",
      },
    },
    position: {
      "top-right": {
        badge:
          "top-0 right-0 in-data-[shape=square]:translate-x-1/2 in-data-[shape=square]:-translate-y-1/2",
      },
      "bottom-right": {
        badge:
          "bottom-0 right-0 in-data-[shape=square]:translate-x-1/2 in-data-[shape=square]:translate-y-1/2",
      },
      "top-left": {
        badge:
          "top-0 left-0 in-data-[shape=square]:-translate-x-1/2 in-data-[shape=square]:-translate-y-1/2",
      },
      "bottom-left": {
        badge:
          "bottom-0 left-0 in-data-[shape=square]:-translate-x-1/2 in-data-[shape=square]:translate-y-1/2",
      },
    },
    status: {
      online: { status: "bg-emerald-500" },
      offline: { status: "bg-zinc-400" },
      busy: { status: "bg-rose-500" },
      away: { status: "bg-amber-500" },
    },
    spacing: {
      tight: { group: "-space-x-3" },
      default: { group: "-space-x-2" },
      loose: { group: "-space-x-1" },
    },
  },
  defaultVariants: {
    position: "bottom-right",
    shape: "circle",
    size: "md",
    spacing: "default",
    status: "online",
    tone: "neutral",
  },
});

type AvatarRootVariants = Pick<
  VariantProps<typeof avatarVariants>,
  "shape" | "size"
>;

export interface AvatarProps
  extends AvatarPrimitive.Root.Props,
    AvatarRootVariants {}

export function Avatar({
  className,
  size,
  shape,
  ...props
}: AvatarProps): React.ReactElement {
  const styles = avatarVariants({ shape, size });

  return (
    <AvatarPrimitive.Root
      className={mergeBaseUiClassName(styles.root, className)}
      data-slot="avatar"
      data-size={size ?? "md"}
      data-shape={shape ?? "circle"}
      {...props}
    />
  );
}

export function AvatarImage({
  className,
  ...props
}: AvatarPrimitive.Image.Props): React.ReactElement {
  const styles = avatarVariants();

  return (
    <AvatarPrimitive.Image
      className={mergeBaseUiClassName(styles.image, className)}
      data-slot="avatar-image"
      {...props}
    />
  );
}

export function AvatarFallback({
  className,
  tone = "neutral",
  ...props
}: AvatarPrimitive.Fallback.Props & {
  tone?: AvatarTone;
}): React.ReactElement {
  const styles = avatarVariants({ tone });

  return (
    <AvatarPrimitive.Fallback
      className={mergeBaseUiClassName(styles.fallback, className)}
      data-slot="avatar-fallback"
      data-tone={tone}
      {...props}
    />
  );
}

export function AvatarIconFallback({
  className,
  tone = "neutral",
  ...props
}: Omit<AvatarPrimitive.Fallback.Props, "children"> & {
  tone?: AvatarTone;
}): React.ReactElement {
  const styles = avatarVariants({ tone });

  return (
    <AvatarFallback
      className={mergeBaseUiClassName(styles.iconFallback, className)}
      tone={tone}
      {...props}
    >
      <UserIcon aria-hidden className={styles.icon()} strokeWidth={2} />
    </AvatarFallback>
  );
}

export type AvatarBadgePosition =
  | "top-right"
  | "bottom-right"
  | "top-left"
  | "bottom-left";

export interface AvatarBadgeProps extends ComponentProps<"span"> {
  position?: AvatarBadgePosition;
}

export function AvatarBadge({
  className,
  position = "bottom-right",
  children,
  ...props
}: AvatarBadgeProps): React.ReactElement {
  const styles = avatarVariants({ position });

  return (
    <span
      aria-hidden
      className={styles.badge({ class: className })}
      data-slot="avatar-badge"
      data-position={position}
      {...props}
    >
      {children}
    </span>
  );
}

export type AvatarStatusTone = "online" | "offline" | "busy" | "away";

export function AvatarStatus({
  tone = "online",
  position = "bottom-right",
  className,
  ...props
}: Omit<AvatarBadgeProps, "children"> & {
  tone?: AvatarStatusTone;
}): React.ReactElement {
  const styles = avatarVariants({ position, status: tone });

  return (
    <AvatarBadge
      position={position}
      className={styles.status({ class: className })}
      data-slot="avatar-status"
      data-status={tone}
      {...props}
    />
  );
}

export function AvatarEmpty({
  className,
  size,
  shape,
  ...props
}: ComponentProps<"button"> &
  AvatarRootVariants): React.ReactElement {
  const styles = avatarVariants({ shape, size });

  return (
    <button
      type="button"
      className={styles.root({ class: styles.empty({ class: className }) })}
      data-slot="avatar-empty"
      {...props}
    >
      <PlusIcon aria-hidden className={styles.emptyIcon()} strokeWidth={2} />
    </button>
  );
}

export type AvatarGroupItem = {
  /** Used to derive initials + a deterministic tone via `avatarToneFromSeed`. */
  name?: string;
  src?: string;
  alt?: string;
  initials?: string;
  tone?: AvatarTone;
  id?: string;
};

const deriveInitials = (name?: string): string =>
  name
    ?.trim()
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

export interface AvatarGroupProps
  extends ComponentProps<"div">,
    AvatarRootVariants {
  max?: number;
  spacing?: "tight" | "default" | "loose";
  items?: AvatarGroupItem[];
}

export function AvatarGroup({
  className,
  size = "md",
  shape = "circle",
  spacing = "default",
  max,
  items,
  children,
  ...props
}: AvatarGroupProps): React.ReactElement {
  const styles = avatarVariants({ shape, size, spacing });
  const rendered: React.ReactNode[] = items
    ? items.map((item, i) => {
        const name = item.name;
        const tone = item.tone ?? (name ? avatarToneFromSeed(name) : "neutral");
        return (
          <Avatar key={item.id ?? name ?? i} size={size} shape={shape}>
            {item.src ? (
              <AvatarImage src={item.src} alt={item.alt ?? name ?? ""} />
            ) : null}
            <AvatarFallback tone={tone}>
              {item.initials ?? deriveInitials(name)}
            </AvatarFallback>
          </Avatar>
        );
      })
    : Children.toArray(children);

  const visible = typeof max === "number" ? rendered.slice(0, max) : rendered;
  const overflow =
    typeof max === "number" && rendered.length > max
      ? rendered.length - max
      : 0;

  return (
    <div
      className={styles.group({ class: className })}
      data-slot="avatar-group"
      data-size={size}
      data-shape={shape}
      {...props}
    >
      {visible}
      {overflow > 0 ? (
        <Avatar size={size} shape={shape}>
          <AvatarFallback tone="neutral">+{overflow}</AvatarFallback>
        </Avatar>
      ) : null}
    </div>
  );
}

export { AvatarPrimitive };

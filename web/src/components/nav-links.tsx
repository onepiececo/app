import {
  Archive,
  BookMarked,
  BookOpen,
  Boxes,
  Database,
  Grid3x3,
  Home,
  Layers,
  Library,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Home;
};

// Anime Database icon picker — render every candidate so the user can choose
// visually. Once picked, collapse this back to a single entry using their
// chosen icon.
const NAV: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/anime", label: "Library", icon: Library },
  { href: "/anime", label: "BookOpen", icon: BookOpen },
  { href: "/anime", label: "Database", icon: Database },
  { href: "/anime", label: "Boxes", icon: Boxes },
  { href: "/anime", label: "Archive", icon: Archive },
  { href: "/anime", label: "Layers", icon: Layers },
  { href: "/anime", label: "BookMarked", icon: BookMarked },
  { href: "/anime", label: "Grid3x3", icon: Grid3x3 },
];

export type NavLinksProps = {
  variant?: "rail" | "drawer";
};

export const NavLinks = (props: NavLinksProps) => {
  const variant = props.variant ?? "rail";
  return (
    <nav className="flex w-full flex-col gap-1">
      {NAV.map((item, i) => {
        const Icon = item.icon;
        return (
          <Link
            key={i}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-foreground/80 text-sm outline-none transition-colors hover:bg-accent/40 hover:text-foreground focus-visible:bg-accent/50",
              variant === "drawer" && "py-3 text-base",
            )}
          >
            <Icon className="size-4 opacity-80" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

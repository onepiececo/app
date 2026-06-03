import { Home, Library } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Home;
};

const NAV: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/anime", label: "Anime Database", icon: Library },
];

export type NavLinksProps = {
  variant?: "rail" | "drawer";
};

export const NavLinks = (props: NavLinksProps) => {
  const variant = props.variant ?? "rail";
  return (
    <nav className="flex w-full flex-col gap-1">
      {NAV.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "-mx-3 flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-foreground/80 text-sm outline-none transition-colors hover:bg-accent/40 hover:text-foreground focus-visible:bg-accent/50",
              variant === "drawer" && "mx-0 py-3 text-base",
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

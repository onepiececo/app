"use client";

import { ScrollArea } from "@/components/ui/scroll-area";

const NAV_ITEMS = [
  "Dashboard",
  "Inbox",
  "Projects",
  "Templates",
  "Customers",
  "Pipelines",
  "Reports",
  "Audit log",
  "Billing",
  "Members",
  "API keys",
  "Webhooks",
  "Integrations",
  "Domains",
  "Notifications",
  "Appearance",
  "Security",
  "Sessions",
  "Account",
  "Sign out",
];

export function ScrollAreaVariants() {
  return (
    <div className="h-64 max-w-sm overflow-hidden rounded-lg bg-white shadow-[0_0_0_1px_rgb(9_9_11/0.1),0_1px_2px_rgb(0_0_0/0.05)] dark:bg-white/5 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)]">
      <ScrollArea scrollFade>
        <ul className="flex flex-col py-1">
          {NAV_ITEMS.map((item) => (
            <li
              key={item}
              className="flex items-center px-3 py-2 text-sm text-foreground/90 hover:bg-accent"
            >
              {item}
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}

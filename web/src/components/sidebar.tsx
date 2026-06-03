import { type ReactNode } from "react";
import { NavLinks } from "@/components/nav-links";
import { SidebarChrome } from "@/components/sidebar-chrome";

export type SidebarProps = {
  children?: ReactNode;
};

export const Sidebar = (props: SidebarProps) => {
  return (
    <aside className="hidden w-[24rem] shrink-0 flex-col items-start gap-3 overflow-hidden border-border border-r bg-sidebar p-10 lg:flex xl:w-[26rem] xl:p-16">
      {props.children}
      <NavLinks variant="rail" />
      <div className="mt-auto pt-6">
        <SidebarChrome />
      </div>
    </aside>
  );
};

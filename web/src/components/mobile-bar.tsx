"use client";

import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { NavLinks } from "@/components/nav-links";
import { SidebarChrome } from "@/components/sidebar-chrome";
import { Button } from "@/components/ui/button";
import {
  Popup,
  PopupBody,
  PopupContent,
  PopupHeader,
  PopupTitle,
  PopupTrigger,
} from "@/components/ui/popup";

export type MobileBarProps = {
  children?: ReactNode;
};

export const MobileBar = (props: MobileBarProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-border border-b bg-sidebar px-3 lg:hidden">
      {props.children}
      <div className="ms-auto flex items-center gap-2">
        <Popup open={menuOpen} onOpenChange={setMenuOpen}>
          <PopupTrigger
            render={
              <Button variant="ghost" size="icon-lg" aria-label="Open menu">
                <Menu />
              </Button>
            }
          />
          <PopupContent>
            <PopupHeader>
              <PopupTitle>Navigate</PopupTitle>
            </PopupHeader>
            <PopupBody className="pb-6">
              <NavLinks variant="drawer" />
            </PopupBody>
          </PopupContent>
        </Popup>
        <SidebarChrome />
      </div>
    </header>
  );
};

"use client";

import {
  ChevronDownIcon,
  TrashIcon,
  UserIcon,
} from "lucide-react";
import {
  Menu,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";

export function MenuVariants() {
  return (
    <Menu>
      <MenuTrigger variant="outline">
        <UserIcon aria-hidden />
        Account
        <ChevronDownIcon aria-hidden className="opacity-60" />
      </MenuTrigger>
      <MenuPopup>
        <MenuGroup>
          <MenuGroupLabel>Account</MenuGroupLabel>
          <MenuItem>Profile</MenuItem>
          <MenuItem>Billing</MenuItem>
          <MenuItem>Team</MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuItem variant="destructive">
          <TrashIcon aria-hidden />
          Sign out
        </MenuItem>
      </MenuPopup>
    </Menu>
  );
}

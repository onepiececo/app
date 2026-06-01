"use client";

import {
  BellIcon,
  FileTextIcon,
  PaletteIcon,
  PlusIcon,
  SettingsIcon,
  TrashIcon,
  UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandDialogPopup,
  CommandDialogTrigger,
  CommandGroup,
  CommandGroupLabel,
  CommandIconChip,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

export function CommandVariants() {
  return (
    <CommandDialog>
      <CommandDialogTrigger render={<Button variant="outline">Open command menu</Button>} />
      <CommandDialogPopup>
        <Command>
          <CommandInput placeholder="Search actions and settings…" hint={null} />
          <CommandList>
            <CommandGroup>
              <CommandGroupLabel>Actions</CommandGroupLabel>
              <CommandItem>
                <CommandIconChip><PlusIcon /></CommandIconChip>
                New document
              </CommandItem>
              <CommandItem>
                <CommandIconChip><FileTextIcon /></CommandIconChip>
                Open project brief
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandGroupLabel>Settings</CommandGroupLabel>
              <CommandItem>
                <CommandIconChip><UserIcon /></CommandIconChip>
                Profile
              </CommandItem>
              <CommandItem>
                <CommandIconChip><BellIcon /></CommandIconChip>
                Notifications
              </CommandItem>
              <CommandItem>
                <CommandIconChip><PaletteIcon /></CommandIconChip>
                Appearance
              </CommandItem>
              <CommandItem>
                <CommandIconChip><SettingsIcon /></CommandIconChip>
                Workspace settings
              </CommandItem>
              <CommandItem>
                <CommandIconChip><TrashIcon /></CommandIconChip>
                Delete draft
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialogPopup>
    </CommandDialog>
  );
}

"use client";

import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverClose,
  PopoverDescription,
  PopoverPopup,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

export function PopoverVariants() {
  const [marketing, setMarketing] = useState(true);
  const [security, setSecurity] = useState(false);

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline">
            Notification preferences
            <ChevronDownIcon aria-hidden className="opacity-60" />
          </Button>
        }
      />
      <PopoverPopup align="start">
        <div className="flex w-72 flex-col gap-4">
          <div className="flex flex-col gap-1">
            <PopoverTitle className="text-sm font-semibold">Notifications</PopoverTitle>
            <PopoverDescription className="text-xs text-muted-foreground">
              Choose how you want to hear from us.
            </PopoverDescription>
          </div>
          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>Marketing emails</span>
              <Switch checked={marketing} onCheckedChange={setMarketing} />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>Security alerts</span>
              <Switch checked={security} onCheckedChange={setSecurity} />
            </label>
          </div>
          <PopoverClose render={<Button variant="ghost" className="self-end">Close</Button>} />
        </div>
      </PopoverPopup>
    </Popover>
  );
}

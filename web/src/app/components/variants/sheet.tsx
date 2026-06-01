"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPopup,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";

export function SheetVariants() {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline">Open settings sheet</Button>} />
      <SheetPopup side="right">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Tweak preferences for this workspace.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 px-6 pb-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="sheet-name">Workspace name</Label>
            <Input id="sheet-name" defaultValue="Template Co" />
          </div>
          <label className="flex items-center justify-between gap-3 py-2 text-sm">
            <span>Notifications</span>
            <Switch defaultChecked />
          </label>
          <label className="flex items-center justify-between gap-3 py-2 text-sm">
            <span>Public profile</span>
            <Switch />
          </label>
        </div>
        <SheetFooter>
          <SheetClose render={<Button variant="ghost">Cancel</Button>} />
          <Button>Save</Button>
        </SheetFooter>
      </SheetPopup>
    </Sheet>
  );
}

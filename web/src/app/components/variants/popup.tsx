"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popup,
  PopupBody,
  PopupClose,
  PopupContent,
  PopupDescription,
  PopupFooter,
  PopupHeader,
  PopupTitle,
  PopupTrigger,
} from "@/components/ui/popup";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PopupVariants() {
  return (
    <Popup>
      <PopupTrigger render={<Button variant="outline">Invite teammate</Button>} />
      <PopupContent className="sm:max-w-sm">
        <PopupHeader>
          <PopupTitle>Invite a teammate</PopupTitle>
          <PopupDescription>
            They&apos;ll get an email with a link to join this workspace.
          </PopupDescription>
        </PopupHeader>
        <PopupBody className="grid gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="popup-invite-email">Email</Label>
            <Input
              id="popup-invite-email"
              type="email"
              placeholder="person@template.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="popup-invite-role">Role</Label>
            <Select defaultValue="member">
              <SelectTrigger id="popup-invite-role">
                <SelectValue />
              </SelectTrigger>
              <SelectPopup>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
              </SelectPopup>
            </Select>
          </div>
        </PopupBody>
        <PopupFooter>
          <PopupClose render={<Button variant="outline" />}>Cancel</PopupClose>
          <Button>Send invite</Button>
        </PopupFooter>
      </PopupContent>
    </Popup>
  );
}

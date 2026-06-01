"use client";

import { DollarSignIcon, MailIcon, SearchIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function InputVariants() {
  return (
    <div className="grid gap-4 p-1 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor="demo-email">Email</Label>
        <InputGroup>
          <InputGroupAddon>
            <MailIcon />
          </InputGroupAddon>
          <Input id="demo-email" type="email" placeholder="kyle@template.com" />
        </InputGroup>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="demo-search">Search</Label>
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <Input id="demo-search" type="search" placeholder="Find components" />
          <InputGroupAddon align="inline-end">
            <Badge appearance="soft">/</Badge>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="demo-budget">Budget</Label>
        <InputGroup>
          <InputGroupAddon>
            <DollarSignIcon />
          </InputGroupAddon>
          <Input id="demo-budget" type="number" defaultValue="1200" />
          <InputGroupAddon align="inline-end">
            <InputGroupText>USD</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="demo-invite">Invite</Label>
        <InputGroup>
          <Input id="demo-invite" type="email" placeholder="teammate@company.com" />
          <InputGroupAddon align="inline-end">
            <Button size="xs" variant="secondary">Send</Button>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="demo-textarea">Message</Label>
        <Textarea id="demo-textarea" placeholder="Write a message..." rows={3} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="demo-invalid">Invalid</Label>
        <Input id="demo-invalid" aria-invalid defaultValue="missing-domain" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="demo-disabled">Disabled</Label>
        <Input id="demo-disabled" disabled placeholder="Locked by policy" />
      </div>
    </div>
  );
}

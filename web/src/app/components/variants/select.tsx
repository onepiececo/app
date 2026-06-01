"use client";

import {
  Select,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectLabel,
  SelectPopup,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const planLabels: Record<string, string> = {
  business: "Business, $99/mo",
  enterprise: "Enterprise, custom",
  pro: "Pro, $12/mo",
  starter: "Starter, free",
  team: "Team, $40/mo",
};

export function SelectVariants() {
  return (
    <div className="flex flex-col gap-2">
      <Select defaultValue="starter">
        <SelectLabel>Plan</SelectLabel>
        <SelectTrigger className="w-60">
          <SelectValue placeholder="Choose a plan">
            {(value) => (typeof value === "string" ? planLabels[value] : null)}
          </SelectValue>
        </SelectTrigger>
        <SelectPopup>
          <SelectGroup>
            <SelectGroupLabel>Personal</SelectGroupLabel>
            <SelectItem value="starter">Starter, free</SelectItem>
            <SelectItem value="pro">Pro, $12/mo</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectGroupLabel>Teams</SelectGroupLabel>
            <SelectItem value="team">Team, $40/mo</SelectItem>
            <SelectItem value="business">Business, $99/mo</SelectItem>
            <SelectItem disabled value="enterprise">Enterprise, custom</SelectItem>
          </SelectGroup>
        </SelectPopup>
      </Select>
    </div>
  );
}

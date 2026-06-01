"use client";

import { ChevronsUpDownIcon } from "lucide-react";
import {
  Combobox,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxPrimitive,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox";
import { Input, inputSurfaceVariants } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const COUNTRIES = [
  "Australia",
  "Brazil",
  "Canada",
  "Denmark",
  "France",
  "Germany",
  "Japan",
  "Mexico",
  "Netherlands",
  "Spain",
  "Sweden",
  "United Kingdom",
  "United States",
];

const COMBOBOX_TRIGGER_CLASSES = cn(
  inputSurfaceVariants({ layout: "inline" }),
  "min-h-9 w-64 select-none items-center justify-between gap-2 px-[calc(--spacing(3)-1px)] text-left data-placeholder:text-muted-foreground/72 sm:min-h-8 [&_svg]:pointer-events-none [&_svg]:shrink-0",
);

export function ComboboxVariants() {
  return (
    <div className="flex max-w-sm flex-col gap-2 p-1">
      <Label>Country</Label>
      <Combobox items={COUNTRIES}>
        <ComboboxTrigger className={COMBOBOX_TRIGGER_CLASSES}>
          <ComboboxValue placeholder="Select country" />
          <ChevronsUpDownIcon className="size-4 opacity-80" />
        </ComboboxTrigger>
        <ComboboxPopup>
          <div className="border-b border-border/80 p-2">
            <ComboboxPrimitive.Input
              placeholder="Search country..."
              render={<Input className="w-full" nativeInput size="sm" />}
            />
          </div>
          <ComboboxEmpty>No country matches.</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxPopup>
      </Combobox>
    </div>
  );
}

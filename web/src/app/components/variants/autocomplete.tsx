"use client";

import { MapPinIcon } from "lucide-react";
import {
  Autocomplete,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
} from "@/components/ui/autocomplete";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";

const CITIES = [
  "San Francisco",
  "San Jose",
  "San Diego",
  "San Antonio",
  "Sandy Springs",
  "Santa Fe",
  "Sacramento",
  "Seattle",
  "Saint Paul",
  "Salt Lake City",
];

export function AutocompleteVariants() {
  return (
    <div className="max-w-sm p-1">
      <Field>
        <FieldLabel>City</FieldLabel>
        <Autocomplete items={CITIES}>
          <AutocompleteInput placeholder="Search a city…" className="w-full" />
          <AutocompletePopup>
            <AutocompleteEmpty>No matching cities.</AutocompleteEmpty>
            <AutocompleteList>
              {(item: string) => (
                <AutocompleteItem key={item} value={item}>
                  <MapPinIcon />
                  {item}
                </AutocompleteItem>
              )}
            </AutocompleteList>
          </AutocompletePopup>
        </Autocomplete>
        <FieldDescription>
          Type a city, or keep your own custom value.
        </FieldDescription>
      </Field>
    </div>
  );
}

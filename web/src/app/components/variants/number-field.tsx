"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldRow,
  NumberFieldScrubArea,
} from "@/components/ui/number-field";

export function NumberFieldVariants() {
  const [seats, setSeats] = useState<number | null>(2);

  return (
    <div className="grid w-full gap-6 sm:grid-cols-2">
      <NumberField defaultValue={42}>
        <Label>Quantity</Label>
        <NumberFieldRow>
          <NumberFieldDecrement />
          <NumberFieldGroup>
            <NumberFieldInput />
          </NumberFieldGroup>
          <NumberFieldIncrement />
        </NumberFieldRow>
      </NumberField>

      <NumberField min={0} max={10} value={seats} onValueChange={setSeats}>
        <Label>Seats (0–10)</Label>
        <NumberFieldRow>
          <NumberFieldDecrement />
          <NumberFieldGroup>
            <NumberFieldInput />
          </NumberFieldGroup>
          <NumberFieldIncrement />
        </NumberFieldRow>
      </NumberField>

      <NumberField defaultValue={9.99} step={0.01} format={{ style: "currency", currency: "USD" }}>
        <Label>Price</Label>
        <NumberFieldRow>
          <NumberFieldDecrement />
          <NumberFieldGroup>
            <NumberFieldInput />
          </NumberFieldGroup>
          <NumberFieldIncrement />
        </NumberFieldRow>
      </NumberField>

      <NumberField defaultValue={50}>
        <NumberFieldScrubArea label="Drag-scrub" />
        <NumberFieldRow>
          <NumberFieldDecrement />
          <NumberFieldGroup>
            <NumberFieldInput />
          </NumberFieldGroup>
          <NumberFieldIncrement />
        </NumberFieldRow>
      </NumberField>
    </div>
  );
}

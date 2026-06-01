"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const DEFAULT_ACCORDION_VALUE = ["item-1"];

export function AccordionVariants() {
  return (
    <Accordion defaultValue={DEFAULT_ACCORDION_VALUE}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Usage limits</AccordionTrigger>
        <AccordionContent>
          Pro workspaces include unlimited projects, shared domains, and priority support.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Billing changes</AccordionTrigger>
        <AccordionContent>
          Plan updates apply immediately and renew on your next billing cycle.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

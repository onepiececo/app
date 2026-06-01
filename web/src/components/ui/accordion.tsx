"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { ChevronDownIcon, MinusIcon, PlusIcon } from "lucide-react";
import { createContext, useContext } from "react";
import type React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { mergeBaseUiClassName } from "@/lib/base-ui-class-name";

export const accordionVariants = tv({
  slots: {
    root: "",
    item: "border-b last:border-b-0",
    header: "flex",
    trigger:
      "group/accordion-trigger flex flex-1 cursor-pointer items-start justify-between gap-4 rounded-md py-4 text-left font-medium text-sm outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-64",
    panel:
      "h-(--accordion-panel-height) overflow-hidden text-muted-foreground text-sm transition-[height] data-ending-style:h-0 data-starting-style:h-0 duration-[260ms] [transition-timing-function:cubic-bezier(.22,.61,.36,1)]",
    content: "pt-0 pb-4",
    chevron:
      "pointer-events-none size-4 shrink-0 translate-y-0.5 opacity-80 transition-transform duration-[260ms] [transition-timing-function:cubic-bezier(.22,.61,.36,1)] group-data-panel-open/accordion-trigger:rotate-180",
    plusMinus:
      "pointer-events-none relative grid size-4 shrink-0 translate-y-0.5 place-items-center",
    plus:
      "absolute size-4 opacity-80 transition-[opacity,transform] duration-[260ms] [transition-timing-function:cubic-bezier(.22,.61,.36,1)] group-data-panel-open/accordion-trigger:rotate-90 group-data-panel-open/accordion-trigger:opacity-0",
    minus:
      "absolute size-4 opacity-0 transition-opacity duration-[260ms] [transition-timing-function:cubic-bezier(.22,.61,.36,1)] group-data-panel-open/accordion-trigger:opacity-80",
  },
  defaultVariants: {
    variant: "default",
  },
  variants: {
    variant: {
      default: {},
      plus: {},
    },
  },
});

type AccordionVariant = VariantProps<typeof accordionVariants>["variant"];

const AccordionVariantContext = createContext<AccordionVariant>("default");

export function Accordion({
  className,
  variant = "default",
  ...props
}: AccordionPrimitive.Root.Props & {
  variant?: AccordionVariant;
}): React.ReactElement {
  const styles = accordionVariants({ variant });

  return (
    <AccordionVariantContext.Provider value={variant}>
      <AccordionPrimitive.Root
        className={mergeBaseUiClassName(styles.root, className)}
        data-slot="accordion"
        {...props}
      />
    </AccordionVariantContext.Provider>
  );
}

export function AccordionItem({
  className,
  ...props
}: AccordionPrimitive.Item.Props): React.ReactElement {
  const styles = accordionVariants();

  return (
    <AccordionPrimitive.Item
      className={mergeBaseUiClassName(styles.item, className)}
      data-slot="accordion-item"
      {...props}
    />
  );
}

const ChevronIndicator = () => {
  const styles = accordionVariants();

  return (
    <ChevronDownIcon
      className={styles.chevron()}
      data-slot="accordion-indicator"
    />
  );
};

const PlusMinusIndicator = () => {
  const styles = accordionVariants();

  return (
    <span className={styles.plusMinus()} data-slot="accordion-indicator">
      <PlusIcon className={styles.plus()} />
      <MinusIcon className={styles.minus()} />
    </span>
  );
};

export function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props): React.ReactElement {
  const variant = useContext(AccordionVariantContext);
  const styles = accordionVariants({ variant });

  return (
    <AccordionPrimitive.Header className={styles.header()}>
      <AccordionPrimitive.Trigger
        className={mergeBaseUiClassName(styles.trigger, className)}
        data-slot="accordion-trigger"
        {...props}
      >
        {children}
        {variant === "plus" ? <PlusMinusIndicator /> : <ChevronIndicator />}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionPanel({
  className,
  contentClassName,
  children,
  ...props
}: AccordionPrimitive.Panel.Props & {
  contentClassName?: string;
}): React.ReactElement {
  const styles = accordionVariants();

  return (
    <AccordionPrimitive.Panel
      className={mergeBaseUiClassName(styles.panel, className)}
      data-slot="accordion-panel"
      {...props}
    >
      <div className={styles.content({ class: contentClassName })}>{children}</div>
    </AccordionPrimitive.Panel>
  );
}

export { AccordionPrimitive, AccordionPanel as AccordionContent };

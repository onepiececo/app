"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import type { AnimeTag } from "@/app/actions/anime";
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@/components/ui/collapsible";

const TAG_VISIBLE = 4;
const TRIGGER_CLASS = "flex items-center gap-1 rounded-md px-2 py-1 font-medium text-muted-foreground text-xs transition-colors hover:bg-accent/40 hover:text-foreground";

const TagPill = (props: { tag: AnimeTag }) => (
  <span className="flex items-baseline gap-1.5 rounded-md bg-muted px-2.5 py-1 font-medium text-foreground text-xs">
    <span>{props.tag.name}</span>
    {typeof props.tag.rank === "number" ? (
      <span className="text-muted-foreground tabular-nums">{props.tag.rank}%</span>
    ) : null}
  </span>
);

export const TagSection = (props: { tags: AnimeTag[] }) => {
  const top = props.tags.slice(0, TAG_VISIBLE);
  const rest = props.tags.slice(TAG_VISIBLE);
  return (
    <Collapsible>
      <div className="flex flex-wrap items-center gap-2">
        {top.map((t) => <TagPill key={t.name} tag={t} />)}
        {rest.length > 0 ? (
          <CollapsibleTrigger className={`${TRIGGER_CLASS} data-[panel-open]:hidden`}>
            {rest.length} more
            <ChevronDown className="size-3" />
          </CollapsibleTrigger>
        ) : null}
        {rest.length > 0 ? (
          <CollapsiblePanel className="basis-full">
            <div className="flex flex-wrap items-center gap-2">
              {rest.map((t) => <TagPill key={t.name} tag={t} />)}
              <CollapsibleTrigger className={TRIGGER_CLASS}>
                <ChevronUp className="size-3" />
                Show fewer
              </CollapsibleTrigger>
            </div>
          </CollapsiblePanel>
        ) : null}
      </div>
    </Collapsible>
  );
};

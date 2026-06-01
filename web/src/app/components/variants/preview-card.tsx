"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  PreviewCard,
  PreviewCardPopup,
  PreviewCardTrigger,
} from "@/components/ui/preview-card";

const triggerLink =
  "inline-flex items-baseline cursor-pointer text-foreground underline underline-offset-[5px] decoration-[1.5px] decoration-muted-foreground/40 transition-[text-decoration-color] duration-[180ms] hover:decoration-foreground";

export function PreviewCardVariants() {
  return (
    <p className="text-sm text-muted-foreground">
      Latest commit by{" "}
      <PreviewCard>
        <PreviewCardTrigger className={triggerLink}>
          @kgrahammatzen
        </PreviewCardTrigger>
        <PreviewCardPopup align="start" sideOffset={6}>
          <div className="flex items-start gap-3">
            <Avatar size="lg">
              <AvatarFallback>KG</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col gap-0.5">
              <p className="font-semibold leading-none text-foreground">Kyle Graham Matzen</p>
              <p className="text-xs text-muted-foreground">@kgrahammatzen</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            Building Template, a design-engineering playground for shadcn-style components on base-ui.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span><span className="font-medium text-foreground">1.2k</span> followers</span>
            <span><span className="font-medium text-foreground">208</span> following</span>
          </div>
          <Button size="sm" variant="outline" className="self-start">Follow</Button>
        </PreviewCardPopup>
      </PreviewCard>
      {" "}— hover the link above to see the preview card.
    </p>
  );
}

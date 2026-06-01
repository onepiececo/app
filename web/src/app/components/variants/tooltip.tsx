"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipPopup,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function TooltipVariants() {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline" size="sm">Copy link</Button>} />
      <TooltipPopup>Copy this page URL</TooltipPopup>
    </Tooltip>
  );
}

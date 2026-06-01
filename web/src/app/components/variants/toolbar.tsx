"use client";

import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/ui/toolbar";
import { Toggle } from "@/components/ui/toggle";

export function ToolbarVariants() {
  const [marks, setMarks] = useState({ b: false, i: true, u: false });
  const [align, setAlign] = useState<"left" | "center" | "right">("left");

  return (
    <Toolbar>
      <ToolbarGroup>
        <Toggle aria-label="Bold" pressed={marks.b} onPressedChange={(v) => setMarks((m) => ({ ...m, b: v }))}>
          <BoldIcon />
        </Toggle>
        <Toggle aria-label="Italic" pressed={marks.i} onPressedChange={(v) => setMarks((m) => ({ ...m, i: v }))}>
          <ItalicIcon />
        </Toggle>
        <Toggle aria-label="Underline" pressed={marks.u} onPressedChange={(v) => setMarks((m) => ({ ...m, u: v }))}>
          <UnderlineIcon />
        </Toggle>
      </ToolbarGroup>

      <ToolbarSeparator orientation="vertical" />

      <ToolbarGroup>
        <Toggle aria-label="Align left" pressed={align === "left"} onPressedChange={(v) => v && setAlign("left")}>
          <AlignLeftIcon />
        </Toggle>
        <Toggle aria-label="Align center" pressed={align === "center"} onPressedChange={(v) => v && setAlign("center")}>
          <AlignCenterIcon />
        </Toggle>
        <Toggle aria-label="Align right" pressed={align === "right"} onPressedChange={(v) => v && setAlign("right")}>
          <AlignRightIcon />
        </Toggle>
      </ToolbarGroup>

      <ToolbarSeparator orientation="vertical" />

      <Button variant="ghost" size="sm" className="self-center">Save</Button>
    </Toolbar>
  );
}

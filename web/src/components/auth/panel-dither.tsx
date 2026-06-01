"use client";

import { Dithering } from "@paper-design/shaders-react";

export const PanelDither = () => (
  <div className="relative h-full w-full overflow-hidden bg-background">
    <Dithering
      width="100%"
      height="100%"
      colorBack="#00000000"
      colorFront="#47a8e1"
      shape="warp"
      type="8x8"
      size={2}
      speed={1}
      style={{ position: "absolute", inset: 0 }}
    />
    <div className="relative flex h-full flex-col p-10">
      <span className="text-xs uppercase tracking-[0.2em] font-medium text-foreground [text-shadow:0_0_12px_color-mix(in_srgb,var(--background)_80%,transparent)] not-dark:mix-blend-multiply dark:mix-blend-screen">
        Template
      </span>
    </div>
  </div>
);

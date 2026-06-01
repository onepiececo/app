"use client";

import { useState } from "react";
import { Checkbox, CheckboxGroup } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Radio, RadioGroup } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";

export function SelectionVariants() {
  const [telemetry, setTelemetry] = useState(true);

  return (
    <div className="grid max-w-xl gap-5 p-1 sm:grid-cols-2">
      <div className="flex flex-col gap-3">
        <p className="font-medium text-sm">Notifications</p>
        <CheckboxGroup defaultValue={["comments", "mentions"]}>
          <div className="flex items-center gap-2">
            <Checkbox id="demo-check-comments" value="comments" />
            <Label htmlFor="demo-check-comments" className="font-normal">Comments</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="demo-check-mentions" value="mentions" />
            <Label htmlFor="demo-check-mentions" className="font-normal">Mentions</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="demo-check-reports" value="reports" />
            <Label htmlFor="demo-check-reports" className="font-normal">Weekly reports</Label>
          </div>
        </CheckboxGroup>
      </div>
      <div className="flex flex-col gap-3">
        <p className="font-medium text-sm">Digest cadence</p>
        <RadioGroup defaultValue="weekly" aria-label="Digest cadence">
          <div className="flex items-center gap-2">
            <Radio id="demo-radio-daily" value="daily" />
            <Label htmlFor="demo-radio-daily" className="font-normal">Daily</Label>
          </div>
          <div className="flex items-center gap-2">
            <Radio id="demo-radio-weekly" value="weekly" />
            <Label htmlFor="demo-radio-weekly" className="font-normal">Weekly</Label>
          </div>
          <div className="flex items-center gap-2">
            <Radio id="demo-radio-monthly" value="monthly" />
            <Label htmlFor="demo-radio-monthly" className="font-normal">Monthly</Label>
          </div>
        </RadioGroup>
      </div>
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/72 p-3 sm:col-span-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor="demo-switch-on" className="font-normal">Enable telemetry</Label>
          <span className="text-muted-foreground text-xs">
            {telemetry ? "Usage signals are enabled." : "Usage signals are paused."}
          </span>
        </div>
        <Switch id="demo-switch-on" checked={telemetry} onCheckedChange={setTelemetry} />
      </div>
    </div>
  );
}

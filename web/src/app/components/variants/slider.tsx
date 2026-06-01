"use client";

import { useState } from "react";
import { Slider, SliderPill } from "@/components/ui/slider";

const QUALITY = ["Off", "Low", "Medium", "High", "Ultra"] as const;
const formatPan = (v: number) => (v === 0 ? "0" : v > 0 ? `+${v}` : `${v}`);

export function SliderVariants() {
  const [volume, setVolume] = useState(40);
  const [steps, setSteps] = useState(50);
  const [price, setPrice] = useState<[number, number]>([25, 75]);
  const [tooltip, setTooltip] = useState(75);
  const [pan, setPan] = useState(0);
  const [pillVolume, setPillVolume] = useState(40);
  const [quality, setQuality] = useState(2);
  const [notch, setNotch] = useState(2);

  return (
    <div className="flex max-w-md flex-col gap-6">
      <Slider
        value={volume}
        onChange={(v) => setVolume(v as number)}
        valuePosition="top"
        label="Volume"
        formatValue={(v) => `${v}%`}
      />
      <Slider
        value={steps}
        onChange={(v) => setSteps(v as number)}
        step={10}
        showSteps
        surface="soft"
        valuePosition="top"
        label="Steps"
      />
      <Slider
        value={price}
        onChange={(v) => setPrice(v as [number, number])}
        valuePosition="top"
        label="Price"
        formatValue={(v) => `$${v}`}
        minStepsBetweenValues={5}
      />
      <Slider
        value={tooltip}
        onChange={(v) => setTooltip(v as number)}
        valuePosition="tooltip"
        formatValue={(v) => `${v}%`}
      />
      <Slider
        value={pan}
        onChange={(v) => setPan(v as number)}
        min={-50}
        max={50}
        valuePosition="top"
        label="Pan"
        formatValue={formatPan}
      />
      <SliderPill
        label="Volume"
        value={pillVolume}
        onChange={setPillVolume}
        formatValue={(v) => `${v}%`}
      />
      <SliderPill
        variant="pips"
        label="Quality"
        value={quality}
        onChange={setQuality}
        min={0}
        max={4}
        surface="soft"
        formatValue={(v) => QUALITY[v]}
      />
      <SliderPill
        variant="pips"
        label="Notch"
        value={notch}
        onChange={setNotch}
        min={0}
        max={6}
      />
      <SliderPill
        label="Volume"
        value={40}
        onChange={() => {}}
        disabled
        formatValue={(v) => `${v}%`}
      />
    </div>
  );
}

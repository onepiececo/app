"use client";

import { SlidersHorizontalIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerPopup,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Slider } from "@/components/ui/slider";

function FiltersDrawer() {
  const [price, setPrice] = useState<[number, number]>([20, 150]);
  return (
    <Drawer position="right">
      <DrawerTrigger
        render={
          <Button variant="outline">
            <SlidersHorizontalIcon className="size-4" aria-hidden /> Filters
          </Button>
        }
      />
      <DrawerPopup showBar>
        <DrawerHeader allowSelection className="px-6 pt-6 pb-4">
          <DrawerContent>
            <DrawerTitle>Filters</DrawerTitle>
            <DrawerDescription>Narrow the results.</DrawerDescription>
          </DrawerContent>
        </DrawerHeader>
        <div className="flex flex-1 flex-col gap-6 px-6 pb-6">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</span>
            <label className="flex items-center gap-3 text-sm">
              <Checkbox defaultChecked /> Apparel
            </label>
            <label className="flex items-center gap-3 text-sm">
              <Checkbox /> Footwear
            </label>
            <label className="flex items-center gap-3 text-sm">
              <Checkbox defaultChecked /> Accessories
            </label>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Price</span>
            <Slider
              value={price}
              onChange={(v) => setPrice(v as [number, number])}
              min={0}
              max={500}
              valuePosition="top"
              label="Range"
              formatValue={(v) => `$${v}`}
              minStepsBetweenValues={20}
            />
          </div>
          <div className="mt-auto flex gap-2 pt-4">
            <Button variant="ghost" className="flex-1">
              Reset
            </Button>
            <Button className="flex-1">Apply</Button>
          </div>
        </div>
      </DrawerPopup>
    </Drawer>
  );
}

export function DrawerVariants() {
  return <FiltersDrawer />;
}

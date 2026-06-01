"use client";

import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";

export function CardVariants() {
  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Pro plan</CardTitle>
        <CardDescription>Unlimited seats and priority support.</CardDescription>
      </CardHeader>
      <CardPanel>
        <div className="flex items-baseline gap-1">
          <span className="font-semibold text-2xl tabular-nums">$12</span>
          <span className="text-sm text-muted-foreground">/mo</span>
        </div>
      </CardPanel>
      <CardFooter>
        <Button size="sm" variant="outline">
          Choose Pro <ArrowRightIcon />
        </Button>
      </CardFooter>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@/components/ui/progress";
import { Row } from "./_shared";

export function FeedbackVariants() {
  const [progress, setProgress] = useState(62);
  return (
    <div className="flex max-w-md flex-col gap-4">
      <Progress value={progress}>
        <div className="flex items-center justify-between gap-3">
          <ProgressLabel>Upload progress</ProgressLabel>
          <ProgressValue>
            {(formattedValue, value) => formattedValue ?? `${value ?? 0}%`}
          </ProgressValue>
        </div>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
      <Progress value={38}>
        <div className="flex items-center justify-between gap-3">
          <ProgressLabel className="text-muted-foreground">Background sync</ProgressLabel>
          <ProgressValue>
            {(formattedValue, value) => formattedValue ?? `${value ?? 0}%`}
          </ProgressValue>
        </div>
        <ProgressTrack surface="soft">
          <ProgressIndicator surface="soft" variant="striped" />
        </ProgressTrack>
      </Progress>
      <Row>
        <Button size="sm" variant="outline" onClick={() => setProgress((p) => Math.max(0, p - 10))}>-10</Button>
        <Button size="sm" variant="outline" onClick={() => setProgress((p) => Math.min(100, p + 10))}>+10</Button>
      </Row>
    </div>
  );
}

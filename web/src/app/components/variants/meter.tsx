"use client";

import {
  Meter,
  MeterIndicator,
  MeterLabel,
  MeterTrack,
  MeterValue,
} from "@/components/ui/meter";

export function MeterVariants() {
  return (
    <div className="flex flex-col gap-5">
      <Meter value={62}>
        <div className="flex items-center justify-between">
          <MeterLabel>Storage used</MeterLabel>
          <MeterValue />
        </div>
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </Meter>

      <Meter value={92} max={100}>
        <div className="flex items-center justify-between">
          <MeterLabel>Plan limit</MeterLabel>
          <MeterValue className="text-foreground">{() => "9.2 / 10 GB"}</MeterValue>
        </div>
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </Meter>

      <Meter value={28}>
        <div className="flex items-center justify-between">
          <MeterLabel>Seats remaining</MeterLabel>
          <MeterValue>{() => "14 / 50"}</MeterValue>
        </div>
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </Meter>
    </div>
  );
}

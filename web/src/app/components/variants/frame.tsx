"use client";

import {
  AvatarGroup,
  type AvatarGroupItem,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const MEMBERS: Array<{ name: string; tone: AvatarGroupItem["tone"] }> = [
  { name: "Avery Mendez", tone: "violet" },
  { name: "Jordan Park", tone: "amber" },
  { name: "Riley Chen", tone: "rose" },
  { name: "Sam Vega", tone: "emerald" },
];

export function FrameVariants() {
  return (
    <Frame>
      <FrameHeader>
        <FrameTitle>Workspace settings</FrameTitle>
        <FrameDescription>
          Manage your workspace name, region, and team.
        </FrameDescription>
      </FrameHeader>

      <FramePanel>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="font-semibold text-sm">General</div>
            <div className="text-muted-foreground text-sm">
              Workspace name and default region.
            </div>
          </div>
          <Badge variant="default">
            Synced
          </Badge>
        </div>
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="frame-ws-name" className="text-xs">
              Workspace name
            </Label>
            <Input id="frame-ws-name" defaultValue="Template" className="max-w-sm" />
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border/40 pt-3">
            <div className="flex flex-col">
              <Label htmlFor="frame-auto-region" className="font-medium text-sm">
                Auto-detect region
              </Label>
              <span className="text-muted-foreground text-xs">
                Use the closest region based on your team.
              </span>
            </div>
            <Switch id="frame-auto-region" defaultChecked />
          </div>
        </div>
      </FramePanel>

      <FramePanel>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="font-semibold text-sm">Members</div>
            <div className="text-muted-foreground text-sm">
              People with access to this workspace.
            </div>
          </div>
          <Badge variant="info">
            Pro plan
          </Badge>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AvatarGroup
              items={MEMBERS.map((m) => ({ alt: m.name, tone: m.tone }))}
              max={3}
              size="sm"
            />
            <Badge variant="default">
              {MEMBERS.length} members
            </Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm">
              Manage
            </Button>
            <Button variant="outline" size="sm">
              Invite
            </Button>
          </div>
        </div>
      </FramePanel>

      <FrameFooter>Last updated 2 hours ago.</FrameFooter>
    </Frame>
  );
}

"use client";

import { useState } from "react";
import {
  BarChart3,
  Bell,
  Box,
  Code2,
  HelpCircle,
  Layers,
  Lightbulb,
  List as ListIcon,
  Moon,
  Plug,
  Search,
  Webhook as WebhookIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { useMounted } from "@/hooks/use-mounted";
import { useTheme } from "@/components/theme-provider";

const MONITOR = [
  { id: "metrics", label: "Metrics", icon: BarChart3 },
  { id: "runs", label: "Runs", icon: ListIcon },
  { id: "events", label: "Events", icon: Layers },
  { id: "insights", label: "Insights", icon: Lightbulb, badge: "Beta" },
];

const MANAGE = [
  { id: "apps", label: "Apps", icon: Box },
  { id: "functions", label: "Functions", icon: Code2 },
  { id: "event-types", label: "Event Types", icon: Bell },
  { id: "webhooks", label: "Webhooks", icon: WebhookIcon },
];

export const InngestSidebar = () => {
  const [active, setActive] = useState("runs");
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="gap-2 px-2 pb-2 pt-0 group-data-[collapsible=icon]:pt-2">
        <div className="flex h-12 items-center gap-2 px-2 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <span className="flex-1 self-center font-bold text-sm leading-none tracking-wide group-data-[collapsible=icon]:hidden">
            INNGEST
          </span>
          <Button variant="ghost" size="icon-sm" aria-label="Search">
            <Search />
          </Button>
        </div>
        <div className="px-px group-data-[collapsible=icon]:hidden">
          <Select defaultValue="dev">
            <SelectTrigger size="sm" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectPopup>
              <SelectItem value="dev">Dev</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="production">Production</SelectItem>
            </SelectPopup>
          </Select>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Monitor</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MONITOR.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={active === item.id}
                      onClick={() => setActive(item.id)}
                      tooltip={item.label}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    {item.badge ? (
                      <SidebarMenuBadge>
                        <Badge appearance="soft" variant="info">
                          {item.badge}
                        </Badge>
                      </SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MANAGE.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={active === item.id}
                      onClick={() => setActive(item.id)}
                      tooltip={item.label}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Integrations">
              <Plug />
              <span>Integrations</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Help and Feedback">
              <HelpCircle />
              <span>Help and Feedback</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <ThemeRow />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="AtoBeach"
              className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            >
              <Avatar className="size-7 shrink-0">
                <AvatarFallback>AB</AvatarFallback>
              </Avatar>
              <span className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium text-sm">AtoBeach</span>
                <span className="truncate text-muted-foreground text-xs">
                  Kyle Graham Matzen
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

const ThemeRow = () => {
  const mounted = useMounted();
  const { theme, setTheme } = useTheme();
  const isDark = mounted && theme === "dark";
  return (
    <SidebarMenuButton
      onClick={() => setTheme(isDark ? "light" : "dark")}
      tooltip="Theme"
    >
      <Moon />
      <span>Theme</span>
      <Switch
        checked={isDark}
        onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
        onClick={(e) => e.stopPropagation()}
        className="ms-auto group-data-[collapsible=icon]:hidden"
      />
    </SidebarMenuButton>
  );
};

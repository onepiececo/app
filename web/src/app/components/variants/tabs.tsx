"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TabsVariants() {
  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="overview">
        <TabsList fullWidth>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
      </Tabs>
      <Tabs defaultValue="activity">
        <TabsList variant="inset">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

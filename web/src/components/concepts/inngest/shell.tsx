"use client";

import { useState, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Page, PageBody, PageHeader } from "@/components/ui/page";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { InngestSidebar } from "@/components/concepts/inngest/sidebar";
import { FilterRow, RunsTable } from "@/components/concepts/inngest/runs-table";
import { InngestRightPanel } from "@/components/concepts/inngest/right-panel";

type InngestShellProps = {
  output: ReactNode;
};

export const InngestShell = (props: InngestShellProps) => {
  const [runOpen, setRunOpen] = useState(true);

  return (
    <SidebarProvider defaultOpen>
      <TooltipProvider delay={500} closeDelay={120}>
        <InngestSidebar />
        <SidebarInset>
          <Page>
            <PageHeader>
              <h2 className="text-sm font-semibold">Runs</h2>
              <Button size="sm" className="ml-auto">
                <RefreshCw />
                Refresh runs
              </Button>
            </PageHeader>
            <PageBody bleed="all">
              <FilterRow />
              <RunsTable open={runOpen} onOpenChange={setRunOpen} />
            </PageBody>
          </Page>
        </SidebarInset>
        <InngestRightPanel open={runOpen} output={props.output} />
      </TooltipProvider>
    </SidebarProvider>
  );
};

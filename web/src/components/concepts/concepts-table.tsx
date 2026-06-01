"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  createColumnHelper,
  type DataTableColumnDef,
  type DataTableFilter,
} from "@/components/ui/table";

type Concept = {
  id: string;
  name: string;
  href: string;
  category: "Workflow" | "Dashboard" | "Auth" | "Editor";
  status: "Live" | "Coming soon";
  description: string;
  updated: string;
};

const CONCEPTS: Concept[] = [
  {
    id: "inngest",
    name: "Inngest runs",
    href: "/concepts/inngest",
    category: "Workflow",
    status: "Live",
    description: "Function runs explorer with trace timeline and step details.",
    updated: "2026-04-26",
  },
];

const col = createColumnHelper<Concept>();

const COLUMNS: DataTableColumnDef<Concept>[] = [
  col.accessor("name", {
    header: "Name",
    size: 220,
    cell: (info) => {
      const row = info.row.original;
      const isLive = row.status === "Live";
      return isLive ? (
        <Link
          href={row.href}
          className="inline-flex items-center gap-1.5 font-medium hover:underline"
        >
          {info.getValue()}
          <ArrowUpRight className="size-3.5 opacity-70" />
        </Link>
      ) : (
        <span className="font-medium text-muted-foreground">{info.getValue()}</span>
      );
    },
  }),
  col.accessor("category", {
    header: "Category",
    size: 140,
    cell: (info) => (
      <Badge appearance="soft" variant="default">
        {info.getValue()}
      </Badge>
    ),
  }),
  col.accessor("status", {
    header: "Status",
    size: 130,
    enableResizing: false,
    cell: (info) => {
      const status = info.getValue();
      return (
        <Badge
          appearance="soft"
          variant={status === "Live" ? "success" : "default"}
        >
          {status}
        </Badge>
      );
    },
  }),
  col.accessor("description", {
    header: "Description",
    size: 360,
    enableSorting: false,
    enableColumnFilter: false,
    cell: (info) => (
      <span className="text-muted-foreground">{info.getValue()}</span>
    ),
  }),
  col.accessor("updated", {
    header: "Updated",
    size: 130,
    enableColumnFilter: false,
    cell: (info) => (
      <span className="text-muted-foreground tabular-nums">
        {info.getValue()}
      </span>
    ),
  }),
];

const FILTERS: ReadonlyArray<DataTableFilter> = [
  {
    id: "category",
    label: "Category",
    options: [
      { value: "Workflow", label: "Workflow" },
      { value: "Dashboard", label: "Dashboard" },
      { value: "Auth", label: "Auth" },
      { value: "Editor", label: "Editor" },
    ],
  },
  {
    id: "status",
    label: "Status",
    options: [
      { value: "Live", label: "Live" },
      { value: "Coming soon", label: "Coming soon" },
    ],
  },
];

export const ConceptsTable = () => (
  <DataTable<Concept>
    columns={COLUMNS}
    data={CONCEPTS}
    filters={FILTERS}
    pagination
    pageSize={10}
  />
);

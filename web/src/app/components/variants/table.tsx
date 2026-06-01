"use client";

import { Badge } from "@/components/ui/badge";
import {
  createColumnHelper,
  createSelectionColumn,
  DataTable,
  type DataTableColumnDef,
  type DataTableFilter,
} from "@/components/ui/table";

type Domain = {
  id: string;
  domain: string;
  type: "Apex" | "Subdomain" | "Wildcard";
  region: "us-east-1" | "us-west-2" | "eu-west-1";
  status: "Verified" | "Pending" | "Active" | "Idle";
  added: string;
  owner: string;
  ttl: number;
  records: number;
};

const DATA: Domain[] = [
  { id: "d1", domain: "template.com", type: "Apex", region: "us-east-1", status: "Verified", added: "Mar 12", owner: "platform@template.com", ttl: 3600, records: 7 },
  { id: "d2", domain: "app.template.com", type: "Subdomain", region: "us-east-1", status: "Verified", added: "Mar 14", owner: "frontend@template.com", ttl: 1800, records: 4 },
  { id: "d3", domain: "api.template.com", type: "Subdomain", region: "eu-west-1", status: "Pending", added: "Apr 02", owner: "backend@template.com", ttl: 900, records: 12 },
  { id: "d4", domain: "*.preview.template.com", type: "Wildcard", region: "us-east-1", status: "Active", added: "Apr 18", owner: "platform@template.com", ttl: 300, records: 2 },
  { id: "d5", domain: "docs.template.com", type: "Subdomain", region: "us-west-2", status: "Idle", added: "Apr 22", owner: "docs@template.com", ttl: 3600, records: 3 },
  { id: "d6", domain: "marketing.template.com", type: "Subdomain", region: "us-east-1", status: "Verified", added: "Apr 24", owner: "marketing@template.com", ttl: 1800, records: 5 },
  { id: "d7", domain: "status.template.com", type: "Subdomain", region: "us-west-2", status: "Verified", added: "Apr 25", owner: "platform@template.com", ttl: 900, records: 2 },
  { id: "d8", domain: "blog.template.com", type: "Subdomain", region: "eu-west-1", status: "Pending", added: "Apr 26", owner: "marketing@template.com", ttl: 1800, records: 6 },
  { id: "d9", domain: "files.template.com", type: "Subdomain", region: "us-east-1", status: "Active", added: "Apr 27", owner: "platform@template.com", ttl: 600, records: 8 },
  { id: "d10", domain: "shop.template.com", type: "Subdomain", region: "us-west-2", status: "Pending", added: "Apr 28", owner: "marketing@template.com", ttl: 900, records: 4 },
];

const STATUS_TONE: Record<Domain["status"], "success" | "warning" | "info" | "default"> = {
  Verified: "success",
  Pending: "warning",
  Active: "info",
  Idle: "default",
};

const col = createColumnHelper<Domain>();

const columns: DataTableColumnDef<Domain>[] = [
  createSelectionColumn<Domain>(),
  col.accessor("domain", {
    header: "Domain",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    size: 240,
  }),
  col.accessor("type", {
    header: "Type",
    cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
    size: 120,
  }),
  col.accessor("region", {
    header: "Region",
    cell: (info) => (
      <span className="font-mono text-xs text-muted-foreground">{info.getValue()}</span>
    ),
    size: 130,
  }),
  col.accessor("status", {
    header: "Status",
    enableResizing: false,
    cell: (info) => {
      const v = info.getValue() as Domain["status"];
      return (
        <Badge variant={STATUS_TONE[v]}>
          {v}
        </Badge>
      );
    },
    size: 130,
  }),
  col.accessor("owner", { header: "Owner", cell: (i) => <span className="font-mono text-xs text-muted-foreground">{i.getValue()}</span>, size: 240 }),
  col.accessor("ttl", { header: "TTL", size: 100, cell: (i) => <span className="font-mono text-xs tabular-nums text-muted-foreground">{i.getValue()}s</span> }),
  col.accessor("records", { header: "Records", size: 110, cell: (i) => <span className="font-mono text-xs tabular-nums">{i.getValue()}</span> }),
  col.accessor("added", { header: "Added", enableResizing: false, size: 110 }),
];

const FILTERS: DataTableFilter[] = [
  { id: "type", label: "Type", options: [{ value: "Apex", label: "Apex" }, { value: "Subdomain", label: "Subdomain" }, { value: "Wildcard", label: "Wildcard" }] },
  { id: "region", label: "Region", options: [{ value: "us-east-1", label: "us-east-1" }, { value: "us-west-2", label: "us-west-2" }, { value: "eu-west-1", label: "eu-west-1" }] },
];

export function TableVariants() {
  return (
    <DataTable<Domain>
      appearance="primary"
      columns={columns}
      data={DATA}
      density="spacious"
      enableColumnResizing
      enableSelection
      filters={FILTERS}
      pagination
      pageSize={5}
    />
  );
}

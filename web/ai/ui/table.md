# Table & DataTable

Source: [`src/components/ui/table/`](../../src/components/ui/table/) (folder).

Two surfaces:

- **Low-level primitives** (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableFooter`, `TableCaption`) — thin styled wrappers around native `<table>` elements. Reach for these only when building something the `DataTable` adapter can't express.
- **`<DataTable<T>>`** — the production-default. A typed adapter on top of [TanStack Table v8](https://tanstack.com/table) that handles sorting, filtering, pagination, selection, column resizing, and ScrollArea integration with a single prop surface. **Use this for ~95% of tables in the app.**

## File layout

```
src/components/ui/table/
  index.ts             # barrel — re-exports DataTable + helpers + TanStack types
  data-table.tsx       # the <DataTable<T>> component
  primitives.tsx       # Table, TableHead, TableCell, … (low-level)
  selection.tsx        # createSelectionColumn<T>() factory
  filter-combobox.tsx  # the toolbar combobox bound to a column filter
  pagination-footer.tsx # programmatic Pagination wired to TanStack pagination state
  types.ts             # DataTableProps<T>, DataTableFilter, DataTableColumnDef<T>, …
```

Import everything from `@/components/ui/table`:

```tsx
import {
  DataTable,
  createColumnHelper,
  createSelectionColumn,
  type ColumnDef,
  type DataTableColumnDef,
  type DataTableFilter,
} from "@/components/ui/table";
```

## TanStack Table v8 — what you actually need to know

We're on `@tanstack/react-table@^8.21.3` (NOT v9 alpha). Anything you read about v9 (`useTable`) doesn't apply yet.

### The mental model

TanStack Table is **headless** — it computes rows / columns / sorting / filtering / pagination state, and you render. Our `<DataTable>` is the rendering layer; TanStack runs underneath. You almost never call its primitives directly — you build `columns`, hand them to `<DataTable>`, and the adapter wires the rest.

### `'use no memo'` — required at the top of every TanStack file

This directive is the single most important thing to remember when touching `@tanstack/react-table`. Skipping it produces silent, hard-to-trace bugs. Here's what it actually does:

**The conflict.** Our project enables React Compiler (`reactCompiler: true` in `next.config.ts`). At build time the compiler walks every component, decides what's safely memoizable, and inserts the equivalent of `useMemo` / `useCallback` automatically. That's how we get away with never writing those hooks (see [`react-19.md`](../react-19.md)).

TanStack Table v8 was written before React Compiler shipped. Internally it relies on **mutation between renders** — `useReactTable` returns a `Table` instance whose methods (`getRowModel`, `getHeaderGroups`, `getFilteredRowModel`, …) read from a shared mutable object that's updated as state changes. Compiler memoization caches return values based on argument identity, but the underlying instance keeps mutating, so cached results go stale. Symptoms range from subtle (a row checkbox toggle that doesn't propagate) to fatal (infinite render loops, "filters that don't apply" complaints, sort that runs once and then freezes).

**The fix.** `"use no memo"` is a Babel-level directive recognized by the React Compiler plugin. Placed at the very top of a file (above `"use client"` is conventional but order doesn't matter to the compiler), it **excludes the entire file from compiler memoization**. Components in that file render the React 18 way — every render re-runs every line. TanStack's mutability is preserved because nothing's caching anything.

**Where it goes.** Every file that:

1. Imports anything from `@tanstack/react-table`, OR
2. Calls `useReactTable`, OR
3. *Creates* objects passed to a TanStack-aware component (column defs with cell closures, selection column factories, filter-combobox state, custom row-model getters)

…**must start with**:

```tsx
"use no memo";
"use client";
```

In this repo that means `data-table.tsx`, `selection.tsx`, `filter-combobox.tsx`, `pagination-footer.tsx` — anything inside `src/components/ui/table/` that touches TanStack. Consumer files that only `import { DataTable } from "@/components/ui/table"` and pass it columns *don't* need the directive (the compiler can safely memoize the consumer; the directive lives where the TanStack call happens).

**Cost.** The opted-out file loses compiler benefits (no auto-memo, no inlined dep tracking). For a self-contained adapter like ours that's a fair trade. Don't sprinkle the directive across consumer code — keep it scoped to the adapter layer.

**The other rule still applies.** "Use no memo" disables the *compiler*, not the project rule banning `useMemo` / `useCallback`. Inside a `'use no memo'` file you **still don't write** `useMemo` / `useCallback` — they're banned across the codebase. For stable instance creation use a lazy `useRef` or `useState(() => x)[0]` (see `react-19.md`). Our `DataTable` follows this rule: it accepts a `selection` opt-in by spreading `createSelectionColumn()` at the call-site instead of merging the array internally — internal merging would have needed `useMemo` for stability, which we don't write.

**When can we drop it?** TanStack v9 (currently alpha at `9.0.0-alpha.x`) is rewritten to be compiler-safe via immutable state. Once v9 hits stable and we upgrade, every `'use no memo'` directive in the table folder can be deleted in the same PR.

### Building columns

Always use `createColumnHelper<TData>()` for type-safe column defs. Each `accessor` call infers the cell value type from the property key.

```tsx
type Domain = {
  id: string;
  domain: string;
  type: "Apex" | "Subdomain" | "Wildcard";
  status: "Verified" | "Pending" | "Active";
};

const col = createColumnHelper<Domain>();

const columns: DataTableColumnDef<Domain>[] = [
  col.accessor("domain", {
    header: "Domain",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    size: 240,
  }),
  col.accessor("status", {
    header: "Status",
    enableResizing: false,                 // pin this column's width
    cell: (info) => <Badge>{info.getValue()}</Badge>,
    size: 130,
  }),
];
```

`DataTableColumnDef<T>` is our alias for `ColumnDef<T, any>` — TanStack's official escape hatch when an array contains columns with different value types. Keep it; per-column safety still lives inside each `col.accessor("key", …)` call.

### Per-column options worth knowing

| Option | What it does |
| --- | --- |
| `header` | Column title. String, ReactNode, or a render function. |
| `cell` | Body-cell renderer. `(info) => …`, where `info.getValue()` is the typed value. |
| `size` | Initial pixel width. Used by `<col>` widths and as the resize start value. |
| `enableSorting: false` | Disables click-to-sort on this header. |
| `enableResizing: false` | Hides the drag handle and pins the width — see [resize](#column-resizing) below. |
| `enableColumnFilter: false` | Excludes this column from `getFilteredRowModel()` evaluation. |

### Row models we wire by default

TanStack ships row models à-la-carte. Our `<DataTable>` always wires:

- `getCoreRowModel()` — required.
- `getSortedRowModel()` — header click sorting.
- `getFilteredRowModel()` — drives the combobox filters.
- `getPaginationRowModel()` — only when `pagination` prop is on.

If you need `getGroupedRowModel`, `getExpandedRowModel`, or `getFacetedRowModel`, drop down to the primitives or add it to the adapter.

## DataTable API

```tsx
type DataTableProps<TData> = {
  columns: DataTableColumnDef<TData>[];
  data: TData[];
  enableSelection?: boolean;          // turns on RowSelectionState
  pagination?: boolean;                // shows the footer
  pageSize?: number;                   // default 10
  filters?: ReadonlyArray<DataTableFilter>;
  emptyState?: ReactNode;              // overlaid inside the reserved body area
  appearance?: "neutral" | "primary";  // header tint
  density?: "compact" | "default" | "spacious";
  enableColumnResizing?: boolean;
  maxHeight?: number | string;         // caps the table; ScrollArea handles overflow
  reserveEmptyRows?: number;           // override the default (= pageSize)
  className?: string;
};
```

## Scenarios

### 1. The default — sortable + filters

```tsx
const FILTERS: DataTableFilter[] = [
  {
    id: "type",                                           // matches column id
    label: "Type",
    options: [
      { value: "Apex", label: "Apex" },
      { value: "Subdomain", label: "Subdomain" },
    ],
  },
];

<DataTable<Domain> columns={columns} data={data} filters={FILTERS} />;
```

Each filter renders as a Combobox in a toolbar above the table. Selecting a value calls `column.setFilterValue(value)` on the matching TanStack column; clearing the Combobox unsets it. The body re-renders through `getFilteredRowModel()`.

### 2. Selection — checkbox column

`enableSelection` on the prop turns on TanStack's `RowSelectionState`. The actual checkbox column is added by spreading `createSelectionColumn<T>()` at the **start** of your `columns` array:

```tsx
const columns: DataTableColumnDef<Domain>[] = [
  createSelectionColumn<Domain>(),
  col.accessor("domain", { … }),
  …
];

<DataTable<Domain> columns={columns} data={data} enableSelection />;
```

The header checkbox toggles all rows on the current page (with proper `indeterminate` state); each row's checkbox toggles that row. Read selection from `table.getSelectedRowModel().rows` if you need to act on it — you'll need to wire `useReactTable` directly or expose the table instance.

### 3. Pagination — programmatic, not URL-driven

```tsx
<DataTable<Domain> columns={columns} data={data} pagination pageSize={10} />
```

The footer renders our `<Pagination>` component (anchor-based per [`pagination.md`](./pagination.md)) wired to `table.previousPage()` / `table.nextPage()` via `onClick={preventDefault}`. Prev/Next are styled with `buttonVariants({ variant: "outline", size: "default" })` for footer presence. Layout is `grid grid-cols-[1fr_auto_1fr]` so `Page X of Y` is true-centered regardless of button widths.

The footer always renders when `pagination` is on — even with 0 or 1 pages it shows "Page 1 of 1" with both buttons disabled, so the surrounding height never shifts.

### 4. Column resizing — per-column, not table-wide

```tsx
const columns: DataTableColumnDef<Domain>[] = [
  col.accessor("domain", { header: "Domain", size: 240 }),
  col.accessor("type", { header: "Type", size: 120 }),
  col.accessor("status", {
    header: "Status",
    enableResizing: false,        // pinned-width
    size: 130,
  }),
];

<DataTable<Domain> columns={columns} data={data} enableColumnResizing />
```

Drag the right edge of any header to resize that column. The handle is a 2px spacer line in an 8px hit area on the right edge; it darkens on hover and turns primary while dragging.

**Per-column control** — set `enableResizing: false` on a column def to pin it. The handle simply doesn't render and the column stays at its `size`.

**The last column always flexes.** No matter what you set on it, the rightmost column has no `width` style and absorbs leftover horizontal space so the table can fill its container without redistributing slack into siblings on resize.

### 5. Filters — combobox toolbar

```tsx
const FILTERS: DataTableFilter[] = [
  {
    id: "region",
    label: "Region",
    options: [
      { value: "us-east-1", label: "us-east-1" },
      { value: "us-west-2", label: "us-west-2" },
      { value: "eu-west-1", label: "eu-west-1" },
    ],
  },
];

<DataTable<Domain> columns={columns} data={data} filters={FILTERS} />;
```

Each entry's `id` must match a column's `id` (or accessor key). The Combobox writes the selected value to `column.setFilterValue(value)`. TanStack's default filter function is `includesString`, so equality matching just works for `string` values.

For **fuzzy / multi-select / range filters**, set `filterFn` on the column def in TanStack's column model (`{ filterFn: 'arrIncludes' | 'inNumberRange' | <custom fn> }`) — our combobox writes a single string value, but the column can interpret it however it likes.

### 6. Empty state — pageSize-stable

```tsx
<DataTable<Domain>
  columns={columns}
  data={data}
  pagination
  pageSize={7}
  emptyState={<MyEmpty />}
/>
```

When `data.length < pageSize` (or `0`), the body pads with invisible spacer rows so the table's vertical footprint never shifts between full / partial / empty pages. Spacer height is **measured** from a real row on first render (via `useRef + useEffect` since the file opts out of compiler memo), with a per-density fallback (`compact: 36px, default: 48px, spacious: 56px`) before measurement.

The `emptyState` ReactNode is overlaid absolutely on the spacer body, vertically centered. Reach for [`Empty`](./empty.md) for the standard pattern.

### 7. Density + appearance

```tsx
<DataTable density="compact" />              // py-1.5 rows, log/admin feel
<DataTable density="spacious" />             // py-4 rows, settings/grid feel
<DataTable appearance="primary" />           // primary-tinted header pill
```

### 8. Vertical scroll — `maxHeight`

```tsx
<DataTable<Domain> columns={columns} data={data} maxHeight={320} />
```

Caps the table at 320px and lets the body scroll inside the project's `ScrollArea` (the same component used for sidebars / dialogs / drawers, with the standard hover-revealed thumb chrome). Pass `scrollbarGutter` is already enabled so the body doesn't shift when the bar appears.

### 9. Horizontal scroll — automatic

When `sum(column.size) > container width`, the table holds its `min-width` and the ScrollArea's horizontal bar activates. No prop needed.

## Header chrome

Picked across 50 variants on `/test`:

- **Heavy header pill** — `bg-muted/72`, sentence-case `font-medium text-xs`, `rounded-l-lg` / `rounded-r-lg` on the first / last header cells. Body has no row separators — hover and selection bg-muted highlights have matching pill ends via `rounded-l-lg` / `rounded-r-lg` on first / last `<td>`.
- **Sortable headers are real `<button>` elements** styled with `buttonVariants({ variant: "ghost", size: "sm" })` — clickable everywhere in the cell, hover/active states match the rest of the design system.
- **Sort indicator** — `ChevronsUpDown` (unsorted, faint), `ChevronUp` (asc), `ChevronDown` (desc) sits inside the same flex span as the label.
- **`appearance="primary"`** swaps the header bg to `color-mix(primary, 8%, background)` and the text to `var(--primary)`.

## Beyond the basics

The adapter covers the common cases, but TanStack has a much larger surface. These sections cover the next-most-frequent needs.

### Reading selection / sort / filter state from outside

**This is a real limitation.** Our `DataTable` owns `useReactTable` internally and doesn't expose the table instance. There's no way to read the current selection from the parent component as written.

Three options when you need it:

1. **Add a callback prop.** Smallest change — extend `DataTableProps<T>` with `onRowSelectionChange?: (selection: RowSelectionState) => void` and call it inside the existing `onRowSelectionChange` setter. Same for `onSortingChange`, `onColumnFiltersChange`, `onPaginationChange`. Lift each piece of state on demand.

2. **Lift the entire state.** Add a `state` + `onStateChange` pair that lets the parent fully control TanStack's state tree. Closer to the headless mental model.

3. **Drop the adapter, call `useReactTable` yourself.** See [Escape hatch](#escape-hatch) below — for very custom surfaces this is sometimes cleaner than threading more props.

```tsx
// Option 1 — selection callback
type DataTableProps<TData> = {
  …
  onRowSelectionChange?: (selection: RowSelectionState) => void;
};

// inside DataTable:
const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
useEffect(() => {
  props.onRowSelectionChange?.(rowSelection);
}, [rowSelection]);
```

If you find yourself adding more than two of these callbacks, it's time to lift state (option 2) or drop the adapter (option 3).

### `info.row.original` — accessing the full row in cells

`info.getValue()` returns just the accessor's value. For anything richer (icons that depend on a sibling field, conditional formatting based on multiple columns, links built from `id`), use `info.row.original`:

```tsx
col.accessor("domain", {
  header: "Domain",
  cell: (info) => {
    const row = info.row.original;          // full Domain object
    return (
      <Link href={`/domains/${row.id}`} className="font-medium">
        {row.domain}
      </Link>
    );
  },
}),

// Cross-column conditional formatting:
col.accessor("status", {
  header: "Status",
  cell: (info) => {
    const status = info.getValue();
    const isStale = info.row.original.added < ONE_WEEK_AGO;
    return (
      <Badge variant={isStale ? "warning" : STATUS_TONE[status]}>
        {status}{isStale && " · stale"}
      </Badge>
    );
  },
}),
```

Other useful row APIs: `row.id` (the row's unique id, usually `row.index` unless `getRowId` is set), `row.getValue("colId")` (read another column's value), `row.depth` (for grouping), `row.subRows` (for expanded/grouped tables).

### Custom filter functions

TanStack ships several built-in filter functions: `includesString` (default), `equalsString`, `arrIncludes`, `inNumberRange`, `weakEquals`. Set one per column with `filterFn`:

```tsx
col.accessor("region", {
  header: "Region",
  filterFn: "arrIncludes",      // filter value is an array of region ids
  …
}),
```

For anything beyond those, write your own. The signature is `(row, columnId, filterValue, addMeta) => boolean`:

```tsx
col.accessor("domain", {
  header: "Domain",
  // Fuzzy substring match across the whole Domain object, not just the
  // domain name. Combobox would feed `filterValue` as a typed query.
  filterFn: (row, _columnId, filterValue: string) => {
    if (!filterValue) return true;
    const q = filterValue.toLowerCase();
    const data = row.original;
    return (
      data.domain.toLowerCase().includes(q) ||
      data.owner.toLowerCase().includes(q) ||
      data.region.toLowerCase().includes(q)
    );
  },
}),
```

Our `<DataTableFilterCombobox>` writes a single string. Custom filter functions can interpret that string however they like (as a query, as a comma-separated list, as JSON, …).

### Multi-column / cross-row global filtering

For a search box that filters across all columns at once, switch from per-column `columnFilters` to TanStack's **global** filter:

```tsx
// In useReactTable options (drop the adapter for this — current adapter only wires column filters):
const [globalFilter, setGlobalFilter] = useState("");

useReactTable({
  …,
  state: { globalFilter },
  onGlobalFilterChange: setGlobalFilter,
  globalFilterFn: "includesString",       // or a custom (row, columnId, value) fn
  getFilteredRowModel: getFilteredRowModel(),
});

// In your toolbar:
<Input value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} />
```

If you want this baked into the adapter, add a `globalFilter?: boolean` prop and render an Input above the filter combobox row.

### Server-side data — `manualPagination`, `manualSorting`, `manualFiltering`

When the dataset lives on a server and you can't ship every row to the client, you tell TanStack to skip its built-in row models and trust the props you pass in:

```tsx
const table = useReactTable({
  data,                                       // current page only
  columns,
  pageCount,                                  // total page count from server
  state: { sorting, columnFilters, pagination },
  onSortingChange: setSorting,                // each setter triggers your fetch
  onColumnFiltersChange: setColumnFilters,
  onPaginationChange: setPagination,
  manualPagination: true,                     // <— key: don't paginate client-side
  manualSorting: true,                        // <— don't sort client-side
  manualFiltering: true,                      // <— don't filter client-side
  getCoreRowModel: getCoreRowModel(),
  // NOTE: do NOT include getPaginationRowModel/getSortedRowModel/getFilteredRowModel
  // when going manual — they'd run a second time on already-sorted data.
});

// Wire each state change to a server fetch:
useEffect(() => {
  fetch(`/api/domains?page=${pagination.pageIndex}&sort=${sorting[0]?.id}&q=${columnFilters[0]?.value}`)
    .then(r => r.json())
    .then(({ rows, total }) => {
      setData(rows);
      setPageCount(Math.ceil(total / pagination.pageSize));
    });
}, [pagination, sorting, columnFilters]);
```

Our adapter doesn't expose these flags yet — for server-side data, drop the adapter and call `useReactTable` directly (see [Escape hatch](#escape-hatch)). When/if we add `manual: { pagination, sorting, filtering }` to `DataTableProps`, this becomes a one-prop change.

### Default and multi-column sorting

Seed initial sort state via TanStack's `initialState`:

```tsx
useReactTable({
  …,
  initialState: {
    sorting: [{ id: "added", desc: true }],   // newest first by default
  },
});
```

For multi-column sort (shift-click a second header to add a secondary sort key), that's already on by default — just hold ⇧ while clicking. Disable with `enableMultiSort: false` on `useReactTable` or per-column with `enableMultiSort: false`.

To customize the sort comparator:

```tsx
col.accessor("status", {
  header: "Status",
  sortingFn: (a, b, columnId) => {
    const order = ["Verified", "Active", "Pending", "Idle"];
    return order.indexOf(a.getValue(columnId)) - order.indexOf(b.getValue(columnId));
  },
}),
```

### Column visibility (hide / show columns)

```tsx
const [columnVisibility, setColumnVisibility] = useState({});

useReactTable({
  …,
  state: { columnVisibility },
  onVisibilityChange: setColumnVisibility,
});

// Toggle a column off:
setColumnVisibility((v) => ({ ...v, region: false }));

// Read the list of visible/hidden columns:
table.getAllColumns().filter(c => c.getCanHide()).map(c => ({
  id: c.id,
  visible: c.getIsVisible(),
  toggle: () => c.toggleVisibility(),
}));
```

A typical UI is a "Columns" dropdown menu in the toolbar with a checkbox per hideable column. Set `enableHiding: false` on column defs that should always show (selection column already has this).

Our adapter doesn't expose visibility state yet — same path as server-side: drop the adapter or extend it.

### Escape hatch — calling `useReactTable` directly

When the adapter doesn't fit (server-side data, expanded/grouped rows, column pinning, virtualization, custom toolbar with global filter, controlled state lifted to a parent, …), copy the relevant chunks of `data-table.tsx` and call `useReactTable` yourself.

The minimum viable shape:

```tsx
"use no memo";
"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { Domain } from "@/types";

export function MyCustomTable(props: { data: Domain[]; columns: ColumnDef<Domain, any>[] }) {
  const table = useReactTable({
    data: props.data,
    columns: props.columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((hg) => (
          <tr key={hg.id}>
            {hg.headers.map((h) => (
              <th key={h.id}>
                {flexRender(h.column.columnDef.header, h.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

You lose the heavy header pill, sort buttons, combobox filters, pagination footer, ScrollArea integration, and pageSize-stable empty rows. Pull the chrome you want from `data-table.tsx` — it's plain Tailwind, no special abstractions.

**Don't forget the directive.** Custom tables that call `useReactTable` need `"use no memo"` at the top of their file too — the React Compiler doesn't care which component is calling TanStack.

## Rules of thumb

- **`'use no memo'` at the top of every file that imports `@tanstack/react-table`.** Non-negotiable.
- **Use `<DataTable>`, not the primitives.** The primitives exist for exotic layouts; default to the adapter.
- **`createColumnHelper<TData>()` always.** Never hand-roll `ColumnDef<…>` — you lose type inference on `info.getValue()`.
- **`DataTableColumnDef<T>` for the array type**, not `ColumnDef<T, any>` directly. Same shape, more searchable.
- **Selection column goes at the start, via `createSelectionColumn<T>()`.** Don't try to add a checkbox column manually — the factory handles `enableSorting: false`, `enableResizing: false`, indeterminate state, and the centered checkbox alignment.
- **Pagination footer always renders when `pagination` is on.** Don't gate it on `data.length` — it auto-shows "Page 1 of 1" with disabled buttons when empty.
- **Set `pageSize` to a value that fits the body design.** The empty-state height equals `pageSize × measuredRowHeight`; choose accordingly.
- **`size` per column is a starting point, not a hard cap.** With `enableColumnResizing`, users can drag past it. With `enableResizing: false`, it's enforced.
- **Don't set `width` on the last column.** The adapter strips it so the column flexes — explicit widths there fight the spacer behavior.

## What to avoid

- **No raw `<table>` markup** for production tables. Use `<DataTable>`.
- **No `useMemo`/`useCallback`** in TanStack files. The `'use no memo'` directive disables compiler memo, but our project rule (per `react-19.md`) still bans those hooks. For stable instances, use a lazy ref.
- **No `keepMounted` on the body's ScrollArea bars.** The bar should mount/unmount based on actual overflow — forcing it visible always made the bar appear even when columns no longer overflowed.
- **No manual `data-state="selected"` on rows** — TanStack drives that via the row's `getIsSelected()`; our adapter wires it.
- **No mixing `<DataTable>` with the low-level primitives in the same surface.** Pick one. Mixing them produces inconsistent chrome.
- **No `enableColumnResizing` without setting reasonable `size` values.** Without sizes, columns default to TanStack's 150px and the resize feel is muddy.

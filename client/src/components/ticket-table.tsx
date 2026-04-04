import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, MessageSquare, Search, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { TicketStatus, TicketCategory } from "core";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Ticket {
  id: string;
  subject: string;
  senderEmail: string;
  senderName: string;
  status: TicketStatus;
  category: TicketCategory | null;
  assignedTo: string | null;
  createdAt: string;
  agent: { id: string; name: string } | null;
  _count: { messages: number };
}

const statusStyles: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  [TicketStatus.RESOLVED]: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  [TicketStatus.CLOSED]: "bg-secondary text-secondary-foreground",
};

const categoryLabels: Record<TicketCategory, string> = {
  [TicketCategory.GENERAL_QUESTION]: "General",
  [TicketCategory.TECHNICAL_QUESTION]: "Technical",
  [TicketCategory.REFUND_REQUEST]: "Refund",
};

function SortIcon({ column }: { column: { getIsSorted: () => false | "asc" | "desc" } }) {
  const sort = column.getIsSorted();
  if (sort === "asc") return <ArrowUp className="ml-1 h-3.5 w-3.5" />;
  if (sort === "desc") return <ArrowDown className="ml-1 h-3.5 w-3.5" />;
  return <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-40" />;
}

const columns: ColumnDef<Ticket>[] = [
  {
    accessorKey: "subject",
    header: "Subject",
    filterFn: (row, _columnId, filterValue: string) => {
      const search = filterValue.toLowerCase();
      return (
        row.original.subject.toLowerCase().includes(search) ||
        row.original.senderName.toLowerCase().includes(search) ||
        row.original.senderEmail.toLowerCase().includes(search)
      );
    },
    cell: ({ row }) => (
      <span className="font-medium max-w-[300px] truncate block">
        {row.original.subject}
      </span>
    ),
  },
  {
    accessorKey: "senderName",
    header: "From",
    enableColumnFilter: false,
    cell: ({ row }) => (
      <div>
        <div className="text-sm">{row.original.senderName}</div>
        <div className="text-xs text-muted-foreground">{row.original.senderEmail}</div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    filterFn: "equals",
    cell: ({ row }) => (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[row.original.status]}`}>
        {row.original.status}
      </span>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    sortUndefined: "last",
    filterFn: (row, _columnId, filterValue: string) => {
      if (filterValue === "UNCATEGORIZED") return row.original.category === null;
      return row.original.category === filterValue;
    },
    cell: ({ row }) => {
      const cat = row.original.category;
      return cat ? (
        <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
          {categoryLabels[cat] ?? cat}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">-</span>
      );
    },
  },
  {
    id: "agent",
    accessorFn: (row) => row.agent?.name ?? "",
    header: "Assigned To",
    filterFn: (row, _columnId, filterValue: string) => {
      if (filterValue === "UNASSIGNED") return row.original.agent === null;
      return row.original.agent?.id === filterValue;
    },
    cell: ({ row }) =>
      row.original.agent ? (
        <span className="text-sm">{row.original.agent.name}</span>
      ) : (
        <span className="text-xs text-muted-foreground">Unassigned</span>
      ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    enableColumnFilter: false,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {new Date(row.original.createdAt).toLocaleDateString()}
      </span>
    ),
  },
  {
    id: "messages",
    accessorFn: (row) => row._count.messages,
    header: () => null,
    enableSorting: false,
    enableColumnFilter: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-muted-foreground">
        <MessageSquare className="h-3.5 w-3.5" />
        <span className="text-xs">{row.original._count.messages}</span>
      </div>
    ),
  },
];

function TicketFilters({ table }: { table: ReturnType<typeof useReactTable<Ticket>> }) {
  const subjectFilter = (table.getColumn("subject")?.getFilterValue() as string) ?? "";
  const statusFilter = (table.getColumn("status")?.getFilterValue() as string) ?? "";
  const categoryFilter = (table.getColumn("category")?.getFilterValue() as string) ?? "";
  const agentFilter = (table.getColumn("agent")?.getFilterValue() as string) ?? "";

  const hasFilters = subjectFilter || statusFilter || categoryFilter || agentFilter;

  // Collect unique agents from table data
  const agents = table
    .getCoreRowModel()
    .rows.map((r) => r.original.agent)
    .filter((a): a is NonNullable<typeof a> => a !== null)
    .filter((a, i, arr) => arr.findIndex((b) => b.id === a.id) === i)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex items-center gap-3 p-4 border-b">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search subject, name, or email..."
          value={subjectFilter}
          onChange={(e) => table.getColumn("subject")?.setFilterValue(e.target.value)}
          className="pl-9 h-9"
        />
      </div>
      <Select
        value={statusFilter || "ALL"}
        onValueChange={(v) => table.getColumn("status")?.setFilterValue(v === "ALL" ? "" : v)}
      >
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          <SelectItem value={TicketStatus.OPEN}>Open</SelectItem>
          <SelectItem value={TicketStatus.RESOLVED}>Resolved</SelectItem>
          <SelectItem value={TicketStatus.CLOSED}>Closed</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={categoryFilter || "ALL"}
        onValueChange={(v) => table.getColumn("category")?.setFilterValue(v === "ALL" ? "" : v)}
      >
        <SelectTrigger className="w-[160px] h-9">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All categories</SelectItem>
          <SelectItem value={TicketCategory.GENERAL_QUESTION}>General</SelectItem>
          <SelectItem value={TicketCategory.TECHNICAL_QUESTION}>Technical</SelectItem>
          <SelectItem value={TicketCategory.REFUND_REQUEST}>Refund</SelectItem>
          <SelectItem value="UNCATEGORIZED">Uncategorized</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={agentFilter || "ALL"}
        onValueChange={(v) => table.getColumn("agent")?.setFilterValue(v === "ALL" ? "" : v)}
      >
        <SelectTrigger className="w-[160px] h-9">
          <SelectValue placeholder="Assigned to" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All agents</SelectItem>
          <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
          {agents.map((a) => (
            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-2"
          onClick={() => table.resetColumnFilters()}
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}

export function TicketTable() {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const { data: tickets, isPending, error } = useQuery({
    queryKey: ["tickets"],
    queryFn: () => axios.get<Ticket[]>("/api/tickets").then((res) => res.data),
  });

  const table = useReactTable({
    data: tickets ?? [],
    columns,
    state: { sorting, columnFilters, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: (updater) => {
      setColumnFilters(updater);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isPending) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>From</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-16" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-48" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-8" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-destructive">{error.message}</p>
      </div>
    );
  }

  if (!tickets?.length) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-muted-foreground">No tickets yet.</p>
      </div>
    );
  }

  const filteredCount = table.getFilteredRowModel().rows.length;
  const totalCount = tickets.length;

  return (
    <div>
      <TicketFilters table={table} />
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {header.isPlaceholder ? null : (
                    <div className="flex items-center">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && <SortIcon column={header.column} />}
                    </div>
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer"
                onClick={() => navigate(`/tickets/${row.original.id}`)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                No tickets match the current filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="text-xs text-muted-foreground">
          {filteredCount === totalCount
            ? `${totalCount} tickets`
            : `${filteredCount} of ${totalCount} tickets`}
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={String(pagination.pageSize)}
            onValueChange={(v) => setPagination({ pageIndex: 0, pageSize: Number(v) })}
          >
            <SelectTrigger className="h-8 w-[110px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)}>{size} per page</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground min-w-[90px] text-center">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount() || 1}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.firstPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.lastPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

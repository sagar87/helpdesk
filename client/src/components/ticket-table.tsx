import { useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, MessageSquare } from "lucide-react";
import { TicketStatus, TicketCategory } from "core";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    cell: ({ row }) => (
      <span className="font-medium max-w-[300px] truncate block">
        {row.original.subject}
      </span>
    ),
  },
  {
    accessorKey: "senderName",
    header: "From",
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
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-muted-foreground">
        <MessageSquare className="h-3.5 w-3.5" />
        <span className="text-xs">{row.original._count.messages}</span>
      </div>
    ),
  },
];

export function TicketTable() {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  const { data: tickets, isPending, error } = useQuery({
    queryKey: ["tickets"],
    queryFn: () => axios.get<Ticket[]>("/api/tickets").then((res) => res.data),
  });

  const table = useReactTable({
    data: tickets ?? [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
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

  return (
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
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

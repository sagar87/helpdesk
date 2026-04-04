import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
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

export function TicketTable() {
  const { data: tickets, isPending, error } = useQuery({
    queryKey: ["tickets"],
    queryFn: () => axios.get<Ticket[]>("/api/tickets").then((res) => res.data),
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
        {tickets.map((ticket) => (
          <TableRow key={ticket.id}>
            <TableCell className="font-medium max-w-[300px] truncate">
              {ticket.subject}
            </TableCell>
            <TableCell>
              <div className="text-sm">{ticket.senderName}</div>
              <div className="text-xs text-muted-foreground">{ticket.senderEmail}</div>
            </TableCell>
            <TableCell>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[ticket.status]}`}>
                {ticket.status}
              </span>
            </TableCell>
            <TableCell>
              {ticket.category ? (
                <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                  {categoryLabels[ticket.category] ?? ticket.category}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">-</span>
              )}
            </TableCell>
            <TableCell>
              {ticket.agent ? (
                <span className="text-sm">{ticket.agent.name}</span>
              ) : (
                <span className="text-xs text-muted-foreground">Unassigned</span>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(ticket.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="text-xs">{ticket._count.messages}</span>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

import { Mail, Clock, Bot } from "lucide-react";
import { TicketStatus, TicketCategory } from "core";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusStyles: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  [TicketStatus.RESOLVED]: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  [TicketStatus.CLOSED]: "bg-secondary text-secondary-foreground",
};

function formatDate(date: string) {
  return new Date(date).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

interface Agent {
  id: string;
  name: string;
  email: string;
}

interface TicketSidebarProps {
  status: TicketStatus;
  category: TicketCategory | null;
  assignedTo: string | null;
  senderEmail: string;
  updatedAt: string;
  aiSummary: string | null;
  agents: Agent[];
  onStatusChange: (status: TicketStatus) => void;
  onCategoryChange: (category: TicketCategory | null) => void;
  onAssignChange: (assignedTo: string | null) => void;
  statusPending?: boolean;
  categoryPending?: boolean;
  assignPending?: boolean;
}

export function TicketSidebar({
  status,
  category,
  assignedTo,
  senderEmail,
  updatedAt,
  aiSummary,
  agents,
  onStatusChange,
  onCategoryChange,
  onAssignChange,
  statusPending,
  categoryPending,
  assignPending,
}: TicketSidebarProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label id="status-label" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Status
            </label>
            <Select
              value={status}
              onValueChange={(v) => onStatusChange(v as TicketStatus)}
              disabled={statusPending}
            >
              <SelectTrigger className="h-9" aria-labelledby="status-label">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TicketStatus.OPEN}>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[TicketStatus.OPEN]}`}>Open</span>
                </SelectItem>
                <SelectItem value={TicketStatus.RESOLVED}>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[TicketStatus.RESOLVED]}`}>Resolved</span>
                </SelectItem>
                <SelectItem value={TicketStatus.CLOSED}>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[TicketStatus.CLOSED]}`}>Closed</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label id="category-label" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Category
            </label>
            <Select
              value={category ?? "UNCATEGORIZED"}
              onValueChange={(v) =>
                onCategoryChange(v === "UNCATEGORIZED" ? null : (v as TicketCategory))
              }
              disabled={categoryPending}
            >
              <SelectTrigger className="h-9" aria-labelledby="category-label">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UNCATEGORIZED">Uncategorized</SelectItem>
                <SelectItem value={TicketCategory.GENERAL_QUESTION}>General Question</SelectItem>
                <SelectItem value={TicketCategory.TECHNICAL_QUESTION}>Technical Question</SelectItem>
                <SelectItem value={TicketCategory.REFUND_REQUEST}>Refund Request</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label id="assign-label" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Assigned To
            </label>
            <Select
              value={assignedTo ?? "UNASSIGNED"}
              onValueChange={(v) =>
                onAssignChange(v === "UNASSIGNED" ? null : v)
              }
              disabled={assignPending}
            >
              <SelectTrigger className="h-9" aria-labelledby="assign-label">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Customer
            </label>
            <div className="flex items-center gap-1.5 text-sm">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              {senderEmail}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Last Updated
            </label>
            <div className="flex items-center gap-1.5 text-sm">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              {formatDate(updatedAt)}
            </div>
          </div>
        </CardContent>
      </Card>

      {aiSummary && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-1.5">
              <Bot className="h-3.5 w-3.5 text-violet-500" />
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                AI Summary
              </label>
            </div>
            <p className="text-sm">{aiSummary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

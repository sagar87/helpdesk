import { useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Mail, Clock, User, Bot, Send } from "lucide-react";
import { TicketStatus, TicketCategory } from "core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface Message {
  id: string;
  body: string;
  sender: string;
  isAi: boolean;
  createdAt: string;
}

interface Agent {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

interface TicketDetail {
  id: string;
  subject: string;
  body: string;
  senderEmail: string;
  senderName: string;
  status: TicketStatus;
  category: TicketCategory | null;
  aiSummary: string | null;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  agent: { id: string; name: string; email: string } | null;
  messages: Message[];
}

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

function TicketDetailSkeleton() {
  return (
    <div className="px-6 py-8 max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-8 w-96" />
      <div className="grid grid-cols-[1fr_280px] gap-6">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: ticket, isPending, error } = useQuery({
    queryKey: ["tickets", id],
    queryFn: () =>
      axios.get<TicketDetail>(`/api/tickets/${id}`).then((res) => res.data),
    enabled: !!id,
  });

  const { data: agents } = useQuery({
    queryKey: ["users"],
    queryFn: () => axios.get<Agent[]>("/api/users").then((res) => res.data),
  });

  const activeAgents = agents?.filter((a) => a.active) ?? [];

  function useOptimisticMutation<TVar>(
    mutationFn: (v: TVar) => Promise<unknown>,
    optimisticUpdate: (previous: TicketDetail, v: TVar) => TicketDetail,
  ) {
    return useMutation({
      mutationFn,
      onMutate: async (value: TVar) => {
        await queryClient.cancelQueries({ queryKey: ["tickets", id] });
        const previous = queryClient.getQueryData<TicketDetail>(["tickets", id]);
        if (previous) {
          queryClient.setQueryData<TicketDetail>(["tickets", id], optimisticUpdate(previous, value));
        }
        return { previous };
      },
      onError: (_err: unknown, _vars: TVar, context: { previous?: TicketDetail } | undefined) => {
        if (context?.previous) {
          queryClient.setQueryData(["tickets", id], context.previous);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["tickets", id] });
        queryClient.invalidateQueries({ queryKey: ["tickets"] });
      },
    });
  }

  const assignMutation = useOptimisticMutation(
    (assignedTo: string | null) =>
      axios.patch(`/api/tickets/${id}/assign`, { assignedTo }).then((res) => res.data),
    (prev, assignedTo) => {
      const agent = assignedTo
        ? activeAgents.find((a) => a.id === assignedTo) ?? null
        : null;
      return {
        ...prev,
        assignedTo,
        agent: agent ? { id: agent.id, name: agent.name, email: agent.email } : null,
      };
    },
  );

  const statusMutation = useOptimisticMutation(
    (status: TicketStatus) =>
      axios.patch(`/api/tickets/${id}`, { status }).then((res) => res.data),
    (prev, status) => ({ ...prev, status }),
  );

  const categoryMutation = useOptimisticMutation(
    (category: TicketCategory | null) =>
      axios.patch(`/api/tickets/${id}`, { category }).then((res) => res.data),
    (prev, category) => ({ ...prev, category }),
  );

  const replyRef = useRef<HTMLTextAreaElement>(null);
  const [replyError, setReplyError] = useState("");

  const replyMutation = useMutation({
    mutationFn: (body: string) =>
      axios.post(`/api/tickets/${id}/messages`, { body }).then((res) => res.data),
    onSuccess: () => {
      if (replyRef.current) replyRef.current.value = "";
      setReplyError("");
      queryClient.invalidateQueries({ queryKey: ["tickets", id] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });

  if (isPending) return <TicketDetailSkeleton />;

  if (error) {
    return (
      <div className="px-6 py-8 max-w-4xl mx-auto">
        <Link to="/tickets">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to tickets
          </Button>
        </Link>
        <p className="text-sm text-destructive">
          {axios.isAxiosError(error) && error.response?.status === 404
            ? "Ticket not found."
            : error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto space-y-6">
      <Link to="/tickets">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to tickets
        </Button>
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{ticket.subject}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          From {ticket.senderName} &lt;{ticket.senderEmail}&gt;
          {" "}&middot;{" "}
          {formatDate(ticket.createdAt)}
        </p>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-6">
        {/* Messages */}
        <div className="space-y-4">
          {ticket.messages.map((message) => (
            <Card key={message.id}>
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {message.isAi ? (
                      <>
                        <Bot className="h-4 w-4 text-violet-500" />
                        <span>AI Assistant</span>
                      </>
                    ) : (
                      <>
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{message.sender}</span>
                      </>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(message.createdAt)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <p className="text-sm whitespace-pre-wrap">{message.body}</p>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardContent className="p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const body = replyRef.current?.value.trim();
                  if (!body) {
                    setReplyError("Reply cannot be empty.");
                    return;
                  }
                  setReplyError("");
                  replyMutation.mutate(body);
                }}
              >
                <Textarea
                  ref={replyRef}
                  placeholder="Write a reply..."
                  rows={3}
                  className={`mb-1 resize-none ${replyError ? "border-destructive" : ""}`}
                  disabled={replyMutation.isPending}
                  onChange={() => { if (replyError) setReplyError(""); }}
                />
                {replyError && (
                  <p className="text-xs text-destructive mb-2">{replyError}</p>
                )}
                {!replyError && <div className="mb-2" />}
                <div className="flex items-center justify-between">
                  {replyMutation.isError && (
                    <p className="text-xs text-destructive">
                      Failed to send reply. Please try again.
                    </p>
                  )}
                  <div className="ml-auto">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={replyMutation.isPending}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      {replyMutation.isPending ? "Sending..." : "Send Reply"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label id="status-label" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </label>
                <Select
                  value={ticket.status}
                  onValueChange={(v) => statusMutation.mutate(v as TicketStatus)}
                  disabled={statusMutation.isPending}
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
                  value={ticket.category ?? "UNCATEGORIZED"}
                  onValueChange={(v) =>
                    categoryMutation.mutate(v === "UNCATEGORIZED" ? null : (v as TicketCategory))
                  }
                  disabled={categoryMutation.isPending}
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
                  value={ticket.assignedTo ?? "UNASSIGNED"}
                  onValueChange={(v) =>
                    assignMutation.mutate(v === "UNASSIGNED" ? null : v)
                  }
                  disabled={assignMutation.isPending}
                >
                  <SelectTrigger className="h-9" aria-labelledby="assign-label">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                    {activeAgents.map((agent) => (
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
                  {ticket.senderEmail}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Last Updated
                </label>
                <div className="flex items-center gap-1.5 text-sm">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {formatDate(ticket.updatedAt)}
                </div>
              </div>
            </CardContent>
          </Card>

          {ticket.aiSummary && (
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Bot className="h-3.5 w-3.5 text-violet-500" />
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    AI Summary
                  </label>
                </div>
                <p className="text-sm">{ticket.aiSummary}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

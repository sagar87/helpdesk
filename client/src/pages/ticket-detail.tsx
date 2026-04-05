import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { TicketStatus, TicketCategory } from "core";
import type { Agent, TicketDetail } from "@/types";
import { MessageCard } from "@/components/message-card";
import { ReplyForm } from "@/components/reply-form";
import { TicketHeader } from "@/components/ticket-header";
import { TicketSidebar } from "@/components/ticket-sidebar";
import { TicketDetailSkeleton } from "@/components/ticket-detail-skeleton";
import { Button } from "@/components/ui/button";

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

  const [replyResetKey, setReplyResetKey] = useState(0);

  const replyMutation = useMutation({
    mutationFn: (body: string) =>
      axios.post(`/api/tickets/${id}/messages`, { body }).then((res) => res.data),
    onSuccess: () => {
      setReplyResetKey((k) => k + 1);
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

      <TicketHeader
        subject={ticket.subject}
        senderName={ticket.senderName}
        senderEmail={ticket.senderEmail}
        createdAt={ticket.createdAt}
      />

      <div className="grid grid-cols-[1fr_280px] gap-6">
        {/* Messages */}
        <div className="space-y-4">
          {ticket.messages.map((message) => (
            <MessageCard
              key={message.id}
              sender={message.sender}
              body={message.body}
              isAi={message.isAi}
              createdAt={message.createdAt}
            />
          ))}

          <ReplyForm
            ticketId={id!}
            onSubmit={(body) => replyMutation.mutate(body)}
            isPending={replyMutation.isPending}
            isError={replyMutation.isError}
            resetKey={replyResetKey}
          />
        </div>

        {/* Sidebar */}
        <TicketSidebar
          status={ticket.status}
          category={ticket.category}
          assignedTo={ticket.assignedTo}
          senderEmail={ticket.senderEmail}
          updatedAt={ticket.updatedAt}
          aiSummary={ticket.aiSummary}
          agents={activeAgents}
          onStatusChange={(s) => statusMutation.mutate(s)}
          onCategoryChange={(c) => categoryMutation.mutate(c)}
          onAssignChange={(a) => assignMutation.mutate(a)}
          statusPending={statusMutation.isPending}
          categoryPending={categoryMutation.isPending}
          assignPending={assignMutation.isPending}
        />
      </div>
    </div>
  );
}

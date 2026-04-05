import { boss } from "../lib/queue";
import { autoResolveTicket } from "../services/ticket.service";
import type { Ticket } from "../generated/prisma/client";

export const AUTO_RESOLVE_QUEUE = "ticket-auto-resolve";

export async function startAutoResolveWorker() {
  await boss.createQueue(AUTO_RESOLVE_QUEUE);
  await boss.work(AUTO_RESOLVE_QUEUE, async (jobs) => {
    const job = jobs[0];
    if (!job) return;
    await autoResolveTicket(job.data as Ticket);
  });
}

export async function enqueueAutoResolve(ticket: Ticket) {
  await boss.send(AUTO_RESOLVE_QUEUE, ticket as unknown as Record<string, unknown>);
}

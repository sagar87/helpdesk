import { boss } from "../lib/queue";
import { classifyTicket } from "../services/ticket.service";
import type { Ticket } from "../generated/prisma/client";

export const CLASSIFY_QUEUE = "ticket-classify";

export async function startClassifyWorker() {
  await boss.createQueue(CLASSIFY_QUEUE);
  await boss.work(CLASSIFY_QUEUE, async (jobs) => {
    const job = jobs[0];
    if (!job) return;
    await classifyTicket(job.data as Ticket);
  });
}

export async function enqueueClassifyTicket(ticket: Ticket) {
  await boss.send(CLASSIFY_QUEUE, ticket as unknown as Record<string, unknown>);
}

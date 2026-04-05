import { Router, type Request } from "express";
import { z } from "zod/v4";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { db } from "../lib/db";
import { validate } from "../middleware/validate";

const assignTicketSchema = z.object({
  assignedTo: z.string().min(1).nullable(),
});

const updateTicketSchema = z.object({
  status: z.enum(["OPEN", "RESOLVED", "CLOSED"]).optional(),
  category: z.enum(["GENERAL_QUESTION", "TECHNICAL_QUESTION", "REFUND_REQUEST"]).nullable().optional(),
});

const router = Router();

router.get("/stats", async (_req, res) => {
  const [total, open, resolved, closed, autoResolved] = await Promise.all([
    db.ticket.count(),
    db.ticket.count({ where: { status: "OPEN" } }),
    db.ticket.count({ where: { status: "RESOLVED" } }),
    db.ticket.count({ where: { status: "CLOSED" } }),
    db.ticket.count({ where: { autoResolved: true } }),
  ]);
  res.json({ total, open, resolved, closed, autoResolved });
});

router.get("/stats/daily", async (_req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const tickets = await db.ticket.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
  });

  const counts: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i);
    counts[d.toISOString().slice(0, 10)] = 0;
  }
  for (const t of tickets) {
    const key = t.createdAt.toISOString().slice(0, 10);
    if (key in counts) counts[key]++;
  }

  const daily = Object.entries(counts).map(([date, count]) => ({ date, count }));
  res.json(daily);
});

router.get("/", async (_req, res) => {
  const tickets = await db.ticket.findMany({
    select: {
      id: true,
      subject: true,
      senderEmail: true,
      senderName: true,
      status: true,
      category: true,
      assignedTo: true,
      createdAt: true,
      agent: {
        select: { id: true, name: true },
      },
      _count: {
        select: { messages: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(tickets);
});

router.get("/:id", async (req: Request<{ id: string }>, res) => {
  const ticket = await db.ticket.findUnique({
    where: { id: req.params.id },
    include: {
      agent: { select: { id: true, name: true, email: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  res.json(ticket);
});

router.patch("/:id", validate(updateTicketSchema), async (req: Request<{ id: string }>, res) => {
  const ticket = await db.ticket.findUnique({ where: { id: req.params.id } });
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  const updated = await db.ticket.update({
    where: { id: req.params.id },
    data: req.body,
    include: {
      agent: { select: { id: true, name: true, email: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  res.json(updated);
});

const createMessageSchema = z.object({
  body: z.string().trim().min(1, "Message body is required"),
});

router.post("/:id/messages", validate(createMessageSchema), async (req: Request<{ id: string }>, res) => {
  const ticket = await db.ticket.findUnique({ where: { id: req.params.id } });
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  const message = await db.message.create({
    data: {
      ticketId: req.params.id,
      body: req.body.body,
      sender: req.user!.email,
    },
  });

  // Reopen the ticket if it was resolved or closed
  if (ticket.status !== "OPEN") {
    await db.ticket.update({
      where: { id: req.params.id },
      data: { status: "OPEN" },
    });
  }

  res.status(201).json(message);
});

router.patch("/:id/assign", validate(assignTicketSchema), async (req: Request<{ id: string }>, res) => {
  const { assignedTo } = req.body;

  const ticket = await db.ticket.findUnique({ where: { id: req.params.id } });
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  if (assignedTo) {
    const agent = await db.user.findUnique({ where: { id: assignedTo } });
    if (!agent || !agent.active) {
      res.status(400).json({ error: "Agent not found or inactive" });
      return;
    }
  }

  const updated = await db.ticket.update({
    where: { id: req.params.id },
    data: { assignedTo },
    include: {
      agent: { select: { id: true, name: true, email: true } },
    },
  });

  res.json(updated);
});

const polishMessageSchema = z.object({
  body: z.string().trim().min(1, "Message body is required"),
});

router.post("/:id/polish", validate(polishMessageSchema), async (req: Request<{ id: string }>, res) => {
  const ticket = await db.ticket.findUnique({
    where: { id: req.params.id },
    include: { messages: { orderBy: { createdAt: "desc" }, take: 5 } },
  });
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  const conversationContext = ticket.messages
    .reverse()
    .map((m) => `[${m.sender}]: ${m.body}`)
    .join("\n");

  const { text } = await generateText({
    model: openai("gpt-5-nano"),
    system:
      "You are a helpdesk agent. Polish the following reply to be professional, clear, and helpful. Keep the same meaning and intent. Address the customer by name and sign off with the agent's name. Return only the polished text with no extra commentary.",
    prompt: `Ticket subject: ${ticket.subject}\n\nCustomer name: ${ticket.senderName}\nAgent name: ${req.user!.name}\n\nRecent conversation:\n${conversationContext}\n\nDraft reply to polish:\n${req.body.body}`,
  });

  res.json({ polished: text });
});

router.post("/:id/summarize", async (req: Request<{ id: string }>, res) => {
  const ticket = await db.ticket.findUnique({
    where: { id: req.params.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  const conversation = ticket.messages
    .map((m) => `[${m.sender}]: ${m.body}`)
    .join("\n");

  const { text } = await generateText({
    model: openai("gpt-5-nano"),
    system:
      "You are a helpdesk assistant. Summarize the following support ticket and its conversation history in 2-3 concise sentences. Focus on the customer's issue, any actions taken, and the current state. Return only the summary.",
    prompt: `Subject: ${ticket.subject}\nCustomer: ${ticket.senderName} (${ticket.senderEmail})\nStatus: ${ticket.status}\n\nConversation:\n${conversation}`,
  });

  const updated = await db.ticket.update({
    where: { id: req.params.id },
    data: { aiSummary: text },
    include: {
      agent: { select: { id: true, name: true, email: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  res.json(updated);
});

export default router;

import { Router, type Request } from "express";
import { z } from "zod/v4";
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

export default router;

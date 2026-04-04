import { Router, type Request } from "express";
import { db } from "../lib/db";

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

export default router;

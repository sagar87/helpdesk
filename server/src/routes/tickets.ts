import { Router } from "express";
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

export default router;

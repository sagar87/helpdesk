import { Router, type Request, type Response } from "express";
import { inboundEmailSchema } from "core";
import { webhookAuth } from "../middleware/webhook-auth";
import { validate } from "../middleware/validate";
import {
  createTicket,
  addMessageToTicket,
  findTicketById,
  classifyTicket,
} from "../services/ticket.service";

const router = Router();

router.post(
  "/email/inbound",
  webhookAuth,
  validate(inboundEmailSchema),
  async (req: Request, res: Response) => {
    const { from, fromName, subject, body, inReplyToTicketId } = req.body;

    if (inReplyToTicketId) {
      const existing = await findTicketById(inReplyToTicketId);
      if (existing) {
        const message = await addMessageToTicket(inReplyToTicketId, {
          body,
          sender: from,
        });
        res.json({ received: true, ticketId: existing.id, messageId: message.id });
        return;
      }
    }

    const ticket = await createTicket({
      subject,
      body,
      senderEmail: from,
      senderName: fromName ?? from,
    });

    // Fire-and-forget: classify in the background
    classifyTicket(ticket);

    res.status(201).json({ received: true, ticketId: ticket.id });
  },
);

export default router;

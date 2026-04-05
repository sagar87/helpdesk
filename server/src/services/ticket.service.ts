import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import type { Ticket } from "../generated/prisma/client";
import { db } from "../lib/db";

export async function createTicket(data: {
  subject: string;
  body: string;
  senderEmail: string;
  senderName: string;
}) {
  return db.ticket.create({
    data: {
      subject: data.subject,
      body: data.body,
      senderEmail: data.senderEmail,
      senderName: data.senderName,
      messages: {
        create: {
          body: data.body,
          sender: data.senderEmail,
        },
      },
    },
    include: { messages: true },
  });
}

export async function addMessageToTicket(
  ticketId: string,
  data: { body: string; sender: string },
) {
  const [message] = await db.$transaction([
    db.message.create({
      data: {
        ticketId,
        body: data.body,
        sender: data.sender,
      },
    }),
    db.ticket.update({
      where: { id: ticketId },
      data: { status: "OPEN" },
    }),
  ]);

  return message;
}

export async function findTicketById(ticketId: string) {
  return db.ticket.findUnique({ where: { id: ticketId } });
}

const VALID_CATEGORIES = ["GENERAL_QUESTION", "TECHNICAL_QUESTION", "REFUND_REQUEST"] as const;

export async function classifyTicket(ticket: Ticket) {
  try {
    const { text } = await generateText({
      model: openai("gpt-5-nano"),
      system: `You are a support ticket classifier. Classify the ticket into exactly one of these categories: GENERAL_QUESTION, TECHNICAL_QUESTION, REFUND_REQUEST. Return only the category name, nothing else.`,
      prompt: `Subject: ${ticket.subject}\n\nBody: ${ticket.body}`,
    });

    const category = text.trim() as (typeof VALID_CATEGORIES)[number];
    if (!VALID_CATEGORIES.includes(category)) return;

    await db.ticket.update({
      where: { id: ticket.id },
      data: { category },
    });
  } catch (err) {
    console.error(`Failed to classify ticket ${ticket.id}:`, err);
  }
}

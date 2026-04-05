import { readFileSync } from "fs";
import { join } from "path";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import type { Ticket } from "../generated/prisma/client";
import { db } from "../lib/db";
import { Sentry } from "../lib/sentry";

const knowledgeBase = readFileSync(join(__dirname, "../../knowledge-base.md"), "utf-8");

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
    Sentry.captureException(err, { tags: { ticketId: ticket.id, operation: "classify" } });
  }
}

export async function autoResolveTicket(ticket: Ticket) {
  try {
    const { text } = await generateText({
      model: openai("gpt-5-nano"),
      system: `You are a helpful support agent. Answer the customer's question using ONLY the following knowledge base. If the knowledge base does not contain enough information to answer confidently, respond with exactly CANNOT_RESOLVE and nothing else. Otherwise, provide a helpful, professional answer addressed to the customer by name.\n\n---\n${knowledgeBase}`,
      prompt: `Customer name: ${ticket.senderName}\nSubject: ${ticket.subject}\n\nMessage: ${ticket.body}`,
    });

    const trimmed = text.trim();
    if (trimmed === "CANNOT_RESOLVE") return;

    await db.$transaction([
      db.message.create({
        data: {
          ticketId: ticket.id,
          body: trimmed,
          sender: "AI Assistant",
          isAi: true,
        },
      }),
      db.ticket.update({
        where: { id: ticket.id },
        data: { status: "RESOLVED", autoResolved: true },
      }),
    ]);
  } catch (err) {
    Sentry.captureException(err, { tags: { ticketId: ticket.id, operation: "auto-resolve" } });
  }
}

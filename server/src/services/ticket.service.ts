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

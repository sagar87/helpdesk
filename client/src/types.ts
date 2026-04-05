import type { TicketStatus, TicketCategory } from "core";

export interface Message {
  id: string;
  body: string;
  sender: string;
  isAi: boolean;
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export interface TicketDetail {
  id: string;
  subject: string;
  body: string;
  senderEmail: string;
  senderName: string;
  status: TicketStatus;
  category: TicketCategory | null;
  aiSummary: string | null;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  agent: { id: string; name: string; email: string } | null;
  messages: Message[];
}

export interface TicketSummary {
  id: string;
  subject: string;
  senderEmail: string;
  senderName: string;
  status: TicketStatus;
  category: TicketCategory | null;
  assignedTo: string | null;
  createdAt: string;
  agent: { id: string; name: string } | null;
  _count: { messages: number };
}

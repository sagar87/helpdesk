import { z } from "zod/v4";

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").pipe(z.email("Enter a valid email address")),
  password: z.string().trim().min(1, "Password is required").min(12, "Password must be at least 12 characters"),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").pipe(z.email("Enter a valid email address")),
  password: z.union([
    z.literal(""),
    z.string().trim().min(12, "Password must be at least 12 characters"),
  ]),
});

export const inboundEmailSchema = z.object({
  from: z.string().min(1, "Sender email is required").pipe(z.email("Invalid sender email")),
  fromName: z.string().trim().min(1).optional(),
  subject: z.string().trim().min(1, "Subject is required").max(500),
  body: z.string().trim().min(1, "Body is required"),
  inReplyToTicketId: z.string().uuid().optional(),
});

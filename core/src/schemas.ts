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

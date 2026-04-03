import "./env";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
  },
  disabledPaths: ["/sign-up/email"],
  trustedOrigins: process.env.TRUSTED_ORIGINS?.split(",").filter(Boolean) ?? ["http://localhost:5173"],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
  user: {
    additionalFields: {
      role: {
        type: ["ADMIN", "AGENT"],
        required: false,
        defaultValue: "AGENT",
      },
      active: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: false,
      },
    },
  },
});

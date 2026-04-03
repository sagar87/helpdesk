import { Router } from "express";
import { createUserSchema } from "core";
import { db } from "../lib/db";
import { auth } from "../lib/auth";
import { Role } from "../generated/prisma/enums";

const router = Router();

router.get("/", async (_req, res) => {
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(users);
});

router.post("/", async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }

  const { name, email, password } = parsed.data;

  const result = await auth.api.signUpEmail({
    body: { email, password, name, role: Role.AGENT },
  });

  if (!result.user) {
    res.status(400).json({ error: "Failed to create user" });
    return;
  }

  const user = await db.user.findUnique({
    where: { id: result.user.id },
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
  });

  res.status(201).json(user);
});

export default router;

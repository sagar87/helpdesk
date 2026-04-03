import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod/v4";
import { createUserSchema, updateUserSchema } from "core";
import { hashPassword } from "better-auth/crypto";
import { db } from "../lib/db";
import { auth } from "../lib/auth";
import { Role } from "../generated/prisma/enums";

function validate(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
      return;
    }
    req.body = parsed.data;
    next();
  };
}

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

router.post("/", validate(createUserSchema), async (req, res) => {
  const { name, email, password } = req.body;

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

const userSelect = { id: true, name: true, email: true, role: true, active: true, createdAt: true } as const;

router.put("/:id", validate(updateUserSchema), async (req: Request<{ id: string }>, res) => {
  const { name, email, password } = req.body;
  const { id } = req.params;

  const existing = await db.user.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const user = await db.user.update({
    where: { id },
    data: { name, email },
    select: userSelect,
  });

  if (password) {
    const hashed = await hashPassword(password);
    await db.account.updateMany({
      where: { userId: id, providerId: "credential" },
      data: { password: hashed },
    });
  }

  res.json(user);
});

export default router;

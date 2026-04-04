import type { Request, Response, NextFunction } from "express";
import { z } from "zod/v4";

export function validate(schema: z.ZodType) {
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

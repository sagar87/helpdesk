import type { Request, Response, NextFunction } from "express";

export function webhookAuth(req: Request, res: Response, next: NextFunction) {
  const token = process.env.INBOUND_EMAIL_WEBHOOK_AUTH_TOKEN;
  if (!token) {
    res.status(500).json({ error: "Webhook auth not configured" });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${token}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}

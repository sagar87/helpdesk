import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { toNodeHandler, fromNodeHeaders } from "better-auth/node";
import { db } from "./lib/db";
import { auth } from "./lib/auth";
import usersRouter from "./routes/users";
import webhooksRouter from "./routes/webhooks";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());

app.use(cors({
  origin: process.env.TRUSTED_ORIGINS?.split(",").filter(Boolean) ?? ["http://localhost:5173"],
  credentials: true,
}));

// Rate limit auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX ?? 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts, please try again later" },
});
app.use("/api/auth/sign-in", authLimiter);

// Better Auth handler must be mounted before express.json()
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json({ limit: "50kb" }));

// --- Auth middleware ---

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || !user.active) {
    res.status(401).json({ error: "Account deactivated" });
    return;
  }

  req.user = user;
  next();
}

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "ADMIN") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}

// --- Routes ---

app.get("/api/me", requireAuth, (req, res) => {
  const { id, email, name, role, active, emailVerified, image, createdAt } = req.user!;
  res.json({ id, email, name, role, active, emailVerified, image, createdAt });
});

app.use("/api/users", requireAuth, requireAdmin, usersRouter);

const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/webhooks", webhookLimiter, webhooksRouter);

app.get("/api/health", async (_req, res) => {
  try {
    await db.$queryRaw`SELECT 1`;
    res.json({ status: "ok" });
  } catch {
    res.status(500).json({ status: "error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

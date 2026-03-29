import "dotenv/config";
import express from "express";
import cors from "cors";
import { toNodeHandler, fromNodeHeaders } from "better-auth/node";
import { db } from "./lib/db";
import { auth } from "./lib/auth";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Better Auth handler must be mounted before express.json()
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.get("/api/me", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json(session.user);
});

app.get("/api/health", async (_req, res) => {
  try {
    await db.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected" });
  } catch (e) {
    console.error("DB health check failed:", e);
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

---
name: E2E test infrastructure
description: Playwright config, server setup, test database, seeding, and base URL for the helpdesk project
type: project
---

**Test runner:** `bun run test:e2e` from project root (runs `bunx playwright test`).

**Base URL:** `http://localhost:5174` (Vite dev server, configured via `VITE_PORT=5174`).

**Backend test URL:** `http://localhost:3001` — server started with `DATABASE_URL=postgresql://postgres:password@localhost:5432/helpdesk_test`.

**Playwright config:** `/Users/sagar/Documents/opt/helpdesk/playwright.config.ts`
- `globalSetup: "./e2e/global-setup.ts"` — creates `helpdesk_test` DB, runs Prisma migrations, seeds admin and agent users.
- `globalTeardown: "./e2e/global-teardown.ts"` — drops `helpdesk_test` DB.
- `reuseExistingServer: !process.env.CI` — reuses running servers locally, requires fresh start on CI.
- Health check URL: `http://localhost:3001/api/health` (returns 200 `{"status":"ok"}` when DB is reachable, 500 otherwise).

**Seeded test users:**
- Admin: `admin@test.com` / `testpassword12` — seeded via `server/src/seed.ts`, role set to ADMIN.
- Agent: `agent@test.com` / `testpassword12` — seeded via `server/src/seed-agent.ts`, role stays AGENT (the default).

**Password policy:** Better Auth requires minimum 12 characters (configured in `server/src/lib/auth.ts`).

**Why:** The health endpoint does `SELECT 1` and 500s if the DB doesn't exist. Playwright's `globalSetup` runs before webServers, so the DB exists by the time the server starts — but a prior `globalTeardown` drop means the first-ever run on a fresh environment needs setup to complete before health checks pass.

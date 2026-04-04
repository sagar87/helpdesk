# Helpdesk - AI-Powered Ticket Management System

## Project Structure
- `/core` — Shared code (validation schemas, types) used by both client and server
- `/client` — React + Vite + Tailwind CSS v4 + shadcn/ui
- `/server` — Express.js + TypeScript + Prisma ORM + PostgreSQL

## Tech Stack
- **Runtime:** Bun
- **Frontend:** React, TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend:** Express.js, TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** Database-backed sessions
- **Validation:** Zod v4 — use for both client and server input validation (`import { z } from "zod/v4"`)
- **Forms:** React Hook Form with `zodResolver` — use `useForm` + `register` for all forms, validate with Zod schemas via `@hookform/resolvers/zod`
- **AI:** Claude API

## Commands
- `bun run dev` — run both client and server
- `bun run dev:client` — run client only (Vite on port 5173)
- `bun run dev:server` — run server only (Express on port 3000)
- `bun run test:e2e` — run Playwright end-to-end tests
- `bunx prisma migrate dev` — run database migrations (from /server)
- `bunx prisma generate` — regenerate Prisma client (from /server)

## Documentation
- Always use context7 MCP tools (`resolve-library-id` then `query-docs`) to fetch up-to-date documentation for libraries before writing code. This includes Express, React, Prisma, Tailwind, shadcn/ui, and any other dependencies.

## Authentication
- **Library:** Better Auth v1 — server at `server/src/lib/auth.ts`, client at `client/src/lib/auth-client.ts`
- **Adapter:** Prisma + PostgreSQL (User, Session, Account, Verification models)
- **Method:** Email/password only; sign-up via `/sign-up/email` is **disabled** — agents are created by admins
- **Session:** 7-day expiry, cookie-based (Better Auth handles storage automatically)
- **Roles:** `role` field on User model — `ADMIN` or `AGENT` (default `AGENT`); `active` boolean field also on User
- **Express:** Auth handler mounted at `/api/auth/*`; session retrieved via `auth.api.getSession()` from request headers
- **Client usage:** `authClient.signIn.email()` to log in, `authClient.useSession()` hook to read session, `authClient.signOut()` to log out
- **Protected routes:** Layout component checks `useSession()` and redirects to `/login` if no session
- **Env vars:** `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (server origin), `TRUSTED_ORIGINS` (comma-separated allowed CORS origins)

## Role-Based Access
- Roles: `ADMIN` and `AGENT` (stored as `role` field on the User model, default `AGENT`)
- **Client route guard:** Wrap admin-only routes with `<AdminRoute />` (`client/src/components/admin-route.tsx`) — reads role from `useSession()`, redirects to `/` if not `ADMIN`
- **Navbar:** Conditionally render admin-only links by checking `(session.user as { role?: string }).role === "ADMIN"` in `layout.tsx`
- **Server middleware:** `requireAuth` (validates session + checks `active` field) and `requireAdmin` (checks `role === "ADMIN"`) in `server/src/index.ts` — apply to all protected API routes
- The role field is not typed by default in the Better Auth client — cast with `(session.user as { role?: string })` on the client side

## UI
- shadcn/ui style: `"default"` (Radix UI primitives) — run `bunx shadcn@latest add <component>` from `/client` to add components
- Theme: shadcn default neutral, defined as CSS variables in `client/src/index.css` (light + dark via oklch, mapped to Tailwind v4 with `@theme inline`)
- Always use theme tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, `text-destructive`, etc.) — never hardcode colors
- Installed components: button, input, label, card

## Email-to-Ticket Ingestion
- **Webhook endpoint:** `POST /api/webhooks/email/inbound` — receives JSON `{ from, fromName?, subject, body, inReplyToTicketId? }`
- **Auth:** Bearer token via `Authorization` header, validated against `INBOUND_EMAIL_WEBHOOK_AUTH_TOKEN` env var
- **Rate limiting:** 60 requests per minute on `/api/webhooks`
- **Threading:** If `inReplyToTicketId` is provided and the ticket exists, a message is appended (and ticket reopened if resolved/closed); otherwise a new ticket is created
- **Ticket service:** Reusable functions in `server/src/services/ticket.service.ts` — `createTicket()`, `addMessageToTicket()`, `findTicketById()`
- **Provider-agnostic:** No email provider integrated yet — wire any provider (SendGrid, Postmark, etc.) to POST to this endpoint

## Security
- **Helmet:** Sets security headers (CSP, X-Frame-Options, HSTS, etc.)
- **CORS:** Restricted to `TRUSTED_ORIGINS` with `credentials: true`
- **Rate limiting:** Auth sign-in endpoint limited to 10 attempts per 15 minutes per IP; webhook endpoint limited to 60 per minute
- **Body size:** `express.json({ limit: "50kb" })`
- **`/api/me`:** Explicitly picks fields to return — never exposes raw session object
- **Min password length:** 12 characters

## Component & Unit Tests
- **Framework:** Vitest + React Testing Library — config at `client/vitest.config.ts`
- **Run:** `bun run test` (single run) or `bun run test:watch` (watch mode)
- **Setup file:** `client/src/test/setup.ts` (loads `@testing-library/jest-dom` matchers)
- **Test helper:** Use `renderWithQuery` from `@/test/render` to wrap components that use TanStack Query
- Place test files next to the component: `component.test.tsx` alongside `component.tsx`
- Mock axios with `vi.mock("axios")` for API calls — never hit real endpoints in component tests
- Test loading states (skeletons), error states, and rendered data
- After implementing a new component or page, proactively write component tests

## E2E Testing
- **Framework:** Playwright — run with `bun run test:e2e`
- **Agent:** Always use the `e2e-test-writer` agent to write or update e2e tests — it has the full testing infrastructure context (DB setup, ports, global setup/teardown, conventions)
- After implementing a new page or user flow, proactively use the `e2e-test-writer` agent to add test coverage

## Data Fetching
- Use **axios** for all HTTP requests — never use raw `fetch`
- Use **TanStack Query** (`@tanstack/react-query`) for server state — `QueryClientProvider` is set up in `main.tsx`
- Pattern: `useQuery({ queryKey: ["resource"], queryFn: () => axios.get<T>("/api/resource").then(res => res.data) })`
- For mutations use `useMutation` with `queryClient.invalidateQueries` to refresh related queries

## Conventions
- Client proxies `/api` requests to the server via Vite config (`VITE_API_URL` overrides the target)
- Prisma schema lives at `/server/prisma/schema.prisma`
- shadcn/ui components are in `/client/src/components/ui/`
- Use `@/` import alias in the client (maps to `/client/src/`)
- Shared validation schemas and types live in `/core` — import via `"core"` (workspace package). Place schemas that are used by both client and server here to avoid duplication.
- Do not wrap Express route handlers in try/catch — let errors propagate to the error handler
- **Validation middleware:** Use `validate()` from `server/src/middleware/validate.ts` for Zod request body validation in all Express routes — do not duplicate this function in route files

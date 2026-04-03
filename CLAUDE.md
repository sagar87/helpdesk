# Helpdesk - AI-Powered Ticket Management System

## Project Structure
- `/client` — React + Vite + Tailwind CSS v4 + shadcn/ui
- `/server` — Express.js + TypeScript + Prisma ORM + PostgreSQL

## Tech Stack
- **Runtime:** Bun
- **Frontend:** React, TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend:** Express.js, TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** Database-backed sessions
- **AI:** Claude API

## Commands
- `bun run dev` — run both client and server
- `bun run dev:client` — run client only (Vite on port 5173)
- `bun run dev:server` — run server only (Express on port 3000)
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
- **Server:** Check role on protected API endpoints via the session returned by `auth.api.getSession()`
- The role field is not typed by default in the Better Auth client — cast with `(session.user as { role?: string })` on the client side

## UI
- shadcn/ui style: `"default"` (Radix UI primitives) — run `bunx shadcn@latest add <component>` from `/client` to add components
- Theme: shadcn default neutral, defined as CSS variables in `client/src/index.css` (light + dark via oklch, mapped to Tailwind v4 with `@theme inline`)
- Always use theme tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, `text-destructive`, etc.) — never hardcode colors
- Installed components: button, input, label, card

## Conventions
- Client proxies `/api` requests to the server via Vite config
- Prisma schema lives at `/server/prisma/schema.prisma`
- shadcn/ui components are in `/client/src/components/ui/`
- Use `@/` import alias in the client (maps to `/client/src/`)

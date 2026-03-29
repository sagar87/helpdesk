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

## Conventions
- Client proxies `/api` requests to the server via Vite config
- Prisma schema lives at `/server/prisma/schema.prisma`
- shadcn/ui components are in `/client/src/components/ui/`
- Use `@/` import alias in the client (maps to `/client/src/`)

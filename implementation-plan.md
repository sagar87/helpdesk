# Implementation Plan

## Phase 1: Project Setup & Foundation
1. Initialize monorepo structure (`/client`, `/server`)
2. Set up Express server with TypeScript
3. Set up React app with TypeScript
4. Configure Prisma with PostgreSQL connection

## Phase 2: Authentication
7. Build session-based auth middleware (create/validate/destroy sessions)
8. Build login API endpoint
9. Build login page in React
10. Add protected route wrapper on the frontend
11. Add role-based access control middleware (admin vs agent)

## Phase 3: User Management (Admin)
12. Build CRUD API endpoints for managing agents (create, list, update, delete)
13. Build user management page (admin-only) — list agents, create new agent form
14. Add ability for admin to deactivate/reactivate agents

## Phase 4: Ticket CRUD & Core UI
15. Build API endpoints for tickets (create, list, get, update status)
16. Build ticket list page with table view
17. Add filtering by status and category
18. Add sorting (date, status, category)
19. Build ticket detail page (view ticket info, status, conversation history)
20. Build manual ticket creation form (for testing before email ingestion)

## Phase 5: Ticket Workflow
21. Add status transition logic (open → resolved → closed)
22. Add agent assignment to tickets
23. Build reply/response functionality — agent can write and send a reply
24. Store conversation thread (original message + replies) on the ticket

## Phase 6: AI Features
25. Integrate Claude API — set up client and base prompt structure
26. AI classification — auto-categorize new tickets into one of three categories
27. AI summary — generate a short summary for each ticket
28. AI suggested replies — generate a draft reply an agent can edit and send
29. Display AI outputs in the ticket detail view (category tag, summary, suggested reply)
30. Allow agent to accept, edit, or discard AI suggestions

## Phase 7: Email Ingestion & Responses
31. Choose and configure email provider (SendGrid/Resend)
32. Build inbound email webhook endpoint — parse incoming emails into tickets
33. Build outbound email sending — send agent/AI replies back to the student
34. Handle email threading (match replies to existing tickets)

## Phase 8: Dashboard
35. Build dashboard page with ticket overview stats (open, resolved, closed counts)
36. Add breakdown by category
37. Add recent tickets list / activity feed

## Phase 9: Polish & Hardening
38. Add input validation and error handling across API endpoints
39. Add loading states, empty states, and error states in the UI
40. Add pagination to ticket list
41. Test end-to-end flows (email in → ticket created → AI classifies → agent replies → email out)
42. Environment config and deployment setup

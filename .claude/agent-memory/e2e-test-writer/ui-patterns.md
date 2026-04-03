---
name: UI patterns and locators
description: Key UI structure details, locators, and component patterns discovered in the helpdesk React app
type: project
---

**Logout button:** Has no text label — renders only a `LogOut` lucide-react icon. Located in the sticky `<header>`. Best locator: `page.locator("header button")` (it's the sole button in the header).

**Users NavLink:** Plain text "Users" rendered as a `<a>` tag via React Router `NavLink`. Only visible in the navbar when the logged-in user has role ADMIN. Locator: `page.getByRole("link", { name: "Users" })`.

**Users page heading:** The `/users` page has a real `<h1>` with text "Users" — use `page.getByRole("heading", { name: "Users" })`.

**Login form fields:** `page.getByLabel("Email")` and `page.getByLabel("Password")` — labels use `htmlFor` matching the input `id`. Submit button: `page.getByRole("button", { name: "Sign in" })`.

**shadcn CardTitle:** Renders as a `<div>` not a heading — use `page.getByText()` for card titles, NOT `page.getByRole("heading")`.

**Session loading:** Layout shows a "Loading..." text while `authClient.useSession()` is pending. Protected routes redirect to `/login` when session is null. Admin-only routes (wrapped in `AdminRoute`) redirect to `/` when role is not ADMIN.

**Auth flow:** After successful login `navigate("/")` is called. After logout `window.location.href = "/login"` is used (full page navigation, not React Router).

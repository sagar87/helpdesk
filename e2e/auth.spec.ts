import { test, expect, Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function loginAs(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/", { timeout: 10_000 });
}

async function loginAsAdmin(page: Page): Promise<void> {
  await loginAs(page, "admin@test.com", "testpassword12");
}

async function loginAsAgent(page: Page): Promise<void> {
  await loginAs(page, "agent@test.com", "testpassword12");
}

// The logout button has no text label — it renders only a LogOut icon.
// It is the sole <button> inside the sticky header.
function logoutButton(page: Page) {
  return page.locator("header button");
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe("Authentication", () => {
  test("session persists after a full page reload", async ({ page }) => {
    await loginAsAdmin(page);

    // Reload and confirm we stay on / (not redirected to /login)
    await page.reload();
    await expect(page).toHaveURL("/", { timeout: 10_000 });
    await expect(page.getByText("Dashboard")).toBeVisible();
  });

  test("logout clears session and redirects to /login", async ({ page }) => {
    await loginAsAdmin(page);

    await logoutButton(page).click();
    await expect(page).toHaveURL("/login", { timeout: 10_000 });

    // Navigating to the protected home route must redirect back to /login
    await page.goto("/");
    await expect(page).toHaveURL("/login", { timeout: 10_000 });
  });

  test.describe("Admin role", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
    });

    test("admin sees the Users link in the navbar", async ({ page }) => {
      await expect(page.getByRole("link", { name: "Users" })).toBeVisible();
    });

    test("admin can access /users page", async ({ page }) => {
      await page.goto("/users");
      await expect(page.getByRole("heading", { name: "Users" })).toBeVisible({
        timeout: 10_000,
      });
    });
  });

  test.describe("Agent role", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAgent(page);
    });

    test("agent does not see the Users link in the navbar", async ({
      page,
    }) => {
      await expect(page.getByRole("link", { name: "Users" })).not.toBeVisible();
    });

    test("agent navigating to /users is redirected to /", async ({ page }) => {
      await page.goto("/users");
      await expect(page).toHaveURL("/", { timeout: 10_000 });
    });
  });

  test("unauthenticated user navigating to /users is redirected to /login", async ({
    page,
  }) => {
    // Visit the protected page without any session
    await page.goto("/users");
    await expect(page).toHaveURL("/login", { timeout: 10_000 });
  });
});

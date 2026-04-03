import { test, expect } from "@playwright/test";

test.describe("Login", () => {
  test("shows the login form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Sign in", { exact: true }).first()).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("shows validation errors for empty fields", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Invalid email address")).toBeVisible();
    await expect(page.getByText("Password must be at least")).toBeVisible();
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("wrong@example.com");
    await page.getByLabel("Password").fill("wrongpassword1");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText(/invalid|error/i)).toBeVisible({ timeout: 5000 });
  });

  test("logs in with valid admin credentials and redirects to home", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@test.com");
    await page.getByLabel("Password").fill("testpassword12");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL("/", { timeout: 5000 });
    await expect(page.getByText("Dashboard")).toBeVisible();
  });

  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/login");
  });
});

import { test, expect, type Page } from "@playwright/test";

async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@test.com");
  await page.getByLabel("Password").fill("testpassword12");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/", { timeout: 10_000 });
}

test.describe("User Management", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/users");
    await expect(page.getByRole("heading", { name: "Users" })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("displays the user table with seeded users", async ({ page }) => {
    await expect(page.getByText("admin@test.com")).toBeVisible();
    await expect(page.getByText("agent@test.com")).toBeVisible();
  });

  test("creates a new user", async ({ page }) => {
    await page.getByRole("button", { name: "Create User" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByLabel("Name").fill("New Agent");
    await page.getByLabel("Email").fill("newagent@test.com");
    await page.getByLabel("Password").fill("securepassword123");
    await page.getByRole("button", { name: "Create" }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("New Agent")).toBeVisible();
    await expect(page.getByText("newagent@test.com")).toBeVisible();
  });

  test("edits an existing user", async ({ page }) => {
    // Wait for the user we created in the previous test
    await expect(page.getByText("New Agent")).toBeVisible({ timeout: 10_000 });

    await page.getByRole("button", { name: "Edit New Agent" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await expect(page.getByLabel("Name")).toHaveValue("New Agent");
    await expect(page.getByLabel("Email")).toHaveValue("newagent@test.com");
    await expect(page.getByLabel("Password")).toHaveValue("");

    await page.getByLabel("Name").clear();
    await page.getByLabel("Name").fill("Updated Agent");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Updated Agent")).toBeVisible();
  });

  test("deactivates a user", async ({ page }) => {
    await expect(page.getByText("Updated Agent")).toBeVisible({ timeout: 10_000 });

    await page.getByRole("button", { name: "Delete Updated Agent" }).click();
    const dialog = page.getByRole("alertdialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Updated Agent")).toBeVisible();

    await page.getByRole("button", { name: "Deactivate" }).click();

    await expect(page.getByRole("alertdialog")).not.toBeVisible({ timeout: 10_000 });

    // User should now show as Inactive
    const row = page.getByRole("row").filter({ hasText: "Updated Agent" });
    await expect(row.getByText("Inactive")).toBeVisible();
  });
});

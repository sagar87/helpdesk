import { test, expect, type Page } from "@playwright/test";

async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@test.com");
  await page.getByLabel("Password").fill("testpassword12");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/", { timeout: 10_000 });
}

test.describe("User Management", () => {
  test("full CRUD flow: create, edit, and deactivate a user", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/users");
    await expect(page.getByRole("heading", { name: "Users" })).toBeVisible({ timeout: 10_000 });

    // Create
    await page.getByRole("button", { name: "Create User" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByLabel("Name").fill("E2E Agent");
    await page.getByLabel("Email").fill("e2eagent@test.com");
    await page.getByLabel("Password").fill("securepassword123");
    await page.getByRole("button", { name: "Create" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("E2E Agent")).toBeVisible();

    // Edit
    await page.getByRole("button", { name: "Edit E2E Agent" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByLabel("Name").clear();
    await page.getByLabel("Name").fill("E2E Agent Updated");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("E2E Agent Updated")).toBeVisible();

    // Deactivate
    await page.getByRole("button", { name: "Delete E2E Agent Updated" }).click();
    await expect(page.getByRole("alertdialog")).toBeVisible();
    await page.getByRole("button", { name: "Deactivate" }).click();
    await expect(page.getByRole("alertdialog")).not.toBeVisible({ timeout: 10_000 });
    const row = page.getByRole("row").filter({ hasText: "E2E Agent Updated" });
    await expect(row.getByText("Inactive")).toBeVisible();
  });
});

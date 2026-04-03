import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  use: {
    baseURL: "http://localhost:5174",
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: "cd server && DATABASE_URL=postgresql://postgres:password@localhost:5432/helpdesk_test PORT=3001 BETTER_AUTH_SECRET=test-secret-do-not-use-in-production-1234567890 BETTER_AUTH_URL=http://localhost:3001 TRUSTED_ORIGINS=http://localhost:5174 bun src/index.ts",
      url: "http://localhost:3001/api/health",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: "cd client && VITE_PORT=5174 VITE_API_URL=http://localhost:3001 bun run vite",
      url: "http://localhost:5174",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});

import pg from "pg";
import { execSync } from "child_process";
import path from "path";

const TEST_DB = "helpdesk_test";
const BASE_URL = "postgresql://postgres:password@localhost:5432";
const serverDir = path.resolve(__dirname, "../server");

export default async function globalSetup() {
  // Create test database if it doesn't exist
  const client = new pg.Client({ connectionString: `${BASE_URL}/postgres` });
  await client.connect();
  const { rows } = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [TEST_DB]
  );
  if (rows.length === 0) {
    await client.query(`CREATE DATABASE ${TEST_DB}`);
    console.log(`Created database: ${TEST_DB}`);
  }
  await client.end();

  // Run migrations against test database
  execSync("bunx prisma migrate deploy", {
    cwd: serverDir,
    stdio: "pipe",
    env: {
      ...process.env,
      DATABASE_URL: `${BASE_URL}/${TEST_DB}`,
    },
  });
  console.log("Migrations applied to test database");

  // Seed a test admin user
  execSync("bun src/seed.ts", {
    cwd: serverDir,
    stdio: "pipe",
    env: {
      ...process.env,
      DATABASE_URL: `${BASE_URL}/${TEST_DB}`,
      BETTER_AUTH_SECRET: "test-secret-do-not-use-in-production-1234567890",
      BETTER_AUTH_URL: "http://localhost:3001",
      ADMIN_EMAIL: "admin@test.com",
      ADMIN_PASSWORD: "testpassword12",
    },
  });
  console.log("Test admin user seeded");
}

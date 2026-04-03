import pg from "pg";

const TEST_DB = "helpdesk_test";
const BASE_URL = "postgresql://postgres:password@localhost:5432";

const client = new pg.Client({ connectionString: `${BASE_URL}/postgres` });
await client.connect();

await client.query(
  `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
  [TEST_DB]
);
await client.query(`DROP DATABASE IF EXISTS ${TEST_DB}`);
await client.end();

console.log(`Dropped database: ${TEST_DB}`);

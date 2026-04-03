import "dotenv/config";
import { auth } from "./lib/auth";
import { db } from "./lib/db";

const AGENT_EMAIL = process.env.AGENT_EMAIL!;
const AGENT_PASSWORD = process.env.AGENT_PASSWORD!;

async function seedAgent() {
  const existing = await db.user.findUnique({
    where: { email: AGENT_EMAIL },
  });

  if (existing) {
    console.log(`User ${AGENT_EMAIL} already exists, skipping.`);
    return;
  }

  await auth.api.signUpEmail({
    body: {
      email: AGENT_EMAIL,
      password: AGENT_PASSWORD,
      name: "Agent",
    },
  });

  // Role stays AGENT (the default — no update needed)
  console.log(`Agent user created: ${AGENT_EMAIL}`);
}

seedAgent()
  .catch((e) => {
    console.error("Agent seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

import "dotenv/config";
import { auth } from "./lib/auth";
import { db } from "./lib/db";
import { Role } from "./generated/prisma/enums";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

async function seed() {
  const existing = await db.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existing) {
    console.log(`User ${ADMIN_EMAIL} already exists, skipping.`);
    return;
  }

  const { user } = await auth.api.signUpEmail({
    body: {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      name: "Admin",
    },
  });

  await db.user.update({
    where: { id: user.id },
    data: { role: Role.ADMIN },
  });

  console.log(`Admin user created: ${ADMIN_EMAIL}`);
}

seed()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

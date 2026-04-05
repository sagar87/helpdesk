import "./env";
import { PgBoss } from "pg-boss";

export const boss = new PgBoss(process.env.DATABASE_URL!);
boss.on("error", console.error);

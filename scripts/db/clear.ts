import { db } from "../../src/server/db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    console.log("Dropping public schema...");
    await db.execute(sql`DROP SCHEMA public CASCADE;`);
    console.log("Recreating public schema...");
    await db.execute(sql`CREATE SCHEMA public;`);
    console.log("Database successfully cleared.");
    process.exit(0);
  } catch (err) {
    console.error("Error clearing database:", err);
    process.exit(1);
  }
}

main();

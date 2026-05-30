import { db } from "@/server/db";
import { sql } from "drizzle-orm";
import { Logger } from "../services/logger.service";


export async function pingDb(): Promise<boolean> {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (error) {
    Logger.error("Database ping failed:", { error: String(error) });
    return false;
  }
}

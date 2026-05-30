import { db, users } from "@/server/db";
import { eq } from "drizzle-orm";

const THROTTLE_MS = 60_000;
const cache = new Map<string, number>();

export function updateLastActive(userId: string): void {
  const now = Date.now();
  const last = cache.get(userId) ?? 0;

  if (now - last < THROTTLE_MS) return;

  cache.set(userId, now);

  db.update(users)
    .set({ lastActiveAt: new Date() })
    .where(eq(users.id, userId))
    .catch(() => cache.delete(userId)); 
}

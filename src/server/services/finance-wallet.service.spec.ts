




import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { resetDatabase } from "../test/db-utils";

const describeIfDb = process.env.TEST_DATABASE_URL ? describe : describe.skip;
const run = describeIfDb;

if (process.env.TEST_DATABASE_URL && !process.env.TEST_DATABASE_URL.includes("test")) {
  throw new Error("Refusing to run tests on non-test database");
}

run("Finance Wallet funding flow (simulated deposit)", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("simulates a deposit and verifies funded flag and fundedAt timestamp", async () => {
    const orgInsertRes = await db.execute(
      sql`INSERT INTO organizations (name, slug) VALUES (${"Test Org"}, ${"test-org"}) RETURNING id`,
    ) as { rows: { id: string }[] };
    const orgId = orgInsertRes.rows[0].id;

    await db.execute(
      sql`INSERT INTO organization_wallets (organization_id, wallet_address, funded) VALUES (${orgId}, ${"wallet-addr-1"}, false)`,
    );
    
    
    
    await db.execute(
      sql`UPDATE organization_wallets SET funded = true, funded_at = now() WHERE organization_id = ${orgId}`,
    );

    const walletRes = await db.execute(
      sql`SELECT funded, funded_at FROM organization_wallets WHERE organization_id = ${orgId} LIMIT 1`,
    ) as { rows: { funded: boolean; funded_at: string | null }[] };
    const walletRow = walletRes.rows[0];

    expect(walletRow).toBeDefined();
    expect(walletRow.funded).toBe(true);
    expect(walletRow.funded_at).toBeTruthy();
  });
});

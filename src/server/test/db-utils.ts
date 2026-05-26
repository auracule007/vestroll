import { sql } from "drizzle-orm";
import { db } from "../db";
import * as schema from "../db/schema";
import { vi } from "vitest";

export async function resetDatabase() {
  const tableNames = Object.values(schema)
    .filter((entity) => (entity as any).tableName)
    .map((entity) => (entity as any).tableName);

  for (const tableName of tableNames) {
    await db.execute(
      sql.raw(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`),
    );
  }
}


export function createTransactionalMockDb() {
  
  const store: Record<string, Record<string, unknown>[]> = {
    users: [],
    organizations: [],
    emailVerifications: [],
  };

  
  function buildInsert(targetStore: Record<string, unknown>[]) {
    return {
      values: vi.fn((row: Record<string, unknown>) => ({
        returning: vi.fn().mockResolvedValue([{ id: `mock-id-${Date.now()}`, ...row }]),
      })),
    };
  }

  
  function buildSelect(sourceRows: Record<string, unknown>[]) {
    const row = sourceRows.length > 0 ? [sourceRows[sourceRows.length - 1]] : [];
    return {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue(row),
          }),
          limit: vi.fn().mockResolvedValue(row),
        }),
        limit: vi.fn().mockResolvedValue(row),
      }),
    };
  }

  
  function buildUpdate() {
    return {
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    };
  }

  const mockDb = {
    _store: store,

    insert: vi.fn((table: { tableName?: string }) => {
      const key =
        table?.tableName === "email_verifications"
          ? "emailVerifications"
          : table?.tableName === "organizations"
          ? "organizations"
          : "users";

      const builder = {
        values: vi.fn((row: Record<string, unknown>) => {
          const defaults =
            key === "emailVerifications"
              ? {
                  attempts: 0,
                  verified: false,
                  createdAt: new Date(),
                }
              : {};
          const persisted = {
            id: `mock-id-${Date.now()}`,
            ...defaults,
            ...row,
          };
          store[key].push(persisted);
          return {
            returning: vi.fn().mockResolvedValue([persisted]),
          };
        }),
      };
      return builder;
    }),

    select: vi.fn(() => buildSelect([])),

    update: vi.fn(() => buildUpdate()),

    delete: vi.fn(() => ({
      where: vi.fn().mockResolvedValue(undefined),
    })),

    
    transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) => {
      const txContext = {
        insert: vi.fn((table: { tableName?: string }) => {
          const key =
            table?.tableName === "email_verifications"
              ? "emailVerifications"
              : table?.tableName === "organizations"
              ? "organizations"
              : "users";

          return {
            values: vi.fn((row: Record<string, unknown>) => {
              const defaults =
                key === "emailVerifications"
                  ? {
                      attempts: 0,
                      verified: false,
                      createdAt: new Date(),
                    }
                  : {};
              const persisted = {
                id: `mock-id-${Date.now()}`,
                ...defaults,
                ...row,
              };
              store[key].push(persisted);
              return {
                returning: vi.fn().mockResolvedValue([persisted]),
              };
            }),
          };
        }),

        update: vi.fn(() => ({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(undefined),
          }),
        })),

        select: vi.fn(() => buildSelect(store.emailVerifications)),
      };

      return callback(txContext);
    }),
  };

  return mockDb;
}

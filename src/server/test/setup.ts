import { beforeAll, afterAll, beforeEach } from "vitest";
import { loadEnvConfig } from "@next/env";
import path from "path";


loadEnvConfig(path.resolve(process.cwd()));


(process.env as any).NODE_ENV = "test";

beforeAll(async () => {
  // Global setup if needed (e.g., check DB connection)
});

afterAll(async () => {
  // Global teardown if needed
});

beforeEach(async () => {
  // Optional: Reset DB before each test if desired
  // import { resetDatabase } from "./db-utils";
  // await resetDatabase();
});

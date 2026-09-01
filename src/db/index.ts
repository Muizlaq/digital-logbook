import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/digital_logbook";

// Global singleton client for Next.js hot-reloading
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

export const client = globalForDb.conn ?? postgres(connectionString, { max: 10 });
if (process.env.NODE_ENV !== "production") globalForDb.conn = client;

export const db = drizzle(client, { schema });
export * from "./schema";

import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { isDatabaseConfigured } from "@/lib/env";
import * as schema from "@/db/schema";

declare global {
  var __pool: Pool | undefined;
}

const databaseUrl = process.env.DATABASE_URL;

const pool =
  isDatabaseConfigured() && databaseUrl
    ? global.__pool ?? new Pool({ connectionString: databaseUrl })
    : null;

if (process.env.NODE_ENV !== "production" && pool) {
  global.__pool = pool;
}

export const db = pool ? drizzle(pool, { schema }) : null;

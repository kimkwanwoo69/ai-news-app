import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Server-only: never import this module from client components.
const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema });

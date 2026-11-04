import { defineConfig } from "drizzle-kit";

// drizzle-kit does not load .env.local on its own (Next.js does it only for the app).
try {
  process.loadEnvFile(".env.local");
} catch {
  // fall back to variables already present in the environment
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set (.env.local)");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL },
});

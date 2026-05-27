import { defineConfig } from "drizzle-kit";
import path from "path";

// Support both DATABASE_URL (for custom setups) and POSTGRES_URL (for Supabase)
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL or POSTGRES_URL must be set, ensure the database is provisioned");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});

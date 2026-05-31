/**
 * Apply pending SQL migrations to Supabase.
 * Requires DATABASE_URL in .env (Supabase → Project Settings → Database → Connection string).
 *
 * Usage: npm run db:migrate
 */
import { config } from "dotenv";
import { readdir, readFile } from "fs/promises";
import { resolve, join } from "path";
import pg from "pg";

config({ path: resolve(process.cwd(), ".env") });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error(
    "Missing DATABASE_URL in .env.\n" +
      "Add it from Supabase → Project Settings → Database → Connection string (URI).",
  );
  process.exit(1);
}

async function applyMigrations() {
  const migrationsDir = resolve(process.cwd(), "supabase/migrations");
  const files = (await readdir(migrationsDir))
    .filter((name) => name.endsWith(".sql"))
    .sort();

  const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    for (const file of files) {
      const sql = await readFile(join(migrationsDir, file), "utf8");
      console.log(`Applying ${file}…`);
      await client.query(sql);
      console.log(`  ✓ ${file}`);
    }
    console.log("All migrations applied.");
  } finally {
    await client.end();
  }
}

applyMigrations().catch((err) => {
  console.error(err);
  process.exit(1);
});

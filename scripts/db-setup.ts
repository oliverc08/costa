import "./load-env";
import { readFileSync } from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set. Add it to .env.local (or run `vercel env pull`).");
    process.exit(1);
  }
  const sql = neon(url);
  const schema = readFileSync(path.join(process.cwd(), "lib/store/schema.sql"), "utf8");
  const statements = schema
    .split(/;\s*$/m)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await sql.query(statement);
  }
  console.log(`Applied ${statements.length} schema statements.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

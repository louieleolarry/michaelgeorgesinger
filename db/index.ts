import { drizzle } from "drizzle-orm/d1";
import { getEnv } from "../app/lib/cf";
import * as schema from "./schema";

export async function getDb() {
  const env = await getEnv();
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return drizzle(env.DB as D1Database, { schema });
}

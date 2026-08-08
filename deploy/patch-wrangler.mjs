#!/usr/bin/env node
// Patches vinext's generated `dist/server/wrangler.json` with production
// Cloudflare settings that its build does not emit: the real D1 database id,
// the custom-domain routes, and the cron trigger (WebSub lease renewal).
//
// Runs after `vinext build`, before `wrangler deploy` — wired into
// `npm run deploy`. Values come from deploy/cloudflare.json so the deploy
// config is versioned in source. Local dev is unaffected (it uses the
// placeholder D1 binding from vite.config.ts + local Miniflare).
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const cfg = JSON.parse(
  readFileSync(new URL("./cloudflare.json", import.meta.url), "utf8")
);
const targetPath = fileURLToPath(
  new URL("../dist/server/wrangler.json", import.meta.url)
);

let wr;
try {
  wr = JSON.parse(readFileSync(targetPath, "utf8"));
} catch {
  console.error(
    `Could not read ${targetPath}. Run \`npm run build\` first (it generates the wrangler config).`
  );
  process.exit(1);
}

wr.d1_databases = [
  {
    binding: cfg.d1.binding,
    database_name: cfg.d1.database_name,
    database_id: cfg.d1.database_id,
  },
];
wr.routes = cfg.routes;
wr.triggers = cfg.triggers;

writeFileSync(targetPath, JSON.stringify(wr));

console.log("Patched dist/server/wrangler.json for production:");
console.log(`  D1:     ${cfg.d1.database_name} (${cfg.d1.database_id})`);
console.log(`  routes: ${cfg.routes.map((r) => r.pattern).join(", ")}`);
console.log(`  cron:   ${cfg.triggers.crons.join(", ")}`);

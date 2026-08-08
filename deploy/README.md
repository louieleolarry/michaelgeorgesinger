# Deploying michaelgeorgesinger.com (Cloudflare Workers + D1)

The site is a vinext app deployed as a Cloudflare Worker on the account
`145709cdc234d365c27e4f8a01406b87` (`louieleolarry@gmail.com`), serving the
custom domain `michaelgeorgesinger.com` (DNS on Cloudflare; domain registered at
Namecheap). Video data lives in D1 and is kept fresh by YouTube WebSub push.

## Routine deploy (after the one-time setup below)

```bash
wrangler login          # once per machine
npm run deploy          # build + patch config (deploy/cloudflare.json) + wrangler deploy
```

`npm run deploy` runs `vinext build`, then `deploy/patch-wrangler.mjs` (injects
the real D1 id, the `michaelgeorgesinger.com/*` + `www` routes, and the cron
trigger from [`cloudflare.json`](cloudflare.json) into the generated
`dist/server/wrangler.json`), then `wrangler deploy`.

Deploying with routes disables the `*.workers.dev` preview URL — that's expected;
the custom domain is the target. (Add `"workers_dev": true` to the patch if you
want a preview URL back.)

## One-time setup (already done for the live site — here for reproducibility)

1. **D1 database** — created once; id is recorded in `cloudflare.json`:
   ```bash
   wrangler d1 create michaelgeorgesinger
   ```
2. **Apply the schema** to remote D1:
   ```bash
   wrangler d1 execute michaelgeorgesinger --remote --file=drizzle/0000_organic_proudstar.sql
   ```
   (Regenerate migrations with `npm run db:generate` after editing `db/schema.ts`.)
3. **Worker secrets** (never in git — see `.dev.vars.example`):
   ```bash
   wrangler secret put YOUTUBE_API_KEY --name michaelgeorgesinger-com
   wrangler secret put WEBSUB_SECRET   --name michaelgeorgesinger-com
   wrangler secret put ADMIN_TOKEN     --name michaelgeorgesinger-com
   ```
4. **Deploy:** `npm run deploy`
5. **Backfill** the video catalog into D1 (admin-guarded):
   ```bash
   curl -X POST https://michaelgeorgesinger.com/youtube/backfill \
     -H "Authorization: Bearer $ADMIN_TOKEN"
   ```
6. **Subscribe** to YouTube WebSub push (also renewed every ~4 days by the cron):
   ```bash
   curl -X POST https://michaelgeorgesinger.com/youtube/subscribe \
     -H "Authorization: Bearer $ADMIN_TOKEN"
   ```

## DNS / email (Cloudflare dashboard, not wrangler)

- The apex + `www` are served by the Worker via the routes above.
- Email is **Cloudflare Email Routing** (catch-all → `michael_george_1@live.com`),
  with MX `route1/2/3.mx.cloudflare.net` and SPF `include:_spf.mx.cloudflare.net`.
  The old Namecheap `eforward` MX/SPF were removed to clear the conflict.

## Rollback

The EC2 static site (`52.89.51.130`) is still running. To fall back, remove the
two Worker routes in the dashboard (Workers → michaelgeorgesinger-com → Routes) —
traffic returns to the EC2 immediately.

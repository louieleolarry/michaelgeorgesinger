# Production snapshot

This directory is a **byte-for-byte snapshot of the live production site** as
served from the quicksites EC2, captured **2026-08-07**.

- **Source host:** `quicksites-ec2` (`52.89.51.130`, Amazon Linux 2023)
- **Served from:** `/var/www/michaelgeorgesinger.com/html/`
- **Web server:** nginx (config in [`../deploy/nginx/michaelgeorgesinger.com.conf`](../deploy/nginx/michaelgeorgesinger.com.conf)), TLS via Certbot/Let's Encrypt

## Why this exists

Production drifted from the vinext source under `app/`: several changes were made
**directly on the server** (hand-edited CSS with cache-busting query strings,
extra patch stylesheets, and a sudo-edited `index.html`) and were never captured
in source. This snapshot preserves the true live state in version control so
nothing is lost.

Production-only artifacts not reproduced by `npm run build` at time of capture:

- `assets/index-DQ1MpVVJ.css` — same filename as the source build output but
  **different content** (served as `?v=20260804-mobile-icon-align`)
- `assets/mobile-type-20260803-v2.css`, `assets/mobile-hero-20260803.css`,
  `assets/index-hero-mirror-20260804.css` and other `index-*.css` patch files
- `assets/hash-nav-temporary.js`
- `index.html` (was `root`-owned on the server — edited with sudo)

Media files matched the source build exactly.

## Note

These are built + hand-patched artifacts; they do **not** regenerate cleanly from
`npm run build`. Treat this folder as a historical/authoritative record of what
was live on the capture date, not as build output. Reconciling these patches back
into the `app/` source is tracked as follow-up work.

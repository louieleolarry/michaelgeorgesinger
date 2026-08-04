import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Michael George artist homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Michael George \| Official Music<\/title>/i);
  assert.match(html, /Assyrian Chaldean singer/);
  assert.match(html, /Tour and Appearance Dates/);
  assert.match(html, /info@michaelgeorgesinger\.com/);
  assert.match(html, /mailto:info@michaelgeorgesinger\.com/);
  assert.match(html, /Latest release/);
  assert.match(html, /DLALY/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/i);
});

test("includes every requested official social destination", async () => {
  const html = await (await render()).text();

  for (const href of [
    "https://www.youtube.com/@MichaelGeorge74",
    "https://www.instagram.com/michaelgeorge74/",
    "https://www.facebook.com/michael.george.50702/",
    "https://qeenatha.com/artist/4568",
    "https://www.tiktok.com/@michael.george.official",
  ]) {
    assert.match(html, new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("uses bundled artist imagery in the page source", async () => {
  const [page, layout, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /michael-facebook-profile\.jpg/);
  assert.match(page, /video-dlaly\.jpg/);
  assert.match(css, /michael-youtube-avatar\.jpg/);
  assert.match(layout, /michael-facebook-profile\.jpg/);
});

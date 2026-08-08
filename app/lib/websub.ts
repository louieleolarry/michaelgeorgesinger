import { getEnv } from "./cf";
import { CHANNEL_FEED_URL } from "./youtube";
import { getMeta, setMeta } from "./videos-repo";

export const HUB_URL = "https://pubsubhubbub.appspot.com/subscribe";

async function websubSecret(): Promise<string | undefined> {
  const env = await getEnv();
  return env.WEBSUB_SECRET;
}

/**
 * Subscribe (or unsubscribe) to the channel's Atom feed via YouTube's WebSub
 * hub. `callbackUrl` must be the public URL of our /youtube/websub route.
 * Returns the hub's HTTP status (202 = accepted, verification pending).
 */
export async function subscribeToHub(
  callbackUrl: string,
  mode: "subscribe" | "unsubscribe" = "subscribe"
): Promise<{ status: number; body: string }> {
  const form = new URLSearchParams({
    "hub.mode": mode,
    "hub.topic": CHANNEL_FEED_URL,
    "hub.callback": callbackUrl,
    "hub.verify": "async",
    "hub.lease_seconds": "432000", // 5 days
  });
  const secret = await websubSecret();
  if (secret) form.set("hub.secret", secret);

  const res = await fetch(HUB_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  return { status: res.status, body: await res.text().catch(() => "") };
}

/**
 * Renew the subscription using the callback URL stored at subscribe time.
 * Called by the scheduled (cron) handler. No-op if we've never subscribed.
 */
export async function renewSubscription(): Promise<
  { skipped: true } | { skipped: false; status: number }
> {
  const callbackUrl = await getMeta("websub_callback");
  if (!callbackUrl) return { skipped: true };
  const result = await subscribeToHub(callbackUrl, "subscribe");
  await setMeta("websub_last_renew", new Date().toISOString());
  return { skipped: false, status: result.status };
}

/** True when this GET is a valid hub verification for our topic. */
export function isValidVerification(url: URL): boolean {
  const mode = url.searchParams.get("hub.mode");
  const topic = url.searchParams.get("hub.topic");
  return (
    (mode === "subscribe" || mode === "unsubscribe") &&
    topic === CHANNEL_FEED_URL
  );
}

/** Extract YouTube video ids from an Atom push body (ignores deletions). */
export function parseAtomVideoIds(xml: string): string[] {
  const ids: string[] = [];
  const re = /<yt:videoId>([^<]+)<\/yt:videoId>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const id = m[1].trim();
    if (id) ids.push(id);
  }
  return [...new Set(ids)];
}

/**
 * Verify the hub's `X-Hub-Signature: sha1=<hex>` over the raw body using our
 * shared secret. Returns true when no secret is configured (verification off)
 * or when the signature matches.
 */
export async function verifySignature(
  rawBody: string,
  signatureHeader: string | null
): Promise<boolean> {
  const secret = await websubSecret();
  if (!secret) return true; // no secret configured -> accept
  if (!signatureHeader) return false;

  const match = /^sha1=([0-9a-f]+)$/i.exec(signatureHeader.trim());
  if (!match) return false;
  const provided = match[1].toLowerCase();

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(rawBody)
  );
  const expected = [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // constant-time-ish comparison
  if (expected.length !== provided.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
  }
  return diff === 0;
}

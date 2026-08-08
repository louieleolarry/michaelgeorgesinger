import { fetchVideosByIds } from "../../lib/youtube";
import { upsertVideos } from "../../lib/videos-repo";
import {
  isValidVerification,
  parseAtomVideoIds,
  verifySignature,
} from "../../lib/websub";

export const dynamic = "force-dynamic";

// GET /youtube/websub — hub subscription verification. The hub sends
// hub.challenge and expects it echoed back verbatim (2xx) to confirm.
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const challenge = url.searchParams.get("hub.challenge");
  if (challenge && isValidVerification(url)) {
    return new Response(challenge, {
      status: 200,
      headers: { "content-type": "text/plain" },
    });
  }
  return new Response("Not found", { status: 404 });
}

// POST /youtube/websub — new-upload push. Verify signature, extract video ids,
// enrich via the Data API, upsert into D1. Always 2xx so the hub doesn't retry
// on our own downstream hiccups (we log and move on).
export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text();

  const valid = await verifySignature(
    rawBody,
    request.headers.get("x-hub-signature")
  );
  if (!valid) return new Response("Invalid signature", { status: 202 });

  const ids = parseAtomVideoIds(rawBody);
  if (ids.length === 0) return new Response("No entries", { status: 204 });

  try {
    const videos = await fetchVideosByIds(ids);
    await upsertVideos(videos);
  } catch {
    // Swallow: acknowledge the push so the hub doesn't hammer us; the next
    // push or a backfill will reconcile.
  }
  return new Response("OK", { status: 204 });
}

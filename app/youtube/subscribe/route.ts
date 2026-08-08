import { requireAdmin } from "../../lib/admin";
import { subscribeToHub } from "../../lib/websub";
import { setMeta } from "../../lib/videos-repo";

export const dynamic = "force-dynamic";

// POST /youtube/subscribe — (re)subscribe to the WebSub hub. Admin-guarded.
// Also called by the scheduled lease-renewal. The callback URL is derived from
// this request's own origin so it works in dev, staging, and prod without config.
export async function POST(request: Request): Promise<Response> {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const origin = new URL(request.url).origin;
  const callbackUrl = `${origin}/youtube/websub`;

  try {
    const result = await subscribeToHub(callbackUrl, "subscribe");
    await setMeta("websub_last_subscribe", new Date().toISOString());
    await setMeta("websub_callback", callbackUrl);
    const accepted = result.status === 202 || result.status === 204;
    return Response.json(
      { ok: accepted, hubStatus: result.status, callbackUrl, hubBody: result.body.slice(0, 300) },
      { status: accepted ? 200 : 502 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

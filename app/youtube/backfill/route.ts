import { requireAdmin } from "../../lib/admin";
import { fetchAllUploads } from "../../lib/youtube";
import { setMeta, upsertVideos } from "../../lib/videos-repo";

export const dynamic = "force-dynamic";

// POST /youtube/backfill — one-shot (idempotent) import of the whole uploads
// playlist into D1. Admin-guarded. Safe to re-run; upserts by video id.
export async function POST(request: Request): Promise<Response> {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const videos = await fetchAllUploads();
    const count = await upsertVideos(videos);
    await setMeta("last_backfill", new Date().toISOString());
    return Response.json({ ok: true, imported: count });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

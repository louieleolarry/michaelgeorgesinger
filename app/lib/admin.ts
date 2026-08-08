import { getEnv } from "./cf";

/**
 * Guards admin-only routes (backfill, subscribe). Requires
 * `Authorization: Bearer <ADMIN_TOKEN>`. Returns a Response to short-circuit
 * with on failure, or null when the request is authorized.
 */
export async function requireAdmin(request: Request): Promise<Response | null> {
  const env = await getEnv();
  const expected = env.ADMIN_TOKEN;
  if (!expected) {
    return Response.json(
      { error: "ADMIN_TOKEN is not configured on the server." },
      { status: 503 }
    );
  }
  const header = request.headers.get("authorization") ?? "";
  const token = header.replace(/^Bearer\s+/i, "");
  if (token !== expected) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

// Resolve Cloudflare Worker bindings/secrets lazily. Using a dynamic import
// keeps `cloudflare:workers` out of the static module graph, so the worker
// bundle still loads under plain Node (e.g. the render test) — it only touches
// the Cloudflare-only module when a binding is actually used at runtime.
export interface WorkerEnv {
  DB?: unknown;
  YOUTUBE_API_KEY?: string;
  WEBSUB_SECRET?: string;
  ADMIN_TOKEN?: string;
  [key: string]: unknown;
}

export async function getEnv(): Promise<WorkerEnv> {
  const mod = await import("cloudflare:workers");
  return mod.env as unknown as WorkerEnv;
}

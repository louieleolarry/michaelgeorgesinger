// Pure display helpers (no runtime/env deps) so they're easy to test.

/**
 * Turn a raw YouTube title into the short, production-style label.
 * e.g. "Michael George - Khliminwa 2025 مايكل جورج - خليمنوا" -> "Khliminwa"
 *      "Michael George ( DLALY )" -> "DLALY"
 * Falls back to the trimmed raw title if cleaning would empty it.
 */
export function cleanTitle(raw: string): string {
  let t = (raw ?? "").trim();
  // strip a leading "Michael George" plus following separators/parens
  t = t.replace(/^\s*michael\s+george\s*[-–—:|(]*\s*/i, "");
  // cut at the first 4-digit year or Arabic-script character
  const cut = t.search(/\d{4}|[؀-ۿ]/);
  if (cut > 0) t = t.slice(0, cut);
  // trim stray separators/brackets/space from both ends
  t = t.replace(/^[\s\-–—:|()[\]]+/, "").replace(/[\s\-–—:|()[\]]+$/, "").trim();
  return t || (raw ?? "").trim();
}

/** Four-digit year from an ISO date string. */
export function formatYear(iso: string): string {
  const y = iso?.slice(0, 4);
  return y && /^\d{4}$/.test(y) ? y : "";
}

/** Compact view count, e.g. 1304 -> "1.3K", 777 -> "777". */
export function formatViews(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0";
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}K`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

/** Seconds -> "m:ss" or "h:mm:ss". */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
}

export const watchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

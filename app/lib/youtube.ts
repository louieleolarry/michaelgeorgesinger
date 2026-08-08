import { getEnv } from "./cf";

// @MichaelGeorge74. The uploads playlist id is the channel id with the "UC"
// prefix swapped for "UU" — a stable YouTube convention.
export const CHANNEL_ID = "UC7qWL2pB7-VnK4yq9VwP6vA";
export const UPLOADS_PLAYLIST_ID = "UU7qWL2pB7-VnK4yq9VwP6vA";

// The Atom feed WebSub subscribes to for new-upload pushes.
export const CHANNEL_FEED_URL = `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

const API_BASE = "https://www.googleapis.com/youtube/v3";

/** Normalized video record — matches the D1 `videos` table shape. */
export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string; // ISO 8601
  categoryId: string | null;
  tags: string[];
  thumbnail: string;
  durationSeconds: number;
  viewCount: number;
}

async function apiKey(): Promise<string> {
  const env = await getEnv();
  const key = env.YOUTUBE_API_KEY;
  if (!key) {
    throw new Error(
      "YOUTUBE_API_KEY is not set. Add it to .dev.vars for local dev or as a Worker secret in production."
    );
  }
  return key;
}

async function ytFetch<T>(
  resource: string,
  params: Record<string, string>
): Promise<T> {
  const url = new URL(`${API_BASE}/${resource}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("key", await apiKey());

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `YouTube API ${resource} failed: ${res.status} ${res.statusText} ${body.slice(0, 300)}`
    );
  }
  return (await res.json()) as T;
}

// PT#H#M#S -> seconds. Returns 0 for missing/unparseable input.
export function parseDurationSeconds(iso: string | undefined): number {
  if (!iso) return 0;
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!m) return 0;
  const [, h, min, s] = m;
  return Number(h ?? 0) * 3600 + Number(min ?? 0) * 60 + Number(s ?? 0);
}

interface Thumbnails {
  [k: string]: { url: string; width?: number; height?: number } | undefined;
}

// Prefer the largest available thumbnail.
export function pickThumbnail(thumbnails: Thumbnails | undefined): string {
  if (!thumbnails) return "";
  for (const key of ["maxres", "standard", "high", "medium", "default"]) {
    const t = thumbnails[key];
    if (t?.url) return t.url;
  }
  return "";
}

interface PlaylistItemsResponse {
  nextPageToken?: string;
  items: { contentDetails?: { videoId?: string } }[];
}

/** Every video id in the uploads playlist, newest first, paginated. */
export async function listUploadVideoIds(): Promise<string[]> {
  const ids: string[] = [];
  let pageToken: string | undefined;
  do {
    const data = await ytFetch<PlaylistItemsResponse>("playlistItems", {
      part: "contentDetails",
      playlistId: UPLOADS_PLAYLIST_ID,
      maxResults: "50",
      ...(pageToken ? { pageToken } : {}),
    });
    for (const item of data.items) {
      const id = item.contentDetails?.videoId;
      if (id) ids.push(id);
    }
    pageToken = data.nextPageToken;
  } while (pageToken);
  return ids;
}

interface VideoListResponse {
  items: {
    id: string;
    snippet?: {
      title?: string;
      description?: string;
      publishedAt?: string;
      categoryId?: string;
      tags?: string[];
      thumbnails?: Thumbnails;
    };
    contentDetails?: { duration?: string };
    statistics?: { viewCount?: string };
  }[];
}

/** Enrich up to any number of video ids (batched in groups of 50). */
export async function fetchVideosByIds(ids: string[]): Promise<YouTubeVideo[]> {
  const out: YouTubeVideo[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const data = await ytFetch<VideoListResponse>("videos", {
      part: "snippet,contentDetails,statistics",
      id: batch.join(","),
      maxResults: "50",
    });
    for (const v of data.items) {
      out.push({
        id: v.id,
        title: v.snippet?.title ?? "",
        description: v.snippet?.description ?? "",
        publishedAt: v.snippet?.publishedAt ?? new Date(0).toISOString(),
        categoryId: v.snippet?.categoryId ?? null,
        tags: v.snippet?.tags ?? [],
        thumbnail: pickThumbnail(v.snippet?.thumbnails),
        durationSeconds: parseDurationSeconds(v.contentDetails?.duration),
        viewCount: Number(v.statistics?.viewCount ?? 0),
      });
    }
  }
  return out;
}

/** Full backfill: all uploads, enriched. */
export async function fetchAllUploads(): Promise<YouTubeVideo[]> {
  const ids = await listUploadVideoIds();
  return fetchVideosByIds(ids);
}

interface CategoriesResponse {
  items: { id: string; snippet?: { title?: string } }[];
}

/** categoryId -> human name (region-specific; defaults to US). */
export async function fetchVideoCategoryMap(
  regionCode = "US"
): Promise<Record<string, string>> {
  const data = await ytFetch<CategoriesResponse>("videoCategories", {
    part: "snippet",
    regionCode,
  });
  const map: Record<string, string> = {};
  for (const item of data.items) {
    if (item.snippet?.title) map[item.id] = item.snippet.title;
  }
  return map;
}

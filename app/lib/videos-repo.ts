import { desc, eq } from "drizzle-orm";
import { getDb } from "../../db";
import { meta, videos } from "../../db/schema";
import type { YouTubeVideo } from "./youtube";

/** Row shape as stored in D1 (tags serialized to JSON). */
type VideoRow = typeof videos.$inferSelect;

/** App-facing video with tags parsed back to an array. */
export interface VideoRecord extends Omit<VideoRow, "tags"> {
  tags: string[];
}

function toRecord(row: VideoRow): VideoRecord {
  let tags: string[] = [];
  try {
    const parsed = JSON.parse(row.tags);
    if (Array.isArray(parsed)) tags = parsed.filter((t) => typeof t === "string");
  } catch {
    // leave tags empty on malformed JSON
  }
  return { ...row, tags };
}

/** Insert or update videos by id. */
export async function upsertVideos(items: YouTubeVideo[]): Promise<number> {
  if (items.length === 0) return 0;
  const db = await getDb();
  const now = new Date().toISOString();
  const rows = items.map((v) => ({
    id: v.id,
    title: v.title,
    description: v.description,
    publishedAt: v.publishedAt,
    categoryId: v.categoryId,
    tags: JSON.stringify(v.tags),
    thumbnail: v.thumbnail,
    durationSeconds: v.durationSeconds,
    viewCount: v.viewCount,
    updatedAt: now,
  }));

  for (const row of rows) {
    await db
      .insert(videos)
      .values(row)
      .onConflictDoUpdate({
        target: videos.id,
        set: {
          title: row.title,
          description: row.description,
          publishedAt: row.publishedAt,
          categoryId: row.categoryId,
          tags: row.tags,
          thumbnail: row.thumbnail,
          durationSeconds: row.durationSeconds,
          viewCount: row.viewCount,
          updatedAt: row.updatedAt,
        },
      });
  }
  return rows.length;
}

/** All videos, newest first. Filtering/sorting beyond date is done client-side. */
export async function getAllVideos(): Promise<VideoRecord[]> {
  const db = await getDb();
  const rows = await db.select().from(videos).orderBy(desc(videos.publishedAt));
  return rows.map(toRecord);
}

export async function getMeta(key: string): Promise<string | null> {
  const db = await getDb();
  const [row] = await db.select().from(meta).where(eq(meta.key, key)).limit(1);
  return row?.value ?? null;
}

export async function setMeta(key: string, value: string): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db
    .insert(meta)
    .values({ key, value, updatedAt: now })
    .onConflictDoUpdate({ target: meta.key, set: { value, updatedAt: now } });
}

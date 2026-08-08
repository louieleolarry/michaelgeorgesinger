import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// One row per YouTube upload for @MichaelGeorge74. Populated by the backfill
// (uploads playlist) and kept fresh by the WebSub push endpoint. `tags` is a
// JSON-encoded string array so we can sort/filter on it client-side.
export const videos = sqliteTable("videos", {
  id: text("id").primaryKey(), // YouTube videoId
  title: text("title").notNull().default(""),
  description: text("description").notNull().default(""),
  publishedAt: text("published_at").notNull(), // ISO 8601
  categoryId: text("category_id"),
  tags: text("tags").notNull().default("[]"), // JSON string[]
  thumbnail: text("thumbnail").notNull().default(""),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  viewCount: integer("view_count").notNull().default(0),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// Small key/value store for operational state: WebSub lease expiry, last
// backfill timestamp, cached categoryId->name map, etc.
export const meta = sqliteTable("meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

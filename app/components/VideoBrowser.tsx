"use client";

import { useMemo, useState } from "react";

export interface VideoCardData {
  id: string;
  title: string; // already cleaned for display
  year: string;
  thumbnail: string;
  url: string;
  tags: string[];
  views: number;
  publishedAt: string; // ISO, for sorting
}

const PAGE = 6;
type SortKey = "newest" | "oldest" | "views";

export default function VideoBrowser({ videos }: { videos: VideoCardData[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [tag, setTag] = useState("");
  const [visible, setVisible] = useState(PAGE);

  // Most-common tags first, capped so the dropdown stays usable.
  const topTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const v of videos)
      for (const t of v.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 30)
      .map(([t]) => t);
  }, [videos]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = videos.filter((v) => {
      if (tag && !v.tags.includes(tag)) return false;
      if (!q) return true;
      return (
        v.title.toLowerCase().includes(q) ||
        v.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
    list.sort((a, b) => {
      if (sort === "views") return b.views - a.views;
      const cmp = a.publishedAt.localeCompare(b.publishedAt);
      return sort === "oldest" ? cmp : -cmp;
    });
    return list;
  }, [videos, query, sort, tag]);

  const shown = filtered.slice(0, visible);
  const reset = () => setVisible(PAGE);

  return (
    <>
      <div className="videoControls">
        <input
          className="videoSearch"
          type="search"
          placeholder="Search videos or tags"
          aria-label="Search videos"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            reset();
          }}
        />
        <select
          className="videoSort"
          aria-label="Sort videos"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value as SortKey);
            reset();
          }}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="views">Most viewed</option>
        </select>
        {topTags.length > 0 && (
          <select
            className="tagSelect"
            aria-label="Filter by tag"
            value={tag}
            onChange={(e) => {
              setTag(e.target.value);
              reset();
            }}
          >
            <option value="">All tags</option>
            {topTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        )}
        <p className="videoCount">
          Showing {Math.min(shown.length, filtered.length)} of {filtered.length}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="videoEmpty">No videos match those filters.</p>
      ) : (
        <div className="videoGrid">
          {shown.map((v) => (
            <a
              className="videoCard"
              key={v.id}
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {v.thumbnail ? (
                <img src={v.thumbnail} alt={`${v.title} video thumbnail`} loading="lazy" />
              ) : null}
              {v.year ? <span className="videoMeta">{v.year}</span> : null}
              <strong>{v.title}</strong>
            </a>
          ))}
        </div>
      )}

      {visible < filtered.length && (
        <div className="showMoreRow">
          <button
            type="button"
            className="showMore"
            onClick={() => setVisible((n) => n + PAGE)}
          >
            Show more
          </button>
        </div>
      )}
    </>
  );
}

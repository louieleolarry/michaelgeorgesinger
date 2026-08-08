"use client";

import { useEffect, useRef } from "react";

function getVideoId(href: string): string | null {
  try {
    const url = new URL(href, window.location.href);
    if (url.hostname.includes("youtube.com")) return url.searchParams.get("v");
    if (url.hostname === "youtu.be") return url.pathname.slice(1);
  } catch {
    // ignore
  }
  return null;
}

/**
 * Restores production's in-page video player: clicking a video card / featured
 * link opens a modal with an embedded YouTube player instead of navigating away.
 * Uses event delegation on `document` so lazily-loaded ("Show more") cards work
 * too. The anchors keep their real href as a no-JS fallback (opens YouTube).
 */
export default function YouTubeModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const modal = dialogRef.current;
    const frame = frameRef.current;
    if (!modal || !frame || typeof modal.showModal !== "function") return;

    const closeVideo = () => {
      frame.replaceChildren();
      if (modal.open) modal.close();
    };

    const onDocClick = (event: MouseEvent) => {
      // allow modifier-clicks / non-primary buttons to behave normally
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const target = event.target as Element | null;
      if (!target) return;
      if (target.closest(".ytModal__close")) {
        closeVideo();
        return;
      }
      const link = target.closest<HTMLAnchorElement>(
        'a.videoCard, a.featureImage, a.textLink[href*="youtube.com/watch"]'
      );
      if (!link) return;
      const id = getVideoId(link.href);
      if (!id) return;
      event.preventDefault();
      modal.showModal();
      frame.innerHTML =
        `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0&playsinline=1"` +
        ' title="YouTube video player" allow="encrypted-media; picture-in-picture; web-share" allowfullscreen></iframe>';
    };

    const onModalClick = (event: MouseEvent) => {
      if (event.target === modal) closeVideo();
    };
    const onClose = () => frame.replaceChildren();

    document.addEventListener("click", onDocClick);
    modal.addEventListener("click", onModalClick);
    modal.addEventListener("close", onClose);
    return () => {
      document.removeEventListener("click", onDocClick);
      modal.removeEventListener("click", onModalClick);
      modal.removeEventListener("close", onClose);
    };
  }, []);

  return (
    <dialog ref={dialogRef} className="ytModal" id="ytModal" aria-label="Video player">
      <div className="ytModal__inner">
        <button className="ytModal__close" type="button" aria-label="Close video">
          x
        </button>
        <div className="ytModal__frame" id="ytModalFrame" ref={frameRef} />
      </div>
    </dialog>
  );
}

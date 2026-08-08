import VideoBrowser, { type VideoCardData } from "./components/VideoBrowser";
import { cleanTitle, formatYear, watchUrl } from "./lib/format";
import seed from "./lib/videos-seed.json";

// Reads the video catalog from D1 per request (falls back to a bundled seed
// when D1 is empty/unavailable, e.g. before the first backfill or in local dev).
export const dynamic = "force-dynamic";

// Opens external links in a new tab, safely.
const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

const socialLinks = [
  { label: "YouTube", href: "https://www.youtube.com/@MichaelGeorge74", note: "Official videos", iconClass: "socialIcon--youtube" },
  { label: "Instagram", href: "https://www.instagram.com/michaelgeorge74/", note: "Photos and clips", iconClass: "socialIcon--instagram" },
  { label: "Facebook", href: "https://www.facebook.com/michael.george.50702/", note: "Community updates", iconClass: "socialIcon--facebook" },
  { label: "Qeenatha", href: "https://qeenatha.com/artist/4568", note: "Music profile", iconClass: "socialIcon--qeenatha" },
  { label: "TikTok", href: "https://www.tiktok.com/@michael.george.official", note: "Short videos", iconClass: "socialIcon--tiktok" },
];

const contactEmail = "info@michaelgeorgesinger.com";
const contactHref = `mailto:${contactEmail}`;
const youtubeChannel = "https://www.youtube.com/@MichaelGeorge74";

interface RawVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  tags: string[];
  viewCount: number;
}

function toCard(v: RawVideo): VideoCardData {
  return {
    id: v.id,
    title: cleanTitle(v.title),
    year: formatYear(v.publishedAt),
    thumbnail: v.thumbnail,
    url: watchUrl(v.id),
    tags: v.tags ?? [],
    views: v.viewCount ?? 0,
    publishedAt: v.publishedAt,
  };
}

async function loadCards(): Promise<VideoCardData[]> {
  let raw: RawVideo[] = [];
  try {
    // Lazy import so the Cloudflare-only `cloudflare:workers` dependency isn't
    // pulled into module load (keeps the Node-based render test working; it
    // simply falls back to the seed below).
    const { getAllVideos } = await import("./lib/videos-repo");
    const rows = await getAllVideos();
    if (rows.length) raw = rows as unknown as RawVideo[];
  } catch {
    // D1 binding/table not available (e.g. local dev before migration) — seed below
  }
  if (raw.length === 0) raw = seed as unknown as RawVideo[];
  return raw.map(toCard);
}

export default async function Home() {
  const cards = await loadCards();
  const featured = cards[0];

  return (
    <main>
      <section className="hero" id="top">
        <div className="heroPhoto" aria-hidden="true" />
        <div className="heroOverlay" />
        <header className="siteHeader">
          <a className="brand" href="#top" aria-label="Michael George home">
            Michael George
          </a>
          <nav aria-label="Primary navigation">
            <a href="#videos">Videos</a>
            <a href="#dates">Dates</a>
            <a href="#socials">Socials</a>
            <a href={contactHref}>Contact</a>
          </nav>
        </header>

        <div className="heroContent">
          <p className="eyebrow">Assyrian Chaldean singer</p>
          <h1>Michael George</h1>
          <p className="lede">
            Official home for music videos, social updates, and live appearance
            information from Michael George.
          </p>
          <div className="heroActions" aria-label="Featured actions">
            <a className="button primary" href={youtubeChannel} {...ext}>
              Watch on YouTube
            </a>
            <a className="button secondary" href="#dates">
              Live dates
            </a>
            <a className="button secondary" href={contactHref}>
              Contact
            </a>
          </div>
        </div>
      </section>

      <section className="socialStrip" id="socials" aria-label="Official social links">
        {socialLinks.map((link) => (
          <a key={link.label} href={link.href} className="socialLink" {...ext}>
            <span className={`socialIcon ${link.iconClass}`} aria-hidden="true" />
            <span className="socialText">{link.label}</span>
            <small>{link.note}</small>
          </a>
        ))}
      </section>

      {featured && (
        <section className="featureBand">
          <div className="featureCopy">
            <p className="eyebrow dark">Latest release</p>
            <h2>{featured.title}</h2>
            <p>
              The newest upload on Michael&apos;s official channel leads the page,
              with the rest of the video catalog close behind for fast listening.
            </p>
            <a className="textLink" href={featured.url} {...ext}>
              Play the latest video
            </a>
          </div>
          <a
            className="featureImage"
            href={featured.url}
            aria-label={`Watch ${featured.title} on YouTube`}
            {...ext}
          >
            <img src={featured.thumbnail} alt={`${featured.title} video thumbnail`} />
          </a>
        </section>
      )}

      <section className="videoSection" id="videos">
        <div className="sectionIntro">
          <p className="eyebrow dark">Watch</p>
          <h2>Music Videos</h2>
          <p>
            A quick path into the official YouTube catalog, styled like a record
            wall so fans can move from one song to the next.
          </p>
        </div>
        <VideoBrowser videos={cards} />
      </section>

      <section className="datesBand" id="dates">
        <div>
          <p className="eyebrow dark">Live</p>
          <h2>Tour and Appearance Dates</h2>
          <p>
            Upcoming public dates will live here. Until the calendar is
            confirmed, email {contactEmail} for booking inquiries, appearance
            details, and other official updates.
          </p>
        </div>
        <a className="button primary darkButton" href={contactHref}>
          Email booking
        </a>
      </section>

      <section className="profileBand">
        <img src="/media/michael-facebook-profile.jpg" alt="Michael George portrait" />
        <div>
          <p className="eyebrow dark">Connect</p>
          <h2>Official Channels</h2>
          <p>
            The homepage keeps every official destination one tap away: YouTube,
            Instagram, Facebook, Qeenatha, TikTok, and direct email.
          </p>
          <div className="miniLinks">
            {socialLinks.map((link) => (
              <a key={link.label} href={link.href} {...ext}>
                <span className={`miniSocialIcon ${link.iconClass}`} aria-hidden="true" />
                {link.label}
              </a>
            ))}
            <a href={contactHref}>{contactEmail}</a>
          </div>
        </div>
      </section>
    </main>
  );
}

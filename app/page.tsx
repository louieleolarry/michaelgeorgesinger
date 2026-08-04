const socialLinks = [
  {
    label: "YouTube",
    href: "https://www.youtube.com/@MichaelGeorge74",
    note: "Official videos",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/michaelgeorge74/",
    note: "Photos and clips",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/michael.george.50702/",
    note: "Community updates",
  },
  {
    label: "Qeenatha",
    href: "https://qeenatha.com/artist/4568",
    note: "Music profile",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@michael.george.official",
    note: "Short videos",
  },
];

const contactEmail = "info@michaelgeorgesinger.com";
const contactHref = `mailto:${contactEmail}`;

const videos = [
  {
    title: "Michael George (DLALY)",
    year: "2026",
    image: "/media/video-dlaly.jpg",
    href: "https://www.youtube.com/watch?v=lkWx6CgbHlI",
  },
  {
    title: "T'Khoron Yomaneh",
    year: "2026",
    image: "/media/video-tkhoron.jpg",
    href: "https://www.youtube.com/watch?v=NgYro4IlBqI",
  },
  {
    title: "Khliminwa",
    year: "2025",
    image: "/media/video-khliminwa.jpg",
    href: "https://www.youtube.com/watch?v=od407Hy3YBw",
  },
  {
    title: "Brata",
    year: "2025",
    image: "/media/video-brata.jpg",
    href: "https://www.youtube.com/watch?v=x_VeL_a7qx8",
  },
  {
    title: "Gulbareh",
    year: "2025",
    image: "/media/video-gulbareh.jpg",
    href: "https://www.youtube.com/watch?v=iP-t_q3rBNE",
  },
  {
    title: "Keka",
    year: "2025",
    image: "/media/video-keka.jpg",
    href: "https://www.youtube.com/watch?v=BS8Su7Az_-U",
  },
];

export default function Home() {
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
            <a className="button primary" href="https://www.youtube.com/@MichaelGeorge74">
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
          <a key={link.label} href={link.href} className="socialLink">
            <span>{link.label}</span>
            <small>{link.note}</small>
          </a>
        ))}
      </section>

      <section className="featureBand">
        <div className="featureCopy">
          <p className="eyebrow dark">Latest release</p>
          <h2>DLALY</h2>
          <p>
            The newest upload on Michael&apos;s official channel leads the page,
            with the rest of the video catalog close behind for fast listening.
          </p>
          <a className="textLink" href="https://www.youtube.com/watch?v=lkWx6CgbHlI">
            Play the latest video
          </a>
        </div>
        <a
          className="featureImage"
          href="https://www.youtube.com/watch?v=lkWx6CgbHlI"
          aria-label="Watch Michael George DLALY on YouTube"
        >
          <img src="/media/video-dlaly.jpg" alt="Michael George DLALY video thumbnail" />
        </a>
      </section>

      <section className="videoSection" id="videos">
        <div className="sectionIntro">
          <p className="eyebrow dark">Watch</p>
          <h2>Music Videos</h2>
          <p>
            A quick path into the official YouTube catalog, styled like a record
            wall so fans can move from one song to the next.
          </p>
        </div>
        <div className="videoGrid">
          {videos.map((video) => (
            <a className="videoCard" key={video.href} href={video.href}>
              <img src={video.image} alt={`${video.title} video thumbnail`} />
              <span className="videoMeta">{video.year}</span>
              <strong>{video.title}</strong>
            </a>
          ))}
        </div>
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
              <a key={link.label} href={link.href}>
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

import type { Metadata } from "next";
import "./globals.css";

const GTM_ID = "GTM-ML856GSR";
const gtmInline = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`;

export const metadata: Metadata = {
  metadataBase: new URL("https://michaelgeorgesinger.com"),
  title: "Michael George | Official Music",
  description:
    "Official music home for Michael George with videos, social links, and live appearance updates.",
  openGraph: {
    title: "Michael George | Official Music",
    description:
      "Watch Michael George videos and find his official YouTube, Instagram, Facebook, Qeenatha, and TikTok links.",
    url: "https://michaelgeorgesinger.com",
    siteName: "Michael George",
    images: [
      {
        url: "/media/michael-facebook-profile.jpg",
        width: 719,
        height: 720,
        alt: "Michael George portrait",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Michael George | Official Music",
    description:
      "Official videos, social links, and live appearance updates from Michael George.",
    images: ["/media/michael-facebook-profile.jpg"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        <script dangerouslySetInnerHTML={{ __html: gtmInline }} />
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}

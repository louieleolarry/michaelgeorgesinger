import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}

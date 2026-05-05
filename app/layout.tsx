import type { Metadata, Viewport } from "next";
import "./globals.css";
import CookieBanner from "./components/CookieBanner";
import BackToTop from "./components/BackToTop";
import GoogleAnalytics from "./components/GoogleAnalytics";

export const metadata: Metadata = {
  title: "VinVault — Curated Automotive Registry",
  description: "The definitive record of the world's most special, limited, and collectible automobiles. Every chassis documented. Every history preserved.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <head>
        <GoogleAnalytics />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <CookieBanner />
        <BackToTop />
      </body>
    </html>
  );
}

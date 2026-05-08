import type { Metadata, Viewport } from "next";
import "./globals.css";
import CookieBanner from "./components/CookieBanner";
import BackToTop from "./components/BackToTop";
import GoogleAnalytics from "./components/GoogleAnalytics";

export const metadata: Metadata = {
  metadataBase: new URL('https://www.vinvault.net'),
  title: {
    default: 'VinVault — Curated Automotive Registry',
    template: '%s | VinVault Registry',
  },
  description: "The definitive registry for the world's most special, limited, and collectible automobiles. Community-verified chassis records. Every VIN documented. Every history preserved.",
  keywords: ['classic car registry', 'Ferrari 288 GTO', 'chassis number', 'VIN lookup', 'rare cars', 'collector cars', 'automotive registry', 'car spotting'],
  authors: [{ name: 'VinVault' }],
  creator: 'VinVault',
  publisher: 'VinVault',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.vinvault.net',
    siteName: 'VinVault Registry',
    title: 'VinVault — Curated Automotive Registry',
    description: "The definitive registry for the world's most special, limited, and collectible automobiles. Community-verified chassis records.",
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'VinVault — Curated Automotive Registry',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VinVault — Curated Automotive Registry',
    description: "The definitive registry for the world's most special, limited, and collectible automobiles.",
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://www.vinvault.net',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || '',
  },
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

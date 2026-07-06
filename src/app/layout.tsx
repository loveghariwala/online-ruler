import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Real Online Ruler";

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: `Online Ruler — Free Accurate Ruler in cm, mm & Inches | ${siteName}`,
  description:
    "Free online ruler to measure in inches, cm, and mm at actual size. Calibrate for your screen, add guide lines, and measure real-world sizes — no download needed.",
  keywords: [
    "online ruler",
    "cm in ruler",
    "online ruler in cm",
    "online measuring tape",
    "online ruler inches",
    "real size ruler",
    "ruler actual size",
    "mm ruler online",
    "millimeter ruler online",
    "actual ruler",
    "virtual ruler",
    "scale ruler online",
    "centimeter ruler online",
    "inch tape online",
    "metric ruler online",
    "virtual ruler inches",
    "vertical ruler online",
    "online ruler for phone",
    "cm ruler measurements",
    "6 inch ruler online",
    "show me a millimeter ruler",
    "realonlineruler",
    "real online ruler",
  ],
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: `Online Ruler — Free Accurate Ruler in cm, mm & Inches | ${siteName}`,
    description:
      "Measure anything on your screen with a calibrated, real-size ruler. Supports centimeters, millimeters, and inches. 100% free, 100% private.",
    type: "website",
    locale: "en_US",
    siteName: siteName,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 1200,
        alt: "RealOnlineRuler UI Layout Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Online Ruler — Free Accurate Ruler in cm, mm & Inches | ${siteName}`,
    description:
      "Free online ruler tool. Calibrate your screen and measure objects accurately in cm, mm, and inches.",
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}

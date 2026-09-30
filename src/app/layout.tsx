import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Shahzad Brands | Premium Garments",
    template: "%s | Shahzad Brands",
  },
  description:
    "Shop premium fashion and garments at Shahzad Brands — quality fabrics, timeless style, delivered across Pakistan.",
  keywords: ["Shahzad Brands", "garments", "fashion", "Lahore", "clothing"],
  openGraph: {
    siteName: "Shahzad Brands",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

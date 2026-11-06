import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://omarh.dev"),
  title: "Omar Hagaley — You Crossed the Internet to Get Here",
  description: "See the real browser trace behind your visit, then break a simulated distributed system and watch it recover.",
  openGraph: {
    title: "You Crossed the Internet to Get Here",
    description: "A live browser trace and distributed-systems failure lab by Omar Hagaley.",
    url: "/",
    siteName: "Omar Hagaley",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "You crossed the internet to get here — a live browser trace by Omar Hagaley.",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "You Crossed the Internet to Get Here",
    description: "A live browser trace and distributed-systems failure lab by Omar Hagaley.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

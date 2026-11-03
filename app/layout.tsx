import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://nextprod-neon.vercel.app"),
  title: "Faultline — Distributed Systems Failure Lab",
  description: "Break a simulated distributed cluster and watch queues, retries, replication, and recovery respond in real time.",
  openGraph: {
    title: "Faultline — Distributed Systems Failure Lab",
    description: "Break a simulated distributed cluster and watch queues, retries, replication, and recovery respond in real time.",
    url: "/",
    siteName: "Faultline",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Faultline — Break the cluster. Watch it recover.",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Faultline — Distributed Systems Failure Lab",
    description: "Break a simulated distributed cluster and watch queues, retries, replication, and recovery respond in real time.",
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

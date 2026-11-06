import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://omarh.dev"),
  title: "Omar's Workbench — Omar Hagaley",
  description: "Pick up an object and explore the systems, desktop apps, research, and applied-AI projects Omar Hagaley is building.",
  openGraph: {
    title: "Omar's Workbench",
    description: "Pick something up. Every object is a real project, experiment, or piece of research.",
    url: "/",
    siteName: "Omar's Workbench",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Omar's Workbench — pick something up.",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Omar's Workbench",
    description: "Pick something up. Every object is a real project, experiment, or piece of research.",
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

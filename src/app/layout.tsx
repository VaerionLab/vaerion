import type { Metadata } from "next";
import { Instrument_Sans, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";
// Constitutional binding consumption (Constitution 2.7; 1.3):
// generated token bindings + the implementation stylesheets, which contain
// var() references only. The generated file is read-only (F-005).
import "../../generated/css/vaerion-tokens.css";
import "../vaerion/primitives/primitives.css";
import "../vaerion/rendering/rendering.css";
import { Toaster } from "@/components/ui/toaster";

// Platform font provisioning for the two registered voices (VS §2.1).
// Berkeley Mono is commercial and unprovisioned; the registered fallback
// faces are loaded here and bound through the provision hooks emitted by
// the generated CSS binding (--vx-provision-machine / --vx-provision-human).
const provisionMachine = Spline_Sans_Mono({
  variable: "--vx-provision-machine",
  subsets: ["latin"],
});
const provisionHuman = Instrument_Sans({
  variable: "--vx-provision-human",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vaerion.dev"),
  title: "Vaerion — The verification layer for AI agents",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  description:
    "Build AI systems that can explain what happened, prove what was allowed, and verify every decision. Hash-chained journals, fail-closed governance, deterministic execution — local-first, zero telemetry.",
  keywords: [
    "Vaerion",
    "AI agents",
    "trust infrastructure",
    "governance",
    "receipts",
    "verification",
    "local-first",
    "deterministic",
    "reproducible builds",
    "zero telemetry",
  ],
  authors: [{ name: "Auren" }],
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon-32.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Vaerion — The verification layer for AI agents",
    description:
      "Build AI systems that can explain what happened, prove what was allowed, and verify every decision. Immutable journals · fail-closed governance · deterministic execution · zero telemetry.",
    url: "/",
    siteName: "Vaerion",
    images: ["/og-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vaerion — The verification layer for AI agents",
    description:
      "Immutable journals · fail-closed governance · deterministic execution · zero telemetry.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body
        className={`${provisionMachine.variable} ${provisionHuman.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

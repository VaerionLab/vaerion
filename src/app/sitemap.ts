import type { MetadataRoute } from "next";

/**
 * Sitemap of record for the Vaerion launch site.
 *
 * URLs use the canonical of record (https://vaerion.vercel.app —
 * consistent with layout metadataBase and OG declarations). When the
 * vaerion.dev domain connects, this URL and metadataBase flip together.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://vaerion.vercel.app",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}

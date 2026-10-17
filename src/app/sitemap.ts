import type { MetadataRoute } from "next";

/**
 * Sitemap of record for the Vaerion launch site.
 *
 * URLs use the registered host of record (vaerion.vercel.app — consistent
 * with the layout metadataBase and OG declarations). vaerion.dev remains
 * unregistered; the flip-back is documented in the launch-kit domain
 * decision when that host ever goes live.
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

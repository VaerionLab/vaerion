import type { MetadataRoute } from "next";

/**
 * Sitemap of record for the Vaerion launch site.
 *
 * URLs use the domain of record (vaerion.dev — consistent with the
 * layout metadataBase and OG declarations). Until the domain is
 * connected, the site remains fully reachable and indexable at the
 * documented fallback: https://vaerion.vercel.app.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://vaerion.dev",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}

import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { allSlugs } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: site.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...allSlugs().map((slug) => ({
      url: `${site.url}/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}

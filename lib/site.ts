/**
 * Single source of truth for brand + site-wide constants.
 * Changing the name/domain here cascades everywhere (nav, SEO, JSON-LD, OG).
 */
export const site = {
  name: "Patra",
  /** Patra (पत्र) means "document/letter" — short, pan-Indian, and on-theme. */
  tagline: "Every PDF tool, in your browser.",
  description:
    "A full set of PDF tools — merge, split, compress, convert, edit, sign and protect. The everyday tools run entirely in your browser, so your files never leave your device.",
  // Canonical origin — drives canonicals, OG image URLs, sitemap, robots and
  // JSON-LD @ids, so it must match where the site is actually served and indexed.
  // Swap to a custom domain (e.g. patra.tools) once it's registered and pointed here.
  url: "https://pdf-claudy.vercel.app",
  locale: "en_US",
  twitter: "@patratools",
  email: "hello@patra.tools",
} as const;

export type Site = typeof site;

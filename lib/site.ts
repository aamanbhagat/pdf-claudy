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
  // Update at launch when a domain is registered (e.g. patra.tools / patra.in).
  url: "https://patra.tools",
  locale: "en_US",
  twitter: "@patratools",
  email: "hello@patra.tools",
} as const;

export type Site = typeof site;

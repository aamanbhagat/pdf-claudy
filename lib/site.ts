/**
 * Single source of truth for brand + site-wide constants.
 * Changing the name/domain here cascades everywhere (nav, SEO, JSON-LD, OG).
 */
export const site = {
  name: "Quire",
  /** A quire is a set of folded sheets — the unit of paper a book is bound from. */
  tagline: "Every PDF tool, in your browser.",
  description:
    "A full set of PDF tools — merge, split, compress, convert, edit, sign and protect. The everyday tools run entirely in your browser, so your files never leave your device.",
  // Update at launch when a domain is registered.
  url: "https://quire.tools",
  locale: "en_US",
  twitter: "@quiretools",
  email: "hello@quire.tools",
} as const;

export type Site = typeof site;

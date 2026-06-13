export type CategoryId =
  | "organize"
  | "optimize"
  | "convert-to"
  | "convert-from"
  | "edit"
  | "security"
  | "intelligence";

export interface Category {
  id: CategoryId;
  /** Title-case label used in headings and chips. */
  label: string;
  /** Short blurb for the category, used on the homepage filter + SEO. */
  blurb: string;
  /** Wayfinding accent — drives the tool icon duotone + tag color. */
  accent: string;
  /** Soft tint of the accent for backgrounds. */
  tint: string;
}

/** Ordered — this order is used in the mega-menu columns and homepage grouping. */
export const categories: Category[] = [
  {
    id: "organize",
    label: "Organize",
    blurb: "Reshape a document: merge, split, reorder and trim pages.",
    accent: "#F0A12E",
    tint: "#FDF3E2",
  },
  {
    id: "optimize",
    label: "Optimize",
    blurb: "Shrink, repair and make scanned PDFs searchable.",
    accent: "#18A06A",
    tint: "#E5F5EE",
  },
  {
    id: "convert-to",
    label: "Convert to PDF",
    blurb: "Turn images, Office files and web pages into clean PDFs.",
    accent: "#5A48F5",
    tint: "#ECE9FE",
  },
  {
    id: "convert-from",
    label: "Convert from PDF",
    blurb: "Export a PDF back into images or editable Office formats.",
    accent: "#0CA5B4",
    tint: "#E2F6F8",
  },
  {
    id: "edit",
    label: "Edit",
    blurb: "Rotate, crop, number, watermark and mark up pages.",
    accent: "#E5484D",
    tint: "#FCEAEA",
  },
  {
    id: "security",
    label: "Security",
    blurb: "Lock, unlock, redact, sign and compare documents.",
    accent: "#3E63DD",
    tint: "#E8EDFC",
  },
  {
    id: "intelligence",
    label: "Intelligence",
    blurb: "Summarize and translate PDFs with AI.",
    accent: "#8B3DF5",
    tint: "#F1E8FE",
  },
];

export const categoryMap: Record<CategoryId, Category> = Object.fromEntries(
  categories.map((c) => [c.id, c]),
) as Record<CategoryId, Category>;

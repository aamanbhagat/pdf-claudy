import type { CategoryId } from "./categories";

/** Where the work happens. `browser` = 100% client-side, no upload. */
export type Engine = "browser" | "server" | "ai";

export interface HowToStep {
  title: string;
  body: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface Tool {
  slug: string;
  name: string;
  category: CategoryId;
  engine: Engine;
  /** One line shown on the homepage card. */
  tagline: string;
  /** Longer intro shown on the tool landing page hero. */
  description: string;
  /** Search keywords — feed page metadata + on-site search. */
  keywords: string[];
  /** Optional status pill. */
  badge?: "new" | "beta";
  howto?: HowToStep[];
  faqs?: Faq[];
  /** Related tool slugs for internal linking. */
  related?: string[];
}

const privacyFaq: Faq = {
  q: "Are my files uploaded to a server?",
  a: "No. This tool runs entirely in your browser using WebAssembly. Your document is processed on your own device and never leaves it — there is nothing to upload and nothing for us to store.",
};

export const tools: Tool[] = [
  // ─────────────────────────── ORGANIZE ───────────────────────────
  {
    slug: "merge-pdf",
    name: "Merge PDF",
    category: "organize",
    engine: "browser",
    tagline: "Combine PDFs in the order you want into one document.",
    description:
      "Drag your PDFs into the order that makes sense, then join them into a single file. Everything happens in your browser, so even large merges are instant and private.",
    keywords: ["merge pdf", "combine pdf", "join pdf", "pdf merger"],
    howto: [
      { title: "Add your PDFs", body: "Drop in two or more PDF files, or pick them from your device." },
      { title: "Set the order", body: "Drag the pages or files to arrange them exactly how you want." },
      { title: "Merge & download", body: "Press Merge and your combined PDF downloads straight away." },
    ],
    faqs: [
      { q: "How many PDFs can I merge?", a: "As many as your device's memory allows — there is no fixed limit because the work runs locally." },
      privacyFaq,
    ],
    related: ["split-pdf", "organize-pdf", "compress-pdf"],
  },
  {
    slug: "split-pdf",
    name: "Split PDF",
    category: "organize",
    engine: "browser",
    tagline: "Separate one page or a whole set for easy conversion.",
    description:
      "Break a PDF into single pages or custom page ranges, and download them individually or bundled in a ZIP — all without uploading a thing.",
    keywords: ["split pdf", "separate pdf", "extract pages", "pdf splitter"],
    howto: [
      { title: "Open your PDF", body: "Drop in the file you want to divide." },
      { title: "Choose ranges", body: "Split every page, or define custom ranges to keep together." },
      { title: "Download", body: "Get your split PDFs individually or as a single ZIP." },
    ],
    faqs: [privacyFaq],
    related: ["merge-pdf", "extract-pages", "remove-pages"],
  },
  {
    slug: "remove-pages",
    name: "Remove Pages",
    category: "organize",
    engine: "browser",
    tagline: "Delete the pages you don't need from a PDF.",
    description:
      "Preview every page, select the ones to drop, and export a clean PDF with just the pages you want to keep.",
    keywords: ["remove pages pdf", "delete pdf pages", "pdf page remover"],
    related: ["extract-pages", "split-pdf", "organize-pdf"],
  },
  {
    slug: "extract-pages",
    name: "Extract Pages",
    category: "organize",
    engine: "browser",
    tagline: "Pull selected pages out into a new PDF.",
    description:
      "Cherry-pick the pages you need and save them as a brand new document, leaving the original untouched.",
    keywords: ["extract pdf pages", "pdf page extractor", "save pdf pages"],
    related: ["split-pdf", "remove-pages", "merge-pdf"],
  },
  {
    slug: "organize-pdf",
    name: "Organize PDF",
    category: "organize",
    engine: "browser",
    tagline: "Reorder, rotate and delete pages on a visual board.",
    description:
      "See every page as a thumbnail, then drag to reorder, rotate, or remove pages until the document reads exactly right.",
    keywords: ["organize pdf", "reorder pdf pages", "rearrange pdf", "sort pdf pages"],
    related: ["merge-pdf", "remove-pages", "rotate-pdf"],
  },
  {
    slug: "scan-to-pdf",
    name: "Scan to PDF",
    category: "organize",
    engine: "browser",
    tagline: "Capture documents with your camera into a PDF.",
    description:
      "Use your phone or laptop camera to capture pages, then bundle them into a tidy multi-page PDF without any app install.",
    keywords: ["scan to pdf", "camera to pdf", "document scanner", "scan documents"],
    related: ["jpg-to-pdf", "ocr-pdf", "compress-pdf"],
  },

  // ─────────────────────────── OPTIMIZE ───────────────────────────
  {
    slug: "compress-pdf",
    name: "Compress PDF",
    category: "optimize",
    engine: "browser",
    tagline: "Reduce file size while keeping the best quality.",
    description:
      "Downsample images and strip waste to make a PDF email-friendly. The standard pass runs in your browser; a maximum-strength server pass is coming for the heaviest files.",
    keywords: ["compress pdf", "reduce pdf size", "shrink pdf", "pdf compressor"],
    related: ["merge-pdf", "pdf-to-jpg", "repair-pdf"],
  },
  {
    slug: "repair-pdf",
    name: "Repair PDF",
    category: "optimize",
    engine: "server",
    tagline: "Recover data from a damaged or corrupt PDF.",
    description:
      "Rebuild the internal structure of a broken PDF and recover as much readable content as possible.",
    keywords: ["repair pdf", "fix corrupt pdf", "recover pdf", "pdf repair tool"],
    related: ["compress-pdf", "pdf-to-pdfa"],
  },
  {
    slug: "ocr-pdf",
    name: "OCR PDF",
    category: "optimize",
    engine: "browser",
    badge: "beta",
    tagline: "Make scanned PDFs searchable and selectable.",
    description:
      "Run optical character recognition over scanned pages to add a real text layer you can search, select and copy.",
    keywords: ["ocr pdf", "searchable pdf", "scanned pdf to text", "recognize text pdf"],
    related: ["scan-to-pdf", "pdf-to-word", "compress-pdf"],
  },

  // ─────────────────────────── CONVERT TO PDF ───────────────────────────
  {
    slug: "jpg-to-pdf",
    name: "JPG to PDF",
    category: "convert-to",
    engine: "browser",
    tagline: "Turn JPG and PNG images into a single PDF.",
    description:
      "Combine photos and screenshots into one PDF, with control over orientation, margins and page size — processed locally.",
    keywords: ["jpg to pdf", "image to pdf", "png to pdf", "photo to pdf"],
    howto: [
      { title: "Add images", body: "Drop in JPG or PNG files in any quantity." },
      { title: "Arrange & adjust", body: "Reorder images and set page size, orientation and margin." },
      { title: "Create PDF", body: "Download a single PDF containing every image." },
    ],
    faqs: [privacyFaq],
    related: ["pdf-to-jpg", "scan-to-pdf", "merge-pdf"],
  },
  {
    slug: "word-to-pdf",
    name: "Word to PDF",
    category: "convert-to",
    engine: "server",
    tagline: "Convert DOC and DOCX files to PDF.",
    description:
      "Make Word documents easy to read and share by converting them to pixel-faithful PDFs.",
    keywords: ["word to pdf", "docx to pdf", "doc to pdf", "convert word"],
    related: ["pdf-to-word", "powerpoint-to-pdf", "excel-to-pdf"],
  },
  {
    slug: "powerpoint-to-pdf",
    name: "PowerPoint to PDF",
    category: "convert-to",
    engine: "server",
    tagline: "Convert PPT and PPTX slideshows to PDF.",
    description: "Turn presentations into PDFs that open and print the same way everywhere.",
    keywords: ["powerpoint to pdf", "ppt to pdf", "pptx to pdf", "slides to pdf"],
    related: ["pdf-to-powerpoint", "word-to-pdf", "excel-to-pdf"],
  },
  {
    slug: "excel-to-pdf",
    name: "Excel to PDF",
    category: "convert-to",
    engine: "server",
    tagline: "Convert XLS and XLSX spreadsheets to PDF.",
    description: "Lock spreadsheet layouts in place by converting them to clean, shareable PDFs.",
    keywords: ["excel to pdf", "xlsx to pdf", "xls to pdf", "spreadsheet to pdf"],
    related: ["pdf-to-excel", "word-to-pdf", "powerpoint-to-pdf"],
  },
  {
    slug: "html-to-pdf",
    name: "HTML to PDF",
    category: "convert-to",
    engine: "server",
    tagline: "Convert a web page or URL into a PDF.",
    description: "Capture any web page as a high-fidelity PDF, rendered by a real browser engine.",
    keywords: ["html to pdf", "url to pdf", "webpage to pdf", "website to pdf"],
    related: ["word-to-pdf", "compress-pdf"],
  },

  // ─────────────────────────── CONVERT FROM PDF ───────────────────────────
  {
    slug: "pdf-to-jpg",
    name: "PDF to JPG",
    category: "convert-from",
    engine: "browser",
    tagline: "Turn each PDF page into a JPG image.",
    description:
      "Render every page to a crisp image at the resolution you choose, then download them individually or as a ZIP — all in the browser.",
    keywords: ["pdf to jpg", "pdf to image", "pdf to png", "convert pdf to jpg"],
    howto: [
      { title: "Open your PDF", body: "Drop in the document you want to turn into images." },
      { title: "Pick quality", body: "Choose the resolution and image format (JPG or PNG)." },
      { title: "Download images", body: "Save one image per page, or grab them all in a ZIP." },
    ],
    faqs: [privacyFaq],
    related: ["jpg-to-pdf", "compress-pdf", "pdf-to-word"],
  },
  {
    slug: "pdf-to-word",
    name: "PDF to Word",
    category: "convert-from",
    engine: "server",
    tagline: "Convert a PDF into an editable DOCX.",
    description: "Get an editable Word document back from a PDF, with layout and text preserved as closely as possible.",
    keywords: ["pdf to word", "pdf to docx", "convert pdf to word", "editable pdf"],
    related: ["word-to-pdf", "ocr-pdf", "pdf-to-excel"],
  },
  {
    slug: "pdf-to-powerpoint",
    name: "PDF to PowerPoint",
    category: "convert-from",
    engine: "server",
    tagline: "Convert a PDF into an editable PPTX.",
    description: "Rebuild a PDF as editable presentation slides you can keep working on.",
    keywords: ["pdf to powerpoint", "pdf to pptx", "pdf to slides", "convert pdf to ppt"],
    related: ["powerpoint-to-pdf", "pdf-to-word"],
  },
  {
    slug: "pdf-to-excel",
    name: "PDF to Excel",
    category: "convert-from",
    engine: "server",
    tagline: "Pull tables from a PDF into a spreadsheet.",
    description: "Extract tabular data from a PDF into editable XLSX rows and columns.",
    keywords: ["pdf to excel", "pdf to xlsx", "pdf table to excel", "extract pdf tables"],
    related: ["excel-to-pdf", "pdf-to-word"],
  },
  {
    slug: "pdf-to-pdfa",
    name: "PDF to PDF/A",
    category: "convert-from",
    engine: "server",
    tagline: "Convert to the ISO archival PDF/A format.",
    description: "Transform a PDF into PDF/A, the ISO-standardized format made for long-term archiving.",
    keywords: ["pdf to pdfa", "pdf/a", "archive pdf", "iso pdf"],
    related: ["repair-pdf", "compress-pdf"],
  },

  // ─────────────────────────── EDIT ───────────────────────────
  {
    slug: "rotate-pdf",
    name: "Rotate PDF",
    category: "edit",
    engine: "browser",
    tagline: "Rotate one page or every page at once.",
    description:
      "Fix sideways or upside-down scans by rotating pages 90° at a time, individually or in bulk, then save the corrected PDF.",
    keywords: ["rotate pdf", "turn pdf pages", "fix pdf orientation", "pdf rotation"],
    howto: [
      { title: "Open your PDF", body: "Drop in the document with pages to rotate." },
      { title: "Turn pages", body: "Rotate selected pages or all pages, left or right." },
      { title: "Save", body: "Download the PDF with the new orientation baked in." },
    ],
    faqs: [privacyFaq],
    related: ["organize-pdf", "crop-pdf", "merge-pdf"],
  },
  {
    slug: "add-page-numbers",
    name: "Add Page Numbers",
    category: "edit",
    engine: "browser",
    tagline: "Stamp page numbers anywhere on a PDF.",
    description:
      "Add page numbers with control over position, format, font size and starting number — applied locally to every page.",
    keywords: ["add page numbers pdf", "number pdf pages", "pdf pagination"],
    related: ["add-watermark", "edit-pdf", "organize-pdf"],
  },
  {
    slug: "add-watermark",
    name: "Add Watermark",
    category: "edit",
    engine: "browser",
    tagline: "Stamp text or an image over your pages.",
    description:
      "Overlay a text or image watermark with adjustable position, transparency, rotation and size across the whole document.",
    keywords: ["add watermark pdf", "pdf watermark", "stamp pdf", "draft watermark"],
    related: ["add-page-numbers", "edit-pdf", "protect-pdf"],
  },
  {
    slug: "crop-pdf",
    name: "Crop PDF",
    category: "edit",
    engine: "browser",
    tagline: "Trim margins or crop a selected area.",
    description: "Draw a crop box to remove margins or zoom in on a region, then apply it to one page or the whole file.",
    keywords: ["crop pdf", "trim pdf margins", "pdf crop tool", "cut pdf"],
    related: ["rotate-pdf", "organize-pdf", "edit-pdf"],
  },
  {
    slug: "edit-pdf",
    name: "Edit PDF",
    category: "edit",
    engine: "browser",
    tagline: "Add text, images, shapes and annotations.",
    description:
      "Mark up a PDF directly: add text and images, draw shapes and highlights, and place freehand annotations — all in a fast in-browser editor.",
    keywords: ["edit pdf", "pdf editor", "annotate pdf", "write on pdf", "add text to pdf"],
    related: ["add-watermark", "sign-pdf", "pdf-forms"],
  },
  {
    slug: "pdf-forms",
    name: "PDF Forms",
    category: "edit",
    engine: "browser",
    tagline: "Fill in and flatten interactive PDF forms.",
    description:
      "Detect form fields automatically, fill text boxes, checkboxes and dropdowns, then flatten the result so it can't be changed.",
    keywords: ["fill pdf form", "pdf forms", "fillable pdf", "flatten pdf form"],
    related: ["edit-pdf", "sign-pdf", "add-watermark"],
  },

  // ─────────────────────────── SECURITY ───────────────────────────
  {
    slug: "unlock-pdf",
    name: "Unlock PDF",
    category: "security",
    engine: "browser",
    tagline: "Remove a known password from a PDF.",
    description:
      "Strip password protection from a PDF you have the right to open, so you can use it freely — decrypted on your own device.",
    keywords: ["unlock pdf", "remove pdf password", "decrypt pdf", "pdf password remover"],
    related: ["protect-pdf", "sign-pdf"],
  },
  {
    slug: "protect-pdf",
    name: "Protect PDF",
    category: "security",
    engine: "browser",
    tagline: "Encrypt a PDF with a password.",
    description:
      "Add strong password encryption to a PDF so only people with the password can open it. The encryption runs locally — your password is never sent anywhere.",
    keywords: ["protect pdf", "password protect pdf", "encrypt pdf", "lock pdf"],
    related: ["unlock-pdf", "sign-pdf", "redact-pdf"],
  },
  {
    slug: "sign-pdf",
    name: "Sign PDF",
    category: "security",
    engine: "browser",
    tagline: "Draw or place your signature on a PDF.",
    description:
      "Sign documents yourself by drawing, typing or uploading a signature, then drop it, your initials and the date onto any page.",
    keywords: ["sign pdf", "esign pdf", "pdf signature", "electronic signature"],
    related: ["protect-pdf", "edit-pdf", "pdf-forms"],
  },
  {
    slug: "redact-pdf",
    name: "Redact PDF",
    category: "security",
    engine: "browser",
    tagline: "Permanently black out sensitive content.",
    description:
      "Cover private text and images with redaction boxes and flatten the page so the hidden content cannot be recovered.",
    keywords: ["redact pdf", "black out pdf", "remove sensitive info pdf", "pdf redaction"],
    related: ["protect-pdf", "edit-pdf", "compare-pdf"],
  },
  {
    slug: "compare-pdf",
    name: "Compare PDF",
    category: "security",
    engine: "browser",
    tagline: "See what changed between two PDFs.",
    description:
      "Place two versions side by side and highlight the differences in text and layout so nothing slips past you.",
    keywords: ["compare pdf", "pdf diff", "pdf comparison", "find pdf changes"],
    related: ["redact-pdf", "edit-pdf"],
  },

  // ─────────────────────────── INTELLIGENCE ───────────────────────────
  {
    slug: "ai-summarizer",
    name: "AI Summarizer",
    category: "intelligence",
    engine: "ai",
    badge: "new",
    tagline: "Generate concise summaries of any PDF.",
    description:
      "Get clear summaries and key points from articles, reports and contracts in seconds, powered by a state-of-the-art language model.",
    keywords: ["ai pdf summarizer", "summarize pdf", "pdf summary", "ai document summary"],
    related: ["translate-pdf", "ocr-pdf"],
  },
  {
    slug: "translate-pdf",
    name: "Translate PDF",
    category: "intelligence",
    engine: "ai",
    badge: "new",
    tagline: "Translate a PDF while keeping its layout.",
    description:
      "Translate documents into another language with the formatting and structure kept intact, powered by AI.",
    keywords: ["translate pdf", "pdf translation", "translate document", "ai translate pdf"],
    related: ["ai-summarizer", "ocr-pdf"],
  },
];

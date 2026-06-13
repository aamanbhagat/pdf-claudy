import type { HowToStep, Faq } from "./registry";

/**
 * SEO content (HowTo steps + FAQs) for tools whose registry entry doesn't already
 * carry its own. Kept here so every tool page ships real, unique, indexable
 * content (HowTo + FAQPage rich results) without bloating the registry.
 * Merged over the registry in ./index — registry values win if both exist.
 */
export interface ToolContent {
  howto: HowToStep[];
  faqs: Faq[];
}

// Engine-appropriate privacy answers, reused with tool-specific phrasing below.
const browserPrivacy: Faq = {
  q: "Are my files uploaded to a server?",
  a: "No. This tool runs entirely in your browser, so your document is processed on your own device and never leaves it — there's nothing to upload and nothing for us to store.",
};
const serverPrivacy: Faq = {
  q: "What happens to my file?",
  a: "It's sent over an encrypted connection to our conversion server, processed, and deleted immediately afterwards. We never store, read or share your documents.",
};
const aiPrivacy: Faq = {
  q: "Is my document kept private?",
  a: "Your document is used only to produce the result and isn't stored afterwards.",
};

export const toolContent: Record<string, ToolContent> = {
  // ─────────── ORGANIZE ───────────
  "remove-pages": {
    howto: [
      { title: "Open your PDF", body: "Drop in the PDF you want to clean up — every page appears as a thumbnail." },
      { title: "Select the pages to delete", body: "Click the pages you don't need; select as many as you like." },
      { title: "Download", body: "Export a new PDF containing only the pages you kept." },
    ],
    faqs: [
      { q: "Will my original file be changed?", a: "No. Your original stays untouched — the tool builds a brand-new PDF that contains only the pages you choose to keep." },
      { q: "Can I remove pages from a large PDF?", a: "Yes. Because everything runs on your device, even big documents are handled instantly with no upload or wait." },
      browserPrivacy,
    ],
  },
  "extract-pages": {
    howto: [
      { title: "Open your PDF", body: "Add the document you want to pull pages from." },
      { title: "Pick the pages", body: "Select the individual pages or ranges you want to keep." },
      { title: "Save the new PDF", body: "Download just those pages as a fresh document, leaving the original intact." },
    ],
    faqs: [
      { q: "Does extracting pages reduce quality?", a: "No — pages are copied exactly, with no re-compression, so text and images keep their original quality." },
      { q: "Can I extract non-consecutive pages?", a: "Yes. Select any mix of pages and they're combined, in order, into one new PDF." },
      browserPrivacy,
    ],
  },
  "organize-pdf": {
    howto: [
      { title: "Open your PDF", body: "Drop in your file to see every page on a visual board." },
      { title: "Rearrange, rotate, delete", body: "Drag pages into a new order, rotate any that are sideways, and remove the ones you don't need." },
      { title: "Save", body: "Download the reorganized PDF exactly as it reads on the board." },
    ],
    faqs: [
      { q: "Can I reorder and rotate at the same time?", a: "Yes — reorder by dragging, rotate with a click, and delete pages, all in the same view before exporting." },
      { q: "Is there a page limit?", a: "No. The board handles documents of any length, and it all runs locally in your browser." },
      browserPrivacy,
    ],
  },
  "scan-to-pdf": {
    howto: [
      { title: "Allow camera access", body: "Open the tool and grant camera permission — no app install required." },
      { title: "Capture each page", body: "Snap a photo of every page; each one is added to your document in order." },
      { title: "Save as PDF", body: "Combine all the captures into a single, shareable PDF." },
    ],
    faqs: [
      { q: "Do I need to install an app?", a: "No. Scanning works straight from your phone or laptop browser using the built-in camera." },
      { q: "Can I scan several pages into one PDF?", a: "Yes — keep capturing and every page is appended to the same document." },
      { q: "Are the photos uploaded anywhere?", a: "No. Captured pages are turned into a PDF on your device and never leave it." },
    ],
  },

  // ─────────── OPTIMIZE ───────────
  "compress-pdf": {
    howto: [
      { title: "Add your PDF", body: "Drop in the file you want to shrink." },
      { title: "Compress", body: "Images are downsampled and waste is stripped to cut the size while keeping it readable." },
      { title: "Download", body: "Save the smaller PDF and see exactly how much space you saved." },
    ],
    faqs: [
      { q: "How much smaller will my PDF get?", a: "It depends on the file — image-heavy PDFs often shrink by 50–90%, while text-only files compress less because there's less to remove." },
      { q: "Will compression ruin the quality?", a: "No. The default setting balances size and clarity so text stays crisp and images stay legible." },
      browserPrivacy,
    ],
  },
  "repair-pdf": {
    howto: [
      { title: "Upload the damaged PDF", body: "Add the file that won't open or shows errors." },
      { title: "We rebuild it", body: "Our server reconstructs the PDF's internal structure and recovers as much as it can." },
      { title: "Download", body: "Get a repaired file that opens correctly again." },
    ],
    faqs: [
      { q: "Can every PDF be repaired?", a: "Not always — but the tool recovers as much readable content and structure as possible from most corrupt or truncated files." },
      { q: "Why does repair run on a server?", a: "Deep structural repair needs specialized tooling, so the file is processed on our secure server and deleted right after." },
      serverPrivacy,
    ],
  },
  "ocr-pdf": {
    howto: [
      { title: "Open a scanned PDF", body: "Add a scanned or image-only PDF." },
      { title: "Run OCR", body: "Optical character recognition reads the text on each page." },
      { title: "Download a searchable PDF", body: "Get a PDF with a real text layer you can select, copy and search." },
    ],
    faqs: [
      { q: "Which languages does OCR support?", a: "It recognizes English and many other Latin-script languages out of the box." },
      { q: "Why is OCR marked beta?", a: "Recognition quality depends on scan clarity; we're still tuning accuracy, so results can vary on low-quality scans." },
      browserPrivacy,
    ],
  },

  // ─────────── CONVERT TO PDF ───────────
  "word-to-pdf": {
    howto: [
      { title: "Upload your document", body: "Add a .doc or .docx file." },
      { title: "Convert", body: "We render it to a pixel-faithful PDF on our server." },
      { title: "Download", body: "Get a PDF that looks identical on every device." },
    ],
    faqs: [
      { q: "Will my formatting be preserved?", a: "Yes — fonts, images, tables and layout are kept faithful to the original Word document." },
      { q: "Do both .doc and .docx work?", a: "Yes, both the classic .doc format and the modern .docx format are supported." },
      serverPrivacy,
    ],
  },
  "powerpoint-to-pdf": {
    howto: [
      { title: "Upload your slideshow", body: "Add a .ppt or .pptx file." },
      { title: "Convert", body: "Each slide is rendered to a page in the PDF." },
      { title: "Download", body: "Share a PDF that opens and prints the same everywhere." },
    ],
    faqs: [
      { q: "Are animations included?", a: "PDFs are static, so each slide becomes one page — transitions and animations aren't carried over." },
      { q: "What about speaker notes?", a: "Only the slides themselves are converted, matching how they would print." },
      serverPrivacy,
    ],
  },
  "excel-to-pdf": {
    howto: [
      { title: "Upload your spreadsheet", body: "Add a .xls or .xlsx file." },
      { title: "Convert", body: "Your sheets are laid out and rendered to PDF." },
      { title: "Download", body: "Get a clean, locked-layout PDF." },
    ],
    faqs: [
      { q: "Will all my sheets be included?", a: "Yes — each worksheet is converted in turn into the PDF." },
      { q: "Can I control the page breaks?", a: "The conversion follows your spreadsheet's existing print area and page-break settings." },
      serverPrivacy,
    ],
  },
  "html-to-pdf": {
    howto: [
      { title: "Paste a URL or upload HTML", body: "Enter a web address, or drop in an .html file." },
      { title: "Render", body: "A real Chromium browser engine loads and paints the page." },
      { title: "Download", body: "Save a high-fidelity PDF of the page." },
    ],
    faqs: [
      { q: "Does it render modern CSS and web fonts?", a: "Yes — pages are rendered by a real Chromium engine, so modern layouts, fonts and styling come through faithfully." },
      { q: "Can it capture any URL?", a: "It captures publicly reachable pages; sites behind a login or that block automated browsers may not render fully." },
      serverPrivacy,
    ],
  },

  // ─────────── CONVERT FROM PDF ───────────
  "pdf-to-word": {
    howto: [
      { title: "Upload your PDF", body: "Add the PDF you want to edit in Word." },
      { title: "Convert", body: "We reconstruct the text, layout and images into an editable document." },
      { title: "Download", body: "Open the .docx in Word and keep editing." },
    ],
    faqs: [
      { q: "How accurate is the conversion?", a: "Text and layout are reconstructed closely; very complex or scanned PDFs may need a little cleanup afterwards." },
      { q: "Will the text be editable?", a: "Yes — you get real, editable Word text rather than a flat picture of the page." },
      serverPrivacy,
    ],
  },
  "pdf-to-powerpoint": {
    howto: [
      { title: "Upload your PDF", body: "Add the PDF you want as slides." },
      { title: "Convert", body: "Each page is turned into a slide." },
      { title: "Download", body: "Open the .pptx in PowerPoint or Keynote." },
    ],
    faqs: [
      { q: "How are pages turned into slides?", a: "Each PDF page becomes a full slide, so the deck mirrors the document page-for-page." },
      { q: "Will the text be editable?", a: "Pages are placed as high-resolution images per slide to preserve the exact look; for editable text, use PDF to Word instead." },
      serverPrivacy,
    ],
  },
  "pdf-to-excel": {
    howto: [
      { title: "Upload your PDF", body: "Add a PDF that contains tables." },
      { title: "Convert", body: "We detect tables and rebuild their rows and columns." },
      { title: "Download", body: "Open the .xlsx and work with the data." },
    ],
    faqs: [
      { q: "What kind of PDFs work best?", a: "PDFs with clearly ruled or aligned tables convert best — each detected table becomes rows and columns on a sheet." },
      { q: "What if my PDF has no tables?", a: "Pages without a detectable table fall back to extracted text lines, so no content is lost." },
      serverPrivacy,
    ],
  },
  "pdf-to-pdfa": {
    howto: [
      { title: "Upload your PDF", body: "Add the PDF you want to archive." },
      { title: "Convert to PDF/A", body: "We transform it to the ISO PDF/A standard for long-term storage." },
      { title: "Download", body: "Get an archival-grade PDF/A file." },
    ],
    faqs: [
      { q: "What is PDF/A?", a: "PDF/A is an ISO-standardized version of PDF made for reliable long-term archiving, with all fonts and resources embedded." },
      { q: "Why convert to PDF/A?", a: "Many institutions, courts and archives require PDF/A so that documents render identically decades from now." },
      serverPrivacy,
    ],
  },

  // ─────────── EDIT ───────────
  "add-page-numbers": {
    howto: [
      { title: "Open your PDF", body: "Drop in the document you want to paginate." },
      { title: "Choose position & style", body: "Pick where the numbers go, the format, the font size and the starting number." },
      { title: "Download", body: "Save the PDF with numbers stamped on every page." },
    ],
    faqs: [
      { q: "Can I start numbering from a specific number?", a: "Yes — set any starting number, handy when the PDF continues on from another document." },
      { q: "Can I choose where the numbers appear?", a: "Yes — place them in any corner or centred, at the top or bottom of the page." },
      browserPrivacy,
    ],
  },
  "add-watermark": {
    howto: [
      { title: "Open your PDF", body: "Add the file you want to watermark." },
      { title: "Set your watermark", body: "Type text or add an image, then adjust opacity, angle, size and position." },
      { title: "Download", body: "Save the watermarked PDF." },
    ],
    faqs: [
      { q: "Can I use an image as a watermark?", a: "Yes — add a logo or signature image, or use text, with full control over transparency and rotation." },
      { q: "Is the watermark applied to every page?", a: "Yes — the watermark is stamped across all pages of the document." },
      browserPrivacy,
    ],
  },
  "crop-pdf": {
    howto: [
      { title: "Open your PDF", body: "Drop in the file you want to crop." },
      { title: "Draw the crop box", body: "Drag to mark the area to keep, then apply it to one page or the whole file." },
      { title: "Download", body: "Save the cropped PDF." },
    ],
    faqs: [
      { q: "Can I crop all pages at once?", a: "Yes — apply the same crop box to every page, or crop a single page on its own." },
      { q: "Does cropping delete the hidden content?", a: "Cropping changes the visible page area; to permanently remove content, use the Redact tool instead." },
      browserPrivacy,
    ],
  },
  "edit-pdf": {
    howto: [
      { title: "Open your PDF", body: "Drop in the document you want to mark up." },
      { title: "Add your edits", body: "Place text, images, shapes and highlights anywhere, and drag a handle to resize them." },
      { title: "Download", body: "Export the edited PDF." },
    ],
    faqs: [
      { q: "Can I type and resize text right on the page?", a: "Yes — type text inline on the page and drag a corner handle to resize it; images, shapes and highlights resize too." },
      { q: "Can I edit the text that's already in the PDF?", a: "You can add new text, images, shapes and highlights on top; editing the original embedded text isn't supported." },
      browserPrivacy,
    ],
  },
  "pdf-forms": {
    howto: [
      { title: "Open your form", body: "Drop in a PDF that contains form fields." },
      { title: "Fill it in", body: "Type into text fields, tick checkboxes and choose from dropdowns." },
      { title: "Flatten & download", body: "Save a filled PDF, optionally flattened so it can no longer be changed." },
    ],
    faqs: [
      { q: "Does it detect form fields automatically?", a: "Yes — interactive fields are detected so you can fill them in right in your browser." },
      { q: "What does flattening do?", a: "Flattening bakes your answers into the page so the completed form can be shared without being edited further." },
      browserPrivacy,
    ],
  },

  // ─────────── SECURITY ───────────
  "unlock-pdf": {
    howto: [
      { title: "Upload the locked PDF", body: "Add a password-protected PDF you have the right to open." },
      { title: "Enter the password", body: "Provide the password so it can be removed." },
      { title: "Download", body: "Save a copy with the protection removed." },
    ],
    faqs: [
      { q: "Do I need to know the password?", a: "Yes — this tool removes a password you already know. It can't crack or guess unknown passwords." },
      { q: "Is my password sent anywhere?", a: "No — decryption happens entirely in your browser, so your password and file never leave your device." },
      browserPrivacy,
    ],
  },
  "protect-pdf": {
    howto: [
      { title: "Open your PDF", body: "Add the file you want to secure." },
      { title: "Set a password", body: "Choose a strong password to encrypt the document." },
      { title: "Download", body: "Save the encrypted PDF — only people with the password can open it." },
    ],
    faqs: [
      { q: "What encryption is used?", a: "Strong, industry-standard PDF encryption is applied locally in your browser." },
      { q: "Is my password stored?", a: "Never. The password is used to encrypt on your device and is never sent or saved anywhere." },
      browserPrivacy,
    ],
  },
  "sign-pdf": {
    howto: [
      { title: "Open your PDF", body: "Add the document you need to sign." },
      { title: "Create your signature", body: "Draw or type your signature, then size it to fit." },
      { title: "Place & download", body: "Drop it onto any page and save the signed PDF." },
    ],
    faqs: [
      { q: "Can I draw my signature?", a: "Yes — draw with a mouse or finger, or type your name in a handwriting-style font." },
      { q: "Are signed files uploaded?", a: "No — signing happens in your browser, so your document and signature stay on your device." },
      browserPrivacy,
    ],
  },
  "redact-pdf": {
    howto: [
      { title: "Open your PDF", body: "Add the document with sensitive content." },
      { title: "Black out the content", body: "Draw boxes over anything you want to hide." },
      { title: "Download", body: "Export a flattened PDF where the hidden content can't be recovered." },
    ],
    faqs: [
      { q: "Is redacted content truly removed?", a: "Yes — the page is flattened so the blacked-out content is gone, not merely covered by a box." },
      { q: "Can redactions be undone after download?", a: "No — once exported and flattened the hidden content cannot be recovered, which is exactly the point of redaction." },
      browserPrivacy,
    ],
  },
  "compare-pdf": {
    howto: [
      { title: "Open two PDFs", body: "Add the original and the revised version." },
      { title: "Compare", body: "View the documents side by side with the differences highlighted." },
      { title: "Review", body: "Spot what changed in text and layout at a glance." },
    ],
    faqs: [
      { q: "What differences does it show?", a: "It highlights changes in text and layout between the two versions so nothing slips past you." },
      { q: "Are both files uploaded?", a: "No — both PDFs are rendered and compared right in your browser." },
      browserPrivacy,
    ],
  },

  // ─────────── INTELLIGENCE ───────────
  "ai-summarizer": {
    howto: [
      { title: "Upload your PDF", body: "Add an article, report or contract." },
      { title: "Generate a summary", body: "AI reads the document and distils the key points." },
      { title: "Read & copy", body: "Get a concise summary you can copy and share." },
    ],
    faqs: [
      { q: "What documents can it summarize?", a: "Articles, reports, research papers and contracts — anything text-based works well." },
      { q: "How accurate are the summaries?", a: "Summaries capture the main points using a state-of-the-art language model, though you should verify critical details against the source." },
      aiPrivacy,
    ],
  },
  "translate-pdf": {
    howto: [
      { title: "Upload your PDF", body: "Add the document you want to translate." },
      { title: "Pick a language", body: "Choose the target language." },
      { title: "Download", body: "Get a translated version with the layout kept intact." },
    ],
    faqs: [
      { q: "How many languages are supported?", a: "A wide range of major world languages is supported for translation." },
      { q: "Will the layout be preserved?", a: "Yes — translation keeps the document's formatting and structure as close to the original as possible." },
      aiPrivacy,
    ],
  },
};

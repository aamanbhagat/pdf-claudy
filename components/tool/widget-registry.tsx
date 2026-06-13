"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

function Loading() {
  return (
    <div className="grid h-72 place-items-center rounded-2xl border border-line bg-surface">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-iris" />
    </div>
  );
}

const lazy = (load: () => Promise<{ default: ComponentType }>) => dynamic(load, { ssr: false, loading: Loading });
const named = (load: () => Promise<Record<string, ComponentType>>, key: string) =>
  lazy(() => load().then((m) => ({ default: m[key] })));

/**
 * Slug → interactive client widget. Browser tools register their engine UI here.
 * Tools without an entry fall back to the engine-aware placeholder.
 */
export const widgets: Record<string, ComponentType> = {
  "merge-pdf": named(() => import("@/components/tools/merge-pdf"), "MergePdfTool"),
  "split-pdf": named(() => import("@/components/tools/split-pdf"), "SplitPdfTool"),
  "remove-pages": named(() => import("@/components/tools/remove-pages"), "RemovePagesTool"),
  "extract-pages": named(() => import("@/components/tools/extract-pages"), "ExtractPagesTool"),
  "organize-pdf": named(() => import("@/components/tools/organize-pdf"), "OrganizePdfTool"),
  "rotate-pdf": named(() => import("@/components/tools/rotate-pdf"), "RotatePdfTool"),
  "add-page-numbers": named(() => import("@/components/tools/add-page-numbers"), "AddPageNumbersTool"),
  "add-watermark": named(() => import("@/components/tools/add-watermark"), "AddWatermarkTool"),
  "crop-pdf": named(() => import("@/components/tools/crop-pdf"), "CropPdfTool"),
  "jpg-to-pdf": named(() => import("@/components/tools/jpg-to-pdf"), "JpgToPdfTool"),
  "pdf-to-jpg": named(() => import("@/components/tools/pdf-to-jpg"), "PdfToJpgTool"),
  "compress-pdf": named(() => import("@/components/tools/compress-pdf"), "CompressPdfTool"),
  "protect-pdf": named(() => import("@/components/tools/protect-pdf"), "ProtectPdfTool"),
  "pdf-forms": named(() => import("@/components/tools/pdf-forms"), "PdfFormsTool"),
  "unlock-pdf": named(() => import("@/components/tools/unlock-pdf"), "UnlockPdfTool"),
  "scan-to-pdf": named(() => import("@/components/tools/scan-to-pdf"), "ScanToPdfTool"),
  "sign-pdf": named(() => import("@/components/tools/sign-pdf"), "SignPdfTool"),
  "redact-pdf": named(() => import("@/components/tools/redact-pdf"), "RedactPdfTool"),
  "compare-pdf": named(() => import("@/components/tools/compare-pdf"), "ComparePdfTool"),
  "ocr-pdf": named(() => import("@/components/tools/ocr-pdf"), "OcrPdfTool"),
  "edit-pdf": named(() => import("@/components/tools/edit-pdf"), "EditPdfTool"),
  // Server tools — proxied to the VPS convert service (one widget, op detected from the path).
  ...Object.fromEntries(
    ["word-to-pdf", "powerpoint-to-pdf", "excel-to-pdf", "pdf-to-word", "pdf-to-powerpoint", "pdf-to-excel", "pdf-to-pdfa", "repair-pdf", "html-to-pdf"].map(
      (slug) => [slug, named(() => import("@/components/tools/server-convert"), "ServerConvertTool")],
    ),
  ),
};

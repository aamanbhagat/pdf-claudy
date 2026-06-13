"use client";

import { ToolShell } from "./_shared/tool-shell";
import { renderPages } from "@/lib/pdf/render";
import { pdf } from "@/lib/pdf/client";
import { pdfBlob } from "@/lib/pdf/types";

export function OcrPdfTool() {
  return (
    <ToolShell
      accept="application/pdf"
      fileNoun="PDF"
      defaultOptions={{}}
      actionLabel="Make searchable"
      resultHint="A text layer was added so you can search and select the content. Processed in your browser."
      run={async (files) => {
        const buf = await files[0].arrayBuffer();
        const images = await renderPages(buf, { dpi: 150, format: "image/png", quality: 1 });
        const { createWorker } = await import("tesseract.js");
        const worker = await createWorker("eng");
        const pageBuffers: ArrayBuffer[] = [];
        try {
          for (const img of images) {
            const { data } = await worker.recognize(img.blob, {}, { pdf: true });
            pageBuffers.push(new Uint8Array(data.pdf ?? []).buffer);
          }
        } finally {
          await worker.terminate();
        }
        const merged = await pdf().merge(pageBuffers);
        return [{ name: "searchable.pdf", blob: pdfBlob(merged) }];
      }}
      options={() => (
        <p className="text-sm text-graphite">
          Recognition runs locally with an on-device engine. The first run downloads a small language model, and
          large documents can take a little while.
        </p>
      )}
    />
  );
}

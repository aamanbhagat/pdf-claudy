"use client";

import { ToolShell } from "./_shared/tool-shell";
import { Field, Segmented } from "./_shared/controls";
import { rasterize } from "@/lib/pdf/render";
import { pdf } from "@/lib/pdf/client";
import { pdfBlob } from "@/lib/pdf/types";

interface Opts {
  level: "light" | "recommended" | "strong";
}

const presets: Record<Opts["level"], { scale: number; quality: number }> = {
  light: { scale: 2, quality: 0.82 },
  recommended: { scale: 1.5, quality: 0.65 },
  strong: { scale: 1, quality: 0.5 },
};

export function CompressPdfTool() {
  return (
    <ToolShell<Opts>
      accept="application/pdf"
      fileNoun="PDF"
      defaultOptions={{ level: "recommended" }}
      actionLabel="Compress PDF"
      resultHint="Best results on scanned or image-heavy PDFs. Server-grade compression is coming for the rest."
      run={async (files, o) => {
        const buf = await files[0].arrayBuffer();
        const pages = await rasterize(buf, presets[o.level]);
        const bytes = await pdf().imagesToSizedPdf(pages);
        const compressed = pdfBlob(bytes);
        // Never hand back a bigger file than the original.
        const best = compressed.size < files[0].size ? compressed : new Blob([buf], { type: "application/pdf" });
        return [{ name: "compressed.pdf", blob: best }];
      }}
      options={({ value, set }) => (
        <Field label="Compression level" hint="quality ↔ size">
          <Segmented
            value={value.level}
            onChange={(level) => set({ level })}
            options={[
              { value: "light", label: "Light" },
              { value: "recommended", label: "Recommended" },
              { value: "strong", label: "Strong" },
            ]}
          />
        </Field>
      )}
    />
  );
}

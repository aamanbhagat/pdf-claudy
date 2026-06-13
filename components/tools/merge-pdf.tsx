"use client";

import { ToolShell } from "./_shared/tool-shell";
import { pdf } from "@/lib/pdf/client";
import { pdfBlob } from "@/lib/pdf/types";

export function MergePdfTool() {
  return (
    <ToolShell
      accept="application/pdf"
      multiple
      reorderable
      minFiles={2}
      fileNoun="PDF"
      defaultOptions={{}}
      actionLabel="Merge PDFs"
      resultHint="Your PDFs were combined entirely in your browser."
      run={async (files) => {
        const buffers = await Promise.all(files.map((f) => f.arrayBuffer()));
        const bytes = await pdf().merge(buffers);
        return [{ name: "merged.pdf", blob: pdfBlob(bytes) }];
      }}
    />
  );
}

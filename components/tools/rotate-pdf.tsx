"use client";

import { RotateCcw, RotateCw, FlipVertical2 } from "lucide-react";
import { ToolShell } from "./_shared/tool-shell";
import { Field, Segmented } from "./_shared/controls";
import { pdf } from "@/lib/pdf/client";
import { pdfBlob } from "@/lib/pdf/types";

interface Opts {
  angle: number;
}

export function RotatePdfTool() {
  return (
    <ToolShell<Opts>
      accept="application/pdf"
      fileNoun="PDF"
      defaultOptions={{ angle: 90 }}
      actionLabel="Rotate PDF"
      resultHint="Every page was rotated and saved in your browser."
      run={async (files, o) => {
        const bytes = await pdf().rotate(await files[0].arrayBuffer(), { angle: o.angle });
        return [{ name: "rotated.pdf", blob: pdfBlob(bytes) }];
      }}
      options={({ value, set }) => (
        <Field label="Rotate all pages" hint="To rotate individual pages, use Organize PDF">
          <Segmented
            value={value.angle}
            onChange={(angle) => set({ angle })}
            options={[
              { value: 270, label: <span className="flex items-center gap-1.5"><RotateCcw className="h-4 w-4" /> Left</span> },
              { value: 90, label: <span className="flex items-center gap-1.5"><RotateCw className="h-4 w-4" /> Right</span> },
              { value: 180, label: <span className="flex items-center gap-1.5"><FlipVertical2 className="h-4 w-4" /> 180°</span> },
            ]}
          />
        </Field>
      )}
    />
  );
}

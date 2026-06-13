"use client";

import { ToolShell } from "./_shared/tool-shell";
import { Field, Segmented, Slider } from "./_shared/controls";
import { pdf } from "@/lib/pdf/client";
import { pdfBlob } from "@/lib/pdf/types";
import type { NumberPosition } from "@/lib/pdf/pdf-worker";

interface Opts {
  position: NumberPosition;
  fontSize: number;
  startAt: number;
  format: "n" | "n-of-total";
}

const positions: { value: NumberPosition; label: string }[] = [
  { value: "bottom-center", label: "Bottom" },
  { value: "bottom-right", label: "Bottom-right" },
  { value: "bottom-left", label: "Bottom-left" },
  { value: "top-center", label: "Top" },
  { value: "top-right", label: "Top-right" },
  { value: "top-left", label: "Top-left" },
];

export function AddPageNumbersTool() {
  return (
    <ToolShell<Opts>
      accept="application/pdf"
      fileNoun="PDF"
      defaultOptions={{ position: "bottom-center", fontSize: 11, startAt: 1, format: "n" }}
      actionLabel="Add page numbers"
      run={async (files, o) => {
        const bytes = await pdf().addPageNumbers(await files[0].arrayBuffer(), { ...o, margin: 28 });
        return [{ name: "numbered.pdf", blob: pdfBlob(bytes) }];
      }}
      options={({ value, set }) => (
        <div className="space-y-5">
          <Field label="Position">
            <Segmented value={value.position} onChange={(position) => set({ position })} options={positions} />
          </Field>
          <Field label="Format">
            <Segmented
              value={value.format}
              onChange={(format) => set({ format })}
              options={[
                { value: "n", label: "1, 2, 3" },
                { value: "n-of-total", label: "1 / N" },
              ]}
            />
          </Field>
          <div className="grid grid-cols-2 gap-5">
            <Slider label="Text size" min={7} max={24} value={value.fontSize} onChange={(fontSize) => set({ fontSize })} display={(v) => `${v} pt`} />
            <Slider label="Start at" min={0} max={50} value={value.startAt} onChange={(startAt) => set({ startAt })} />
          </div>
        </div>
      )}
    />
  );
}

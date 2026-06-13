"use client";

import { ImageIcon } from "lucide-react";
import { ToolShell } from "./_shared/tool-shell";
import { Field, Segmented, Slider } from "./_shared/controls";
import { pdf } from "@/lib/pdf/client";
import { pdfBlob } from "@/lib/pdf/types";
import type { PageSize } from "@/lib/pdf/pdf-worker";

interface Opts {
  size: PageSize;
  orientation: "auto" | "portrait" | "landscape";
  margin: number;
}

export function JpgToPdfTool() {
  return (
    <ToolShell<Opts>
      accept="image/jpeg,image/png,image/webp"
      multiple
      reorderable
      fileNoun="image"
      defaultOptions={{ size: "a4", orientation: "auto", margin: 24 }}
      actionLabel="Create PDF"
      run={async (files, o) => {
        const images = await Promise.all(files.map(async (f) => ({ bytes: await f.arrayBuffer(), type: f.type })));
        const bytes = await pdf().imagesToPdf(images, o);
        return [{ name: "images.pdf", blob: pdfBlob(bytes) }];
      }}
      options={({ value, set }) => (
        <div className="space-y-5">
          <Field label="Page size">
            <Segmented
              value={value.size}
              onChange={(size) => set({ size })}
              options={[
                { value: "a4", label: "A4" },
                { value: "letter", label: "Letter" },
                { value: "fit", label: "Fit to image" },
              ]}
            />
          </Field>
          {value.size !== "fit" && (
            <Field label="Orientation">
              <Segmented
                value={value.orientation}
                onChange={(orientation) => set({ orientation })}
                options={[
                  { value: "auto", label: "Auto" },
                  { value: "portrait", label: "Portrait" },
                  { value: "landscape", label: "Landscape" },
                ]}
              />
            </Field>
          )}
          <Slider label="Margin" min={0} max={80} value={value.margin} onChange={(margin) => set({ margin })} display={(v) => `${v} pt`} />
        </div>
      )}
    />
  );
}

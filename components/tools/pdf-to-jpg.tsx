"use client";

import { ToolShell } from "./_shared/tool-shell";
import { Field, Segmented } from "./_shared/controls";
import { renderPages } from "@/lib/pdf/render";

interface Opts {
  dpi: number;
  format: "jpg" | "png";
}

export function PdfToJpgTool() {
  return (
    <ToolShell<Opts>
      accept="application/pdf"
      fileNoun="PDF"
      defaultOptions={{ dpi: 150, format: "jpg" }}
      actionLabel="Convert to images"
      zipName="pdf-pages.zip"
      run={async (files, o) => {
        const buf = await files[0].arrayBuffer();
        return renderPages(buf, {
          dpi: o.dpi,
          format: o.format === "png" ? "image/png" : "image/jpeg",
          quality: 0.92,
        });
      }}
      options={({ value, set }) => (
        <div className="space-y-5">
          <Field label="Image format">
            <Segmented
              value={value.format}
              onChange={(format) => set({ format })}
              options={[
                { value: "jpg", label: "JPG" },
                { value: "png", label: "PNG" },
              ]}
            />
          </Field>
          <Field label="Quality">
            <Segmented
              value={value.dpi}
              onChange={(dpi) => set({ dpi })}
              options={[
                { value: 96, label: "Screen" },
                { value: 150, label: "Good" },
                { value: 300, label: "Print" },
              ]}
            />
          </Field>
        </div>
      )}
    />
  );
}

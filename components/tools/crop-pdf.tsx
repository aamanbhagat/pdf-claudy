"use client";

import { ToolShell } from "./_shared/tool-shell";
import { usePageImage } from "./_shared/page-grid";
import { Slider } from "./_shared/controls";
import { pdf } from "@/lib/pdf/client";
import { pdfBlob } from "@/lib/pdf/types";

interface Opts {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

function CropOptions({ file, value, set }: { file: File; value: Opts; set: (p: Partial<Opts>) => void }) {
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
  const first = usePageImage(file, 0, Math.round(400 * dpr), 0.9);
  return (
    <div className="grid gap-6 sm:grid-cols-[minmax(0,200px)_1fr] sm:items-start">
      <div className="mx-auto w-full max-w-[200px]">
        <div className="relative overflow-hidden rounded-lg border border-line bg-white">
          {first ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={first.url} alt="Page 1 preview" className="block w-full" />
          ) : (
            <div className="aspect-[3/4] animate-pulse bg-paper-deep" />
          )}
          <div
            className="pointer-events-none absolute outline-2 outline-dashed outline-iris"
            style={{
              top: `${value.top * 100}%`,
              right: `${value.right * 100}%`,
              bottom: `${value.bottom * 100}%`,
              left: `${value.left * 100}%`,
              boxShadow: "0 0 0 9999px rgba(22,21,29,0.45)",
            }}
          />
        </div>
        <p className="mt-2 text-center font-mono text-xs text-graphite">Page 1 preview</p>
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-4">
        <Slider label="Top" min={0} max={45} value={Math.round(value.top * 100)} onChange={(v) => set({ top: v / 100 })} display={(v) => `${v}%`} />
        <Slider label="Bottom" min={0} max={45} value={Math.round(value.bottom * 100)} onChange={(v) => set({ bottom: v / 100 })} display={(v) => `${v}%`} />
        <Slider label="Left" min={0} max={45} value={Math.round(value.left * 100)} onChange={(v) => set({ left: v / 100 })} display={(v) => `${v}%`} />
        <Slider label="Right" min={0} max={45} value={Math.round(value.right * 100)} onChange={(v) => set({ right: v / 100 })} display={(v) => `${v}%`} />
      </div>
    </div>
  );
}

export function CropPdfTool() {
  return (
    <ToolShell<Opts>
      accept="application/pdf"
      fileNoun="PDF"
      defaultOptions={{ top: 0.05, right: 0.05, bottom: 0.05, left: 0.05 }}
      actionLabel="Crop PDF"
      run={async (files, o) => {
        const bytes = await pdf().cropMargins(await files[0].arrayBuffer(), o);
        return [{ name: "cropped.pdf", blob: pdfBlob(bytes) }];
      }}
      options={({ files, value, set }) => <CropOptions file={files[0]} value={value} set={set} />}
    />
  );
}

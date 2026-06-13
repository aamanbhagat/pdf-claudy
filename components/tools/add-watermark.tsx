"use client";

import { ToolShell } from "./_shared/tool-shell";
import { Field, Segmented, Slider, TextInput, ColorPicker } from "./_shared/controls";
import { pdf } from "@/lib/pdf/client";
import { pdfBlob } from "@/lib/pdf/types";
import type { WatermarkPosition } from "@/lib/pdf/pdf-worker";

interface Opts {
  text: string;
  fontSize: number;
  opacity: number;
  rotation: number;
  position: WatermarkPosition;
  color: string;
}

function hexToRgb01(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  const n = parseInt(m.length === 3 ? m.replace(/(.)/g, "$1$1") : m, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const positions: { value: WatermarkPosition; label: string }[] = [
  { value: "center", label: "Center" },
  { value: "tile", label: "Tiled" },
  { value: "top-right", label: "Top-right" },
  { value: "bottom-right", label: "Bottom-right" },
];

export function AddWatermarkTool() {
  return (
    <ToolShell<Opts>
      accept="application/pdf"
      fileNoun="PDF"
      defaultOptions={{ text: "CONFIDENTIAL", fontSize: 48, opacity: 0.25, rotation: 45, position: "center", color: "#16151D" }}
      actionLabel="Add watermark"
      run={async (files, o) => {
        const bytes = await pdf().watermarkText(await files[0].arrayBuffer(), {
          text: o.text || "WATERMARK",
          fontSize: o.fontSize,
          opacity: o.opacity,
          rotation: o.rotation,
          position: o.position,
          color: hexToRgb01(o.color),
        });
        return [{ name: "watermarked.pdf", blob: pdfBlob(bytes) }];
      }}
      options={({ value, set }) => (
        <div className="space-y-5">
          <Field label="Watermark text">
            <TextInput value={value.text} onChange={(text) => set({ text })} placeholder="e.g. CONFIDENTIAL" />
          </Field>
          <Field label="Placement">
            <Segmented value={value.position} onChange={(position) => set({ position })} options={positions} />
          </Field>
          <div className="grid grid-cols-2 gap-5">
            <Slider label="Size" min={12} max={120} value={value.fontSize} onChange={(fontSize) => set({ fontSize })} display={(v) => `${v} pt`} />
            <Slider label="Opacity" min={5} max={100} value={Math.round(value.opacity * 100)} onChange={(v) => set({ opacity: v / 100 })} display={(v) => `${v}%`} />
            <Slider label="Rotation" min={0} max={90} value={value.rotation} onChange={(rotation) => set({ rotation })} display={(v) => `${v}°`} />
            <Field label="Color">
              <ColorPicker value={value.color} onChange={(color) => set({ color })} />
            </Field>
          </div>
        </div>
      )}
    />
  );
}

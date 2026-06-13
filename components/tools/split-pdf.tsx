"use client";

import { useEffect, useState } from "react";
import { ToolShell } from "./_shared/tool-shell";
import { Field, Segmented, TextInput } from "./_shared/controls";
import { pdf } from "@/lib/pdf/client";
import { pdfBlob } from "@/lib/pdf/types";

interface Opts {
  mode: "each" | "ranges";
  ranges: string;
}

function parseRanges(input: string, count: number): { from: number; to: number }[] {
  const out: { from: number; to: number }[] = [];
  for (const part of input.split(",")) {
    const t = part.trim();
    if (!t) continue;
    const m = t.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!m) continue;
    let from = parseInt(m[1], 10) - 1;
    let to = (m[2] ? parseInt(m[2], 10) : parseInt(m[1], 10)) - 1;
    if (from > to) [from, to] = [to, from];
    from = Math.max(0, from);
    to = Math.min(count - 1, to);
    if (from <= to) out.push({ from, to });
  }
  return out;
}

function SplitOptions({ files, value, set }: { files: File[]; value: Opts; set: (p: Partial<Opts>) => void }) {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    files[0].arrayBuffer().then((b) => pdf().getPageCount(b)).then((c) => alive && setCount(c));
    return () => {
      alive = false;
    };
  }, [files]);

  return (
    <div className="space-y-5">
      <Field label="How should we split it?" hint={count ? `${count} pages` : ""}>
        <Segmented
          value={value.mode}
          onChange={(mode) => set({ mode })}
          options={[
            { value: "each", label: "Every page" },
            { value: "ranges", label: "Custom ranges" },
          ]}
        />
      </Field>
      {value.mode === "ranges" && (
        <Field label="Page ranges" hint="e.g. 1-3, 5, 8-10">
          <TextInput value={value.ranges} onChange={(ranges) => set({ ranges })} placeholder="1-3, 5, 8-10" />
        </Field>
      )}
    </div>
  );
}

export function SplitPdfTool() {
  return (
    <ToolShell<Opts>
      accept="application/pdf"
      fileNoun="PDF"
      defaultOptions={{ mode: "each", ranges: "" }}
      actionLabel="Split PDF"
      zipName="split-pages.zip"
      run={async (files, o) => {
        const buf = await files[0].arrayBuffer();
        const count = await pdf().getPageCount(buf);
        const ranges =
          o.mode === "each"
            ? Array.from({ length: count }, (_, i) => ({ from: i, to: i }))
            : parseRanges(o.ranges, count);
        if (!ranges.length) throw new Error("Enter at least one valid page range, e.g. 1-3, 5.");
        const results = await pdf().splitRanges(buf, { ranges });
        return results.map((r) => ({ name: r.name, blob: pdfBlob(r.bytes) }));
      }}
      options={({ files, value, set }) => <SplitOptions files={files} value={value} set={set} />}
    />
  );
}

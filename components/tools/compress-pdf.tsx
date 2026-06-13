"use client";

import { useState } from "react";
import { Download, RotateCcw, Loader2, ArrowRight, Minimize2, FileText } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dropzone } from "./_shared/dropzone";
import { rasterize } from "@/lib/pdf/render";
import { pdf } from "@/lib/pdf/client";
import { pdfBlob } from "@/lib/pdf/types";
import { downloadBlob } from "@/lib/pdf/download";

type Mode = "smaller" | "lossless";
type Phase = "select" | "working" | "done";

interface Result {
  blob: Blob;
  before: number;
  after: number;
  rasterized: boolean;
}

const modes: { id: Mode; label: string; desc: string; Icon: typeof Minimize2 }[] = [
  { id: "smaller", label: "Smaller file", desc: "Shrinks images for a much smaller file. Best for scans, photos and large PDFs.", Icon: Minimize2 },
  { id: "lossless", label: "Keep text crisp", desc: "Lossless — removes hidden waste and keeps everything selectable.", Icon: FileText },
];

export function CompressPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>("smaller");
  const [phase, setPhase] = useState<Phase>("select");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  const reset = () => { setFile(null); setResult(null); setError(""); setPhase("select"); };

  async function run() {
    if (!file) return;
    setPhase("working");
    setError("");
    try {
      const buf = await file.arrayBuffer();
      const orig = file.size;
      let best: { blob: Blob; size: number; rasterized: boolean } = {
        blob: new Blob([buf], { type: "application/pdf" }),
        size: orig,
        rasterized: false,
      };
      const consider = (bytes: Uint8Array, rasterized: boolean) => {
        const blob = pdfBlob(bytes);
        if (blob.size < best.size) best = { blob, size: blob.size, rasterized };
      };

      if (mode === "smaller") {
        // Downsample pages to images — the only reliable way to shrink image-heavy PDFs in the browser.
        const pages = await rasterize(buf, { scale: 1.5, quality: 0.6 });
        consider(await pdf().imagesToSizedPdf(pages), true);
        // For text/vector PDFs rasterizing can be bigger — fall back to lossless so we never bloat.
        if (best.size >= orig) consider(await pdf().compress(buf), false);
      } else {
        consider(await pdf().compress(buf), false);
      }

      setResult({ blob: best.blob, before: orig, after: best.size, rasterized: best.rasterized });
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't compress this PDF.");
      setPhase("select");
    }
  }

  if (phase === "select" && !file)
    return <Dropzone accept="application/pdf" onFiles={(f) => setFile(f[0])} hint="or click to browse · stays on your device" />;

  if (phase === "done" && result) {
    const saved = result.before > 0 ? Math.round((1 - result.after / result.before) * 100) : 0;
    const negligible = saved < 1;
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center">
        {negligible ? (
          <>
            <h2 className="text-xl font-semibold text-ink">This PDF is already well optimized</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-graphite">
              There&apos;s little to remove without hurting quality — its text and images are already compressed.
            </p>
          </>
        ) : (
          <>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#18A06A]">−{saved}% smaller</p>
            <div className="mt-3 flex items-center justify-center gap-3 text-lg font-semibold text-ink">
              <span className="text-graphite line-through decoration-graphite/40">{formatBytes(result.before)}</span>
              <ArrowRight className="h-4 w-4 text-iris" />
              <span>{formatBytes(result.after)}</span>
            </div>
            {result.rasterized && (
              <p className="mx-auto mt-2 max-w-md text-xs text-graphite">Pages were re-rendered, so text is now part of the image.</p>
            )}
          </>
        )}
        <div className="mx-auto mt-6 max-w-md">
          <Button variant="accent" size="lg" className="w-full" onClick={() => downloadBlob(result.blob, "compressed.pdf")}>
            <Download className="h-4 w-4" /> Download compressed.pdf
          </Button>
        </div>
        <button onClick={reset} className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-graphite hover:text-ink">
          <RotateCcw className="h-3.5 w-3.5" /> Compress another
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {file && (
        <div className="flex items-center justify-between rounded-xl border border-line bg-surface p-3">
          <span className="truncate text-sm font-medium text-ink">{file.name}</span>
          <span className="font-mono text-xs text-graphite">{formatBytes(file.size)}</span>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              "flex gap-3 rounded-xl border p-4 text-left transition-all",
              mode === m.id ? "border-iris bg-iris-tint/40 ring-1 ring-iris/30" : "border-line bg-surface hover:border-iris/40",
            )}
          >
            <m.Icon className={cn("mt-0.5 h-5 w-5 shrink-0", mode === m.id ? "text-iris" : "text-graphite")} strokeWidth={1.8} />
            <span>
              <span className="block text-sm font-semibold text-ink">{m.label}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-graphite">{m.desc}</span>
            </span>
          </button>
        ))}
      </div>

      {error && <p className="rounded-xl bg-[#FCEAEA] px-4 py-3 text-sm text-[#C0353A]">{error}</p>}

      <div className="flex items-center justify-between">
        <button onClick={reset} className="inline-flex items-center gap-1.5 text-sm font-medium text-graphite hover:text-ink">
          <RotateCcw className="h-3.5 w-3.5" /> Start over
        </button>
        <Button variant="accent" size="lg" onClick={run} disabled={phase === "working"} className="min-w-[12rem]">
          {phase === "working" ? <><Loader2 className="h-4 w-4 animate-spin" /> Compressing…</> : "Compress PDF"}
        </Button>
      </div>
    </div>
  );
}

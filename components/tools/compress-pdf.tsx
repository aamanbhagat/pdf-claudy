"use client";

import { useState } from "react";
import { Download, RotateCcw, Loader2, ArrowRight, Gauge, ScanLine } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dropzone } from "./_shared/dropzone";
import { rasterize } from "@/lib/pdf/render";
import { pdf } from "@/lib/pdf/client";
import { pdfBlob } from "@/lib/pdf/types";
import { downloadBlob } from "@/lib/pdf/download";

type Mode = "recommended" | "strong";
type Phase = "select" | "working" | "done";

interface Result {
  blob: Blob;
  before: number;
  after: number;
}

const modes: { id: Mode; label: string; desc: string; Icon: typeof Gauge }[] = [
  { id: "recommended", label: "Recommended", desc: "Keeps text sharp and selectable. Best for everyday PDFs.", Icon: Gauge },
  { id: "strong", label: "Strong (scans)", desc: "Re-renders pages as images. Big savings for scanned documents.", Icon: ScanLine },
];

export function CompressPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>("recommended");
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
      let bytes: Uint8Array;
      if (mode === "strong") {
        const pages = await rasterize(buf, { scale: 1.5, quality: 0.6 });
        bytes = await pdf().imagesToSizedPdf(pages);
      } else {
        bytes = await pdf().compress(buf);
      }
      const compressed = pdfBlob(bytes);
      // Never hand back something larger than the original.
      const useOriginal = compressed.size >= file.size;
      setResult({
        blob: useOriginal ? new Blob([buf], { type: "application/pdf" }) : compressed,
        before: file.size,
        after: useOriginal ? file.size : compressed.size,
      });
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
              We couldn&apos;t shrink it meaningfully without hurting quality. {mode === "recommended" && "For scanned documents, try the Strong (scans) mode."}
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

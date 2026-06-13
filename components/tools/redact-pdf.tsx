"use client";

import { useRef, useState } from "react";
import { Undo2, Download, RotateCcw, CheckCircle2, Loader2, ChevronLeft, ChevronRight, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dropzone } from "./_shared/dropzone";
import { usePageImage, usePageCount } from "./_shared/page-grid";
import { pdf } from "@/lib/pdf/client";
import { pdfBlob } from "@/lib/pdf/types";
import { downloadBlob } from "@/lib/pdf/download";
import { rasterizeRedacted, type Rect } from "@/lib/pdf/render";

type Phase = "select" | "editor" | "working" | "done";

export function RedactPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>("select");
  const [pageIndex, setPageIndex] = useState(0);
  const [boxes, setBoxes] = useState<Record<number, Rect[]>>({});
  const [draft, setDraft] = useState<Rect | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
  const editorFile = phase === "editor" ? (file ?? undefined) : undefined;
  const current = usePageImage(editorFile, pageIndex, Math.round(480 * dpr), 0.92);
  const total = usePageCount(editorFile);
  const pageBoxes = boxes[pageIndex] ?? [];

  const reset = () => { setFile(null); setPhase("select"); setBoxes({}); setResult(null); setPageIndex(0); };
  const frac = (e: React.PointerEvent, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };

  const totalBoxes = Object.values(boxes).reduce((n, b) => n + b.length, 0);

  async function apply() {
    if (!file) return;
    setPhase("working");
    const pages = await rasterizeRedacted(await file.arrayBuffer(), { scale: 2, quality: 0.92, boxes });
    setResult(pdfBlob(await pdf().imagesToSizedPdf(pages)));
    setPhase("done");
  }

  if (phase === "select")
    return <Dropzone accept="application/pdf" onFiles={(f) => { setFile(f[0]); setPhase("editor"); }} hint="or click to browse · stays on your device" />;

  if (phase === "done" && result)
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#E5F5EE] text-[#18A06A]"><CheckCircle2 className="h-7 w-7" strokeWidth={1.8} /></span>
        <h2 className="mt-4 text-xl font-semibold text-ink">Redacted PDF ready</h2>
        <p className="mt-1 text-sm text-graphite">Hidden content was flattened into the page — it can&apos;t be recovered.</p>
        <div className="mx-auto mt-6 max-w-md"><Button variant="accent" size="lg" className="w-full" onClick={() => downloadBlob(result, "redacted.pdf")}><Download className="h-4 w-4" /> Download redacted.pdf</Button></div>
        <button onClick={reset} className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-graphite hover:text-ink"><RotateCcw className="h-3.5 w-3.5" /> Do another</button>
      </div>
    );

  return (
    <div className="space-y-4">
      <p className="text-sm text-graphite">Drag to draw a box over anything you want to permanently hide. {totalBoxes > 0 && <span className="font-medium text-ink">{totalBoxes} redaction{totalBoxes === 1 ? "" : "s"}</span>}</p>
      {current ? (
        <div
          className="relative mx-auto max-w-md cursor-crosshair touch-none select-none overflow-hidden rounded-xl border border-line bg-white"
          onPointerDown={(e) => { start.current = frac(e, e.currentTarget); (e.target as HTMLElement).setPointerCapture(e.pointerId); }}
          onPointerMove={(e) => {
            if (!start.current) return;
            const p = frac(e, e.currentTarget);
            setDraft({ x: Math.min(start.current.x, p.x), y: Math.min(start.current.y, p.y), w: Math.abs(p.x - start.current.x), h: Math.abs(p.y - start.current.y) });
          }}
          onPointerUp={() => {
            if (draft && draft.w > 0.01 && draft.h > 0.01) setBoxes((b) => ({ ...b, [pageIndex]: [...(b[pageIndex] ?? []), draft] }));
            start.current = null;
            setDraft(null);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.url} alt={`Page ${pageIndex + 1}`} className="block w-full" draggable={false} />
          {[...pageBoxes, ...(draft ? [draft] : [])].map((b, i) => (
            <span key={i} className="pointer-events-none absolute bg-[#16151d]" style={{ left: `${b.x * 100}%`, top: `${b.y * 100}%`, width: `${b.w * 100}%`, height: `${b.h * 100}%` }} />
          ))}
        </div>
      ) : (
        <div className="mx-auto grid aspect-[3/4] max-w-md place-items-center rounded-xl border border-line bg-paper-deep"><Loader2 className="h-5 w-5 animate-spin text-graphite" /></div>
      )}

      <div className="flex items-center justify-center gap-2">
        <button onClick={() => setBoxes((b) => ({ ...b, [pageIndex]: (b[pageIndex] ?? []).slice(0, -1) }))} disabled={!pageBoxes.length} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm text-ink-soft disabled:opacity-40"><Undo2 className="h-3.5 w-3.5" /> Undo</button>
        <button onClick={() => setBoxes((b) => ({ ...b, [pageIndex]: [] }))} disabled={!pageBoxes.length} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm text-ink-soft disabled:opacity-40"><Eraser className="h-3.5 w-3.5" /> Clear page</button>
        {total && total > 1 && (
          <div className="ml-2 flex items-center gap-2 text-sm">
            <button onClick={() => setPageIndex((i) => Math.max(0, i - 1))} disabled={pageIndex === 0} className="grid h-8 w-8 place-items-center rounded-full border border-line disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
            <span className="font-mono text-graphite">{pageIndex + 1} / {total}</span>
            <button onClick={() => setPageIndex((i) => Math.min(total - 1, i + 1))} disabled={pageIndex === total - 1} className="grid h-8 w-8 place-items-center rounded-full border border-line disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button onClick={reset} className="inline-flex items-center gap-1.5 text-sm font-medium text-graphite hover:text-ink"><RotateCcw className="h-3.5 w-3.5" /> Start over</button>
        <Button variant="accent" size="lg" onClick={apply} disabled={phase === "working" || totalBoxes === 0}>{phase === "working" ? <><Loader2 className="h-4 w-4 animate-spin" /> Working…</> : "Apply redactions"}</Button>
      </div>
    </div>
  );
}

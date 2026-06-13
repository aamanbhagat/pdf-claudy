"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser, Download, RotateCcw, CheckCircle2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dropzone } from "./_shared/dropzone";
import { Segmented, Slider, TextInput } from "./_shared/controls";
import { usePageImage, usePageCount } from "./_shared/page-grid";
import { pdf } from "@/lib/pdf/client";
import { pdfBlob } from "@/lib/pdf/types";
import { downloadBlob } from "@/lib/pdf/download";

type Phase = "select" | "editor" | "working" | "done";

function SignaturePad({ canvasRef }: { canvasRef: React.RefObject<HTMLCanvasElement | null> }) {
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#16151D";
  }, [canvasRef]);

  const pos = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  return (
    <canvas
      ref={canvasRef}
      className="h-40 w-full touch-none rounded-xl border border-line bg-white"
      onPointerDown={(e) => {
        drawing.current = true;
        last.current = pos(e);
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drawing.current) return;
        const ctx = canvasRef.current!.getContext("2d")!;
        const p = pos(e);
        ctx.beginPath();
        ctx.moveTo(last.current!.x, last.current!.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        last.current = p;
      }}
      onPointerUp={() => (drawing.current = false)}
    />
  );
}

export function SignPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>("select");
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [typed, setTyped] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pos, setPos] = useState({ x: 0.5, y: 0.85 });
  const [widthFrac, setWidthFrac] = useState(0.28);
  const [result, setResult] = useState<Blob | null>(null);
  const padRef = useRef<HTMLCanvasElement>(null);
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
  const editorFile = phase === "editor" ? (file ?? undefined) : undefined;
  const current = usePageImage(editorFile, pageIndex, Math.round(540 * dpr), 0.92);
  const total = usePageCount(editorFile);

  const reset = () => {
    setFile(null);
    setPhase("select");
    setResult(null);
    setTyped("");
    setPageIndex(0);
  };

  function signatureDataUrl(): string | null {
    if (mode === "type") {
      if (!typed.trim()) return null;
      const c = document.createElement("canvas");
      c.width = 600;
      c.height = 200;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#16151D";
      ctx.font = "italic 72px Georgia, serif";
      ctx.textBaseline = "middle";
      ctx.fillText(typed, 20, 110);
      return c.toDataURL("image/png");
    }
    return padRef.current?.toDataURL("image/png") ?? null;
  }

  async function apply() {
    if (!file) return;
    const url = signatureDataUrl();
    if (!url) return;
    setPhase("working");
    const bytes = await (await fetch(url)).arrayBuffer();
    const out = await pdf().stampImage(await file.arrayBuffer(), {
      image: { bytes, type: "image/png" },
      pageIndex,
      xFrac: pos.x,
      yFrac: pos.y,
      widthFrac,
    });
    setResult(pdfBlob(out));
    setPhase("done");
  }

  if (phase === "select") {
    return <Dropzone accept="application/pdf" onFiles={(f) => { setFile(f[0]); setPhase("editor"); }} hint="or click to browse · stays on your device" />;
  }

  if (phase === "done" && result) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#E5F5EE] text-[#18A06A]"><CheckCircle2 className="h-7 w-7" strokeWidth={1.8} /></span>
        <h2 className="mt-4 text-xl font-semibold text-ink">Your signed PDF is ready</h2>
        <div className="mx-auto mt-6 max-w-md">
          <Button variant="accent" size="lg" className="w-full" onClick={() => downloadBlob(result, "signed.pdf")}><Download className="h-4 w-4" /> Download signed.pdf</Button>
        </div>
        <button onClick={reset} className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-graphite hover:text-ink"><RotateCcw className="h-3.5 w-3.5" /> Sign another</button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <Segmented value={mode} onChange={setMode} options={[{ value: "draw", label: "Draw" }, { value: "type", label: "Type" }]} />
        {mode === "draw" ? (
          <div className="space-y-2">
            <SignaturePad canvasRef={padRef} />
            <button
              onClick={() => { const c = padRef.current!; c.getContext("2d")!.clearRect(0, 0, c.width, c.height); }}
              className="inline-flex items-center gap-1.5 text-sm text-graphite hover:text-ink"
            >
              <Eraser className="h-3.5 w-3.5" /> Clear
            </button>
          </div>
        ) : (
          <div>
            <TextInput value={typed} onChange={setTyped} placeholder="Type your name" />
            <p className="mt-2 truncate font-[Georgia,serif] text-3xl italic text-ink">{typed || "Your signature"}</p>
          </div>
        )}
        <Slider label="Signature size" min={10} max={60} value={Math.round(widthFrac * 100)} onChange={(v) => setWidthFrac(v / 100)} display={(v) => `${v}%`} />
        <p className="text-sm text-graphite">Click on the page where you want to place it.</p>
      </div>

      <div className="space-y-3">
        {current ? (
          <div
            className="relative cursor-crosshair overflow-hidden rounded-xl border border-line bg-white"
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setPos({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current.url} alt={`Page ${pageIndex + 1}`} className="block w-full select-none" draggable={false} />
            <span
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded border-2 border-dashed border-iris bg-iris/10"
              style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%`, width: `${widthFrac * 100}%`, height: `${widthFrac * 40}%` }}
            />
          </div>
        ) : (
          <div className="grid aspect-[3/4] place-items-center rounded-xl border border-line bg-paper-deep"><Loader2 className="h-5 w-5 animate-spin text-graphite" /></div>
        )}
        {total && total > 1 && (
          <div className="flex items-center justify-center gap-3 text-sm">
            <button onClick={() => setPageIndex((i) => Math.max(0, i - 1))} disabled={pageIndex === 0} className="grid h-8 w-8 place-items-center rounded-full border border-line disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
            <span className="font-mono text-graphite">Page {pageIndex + 1} / {total}</span>
            <button onClick={() => setPageIndex((i) => Math.min(total - 1, i + 1))} disabled={pageIndex === total - 1} className="grid h-8 w-8 place-items-center rounded-full border border-line disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
          </div>
        )}
        <div className="flex items-center justify-between">
          <button onClick={reset} className="inline-flex items-center gap-1.5 text-sm font-medium text-graphite hover:text-ink"><RotateCcw className="h-3.5 w-3.5" /> Start over</button>
          <Button variant="accent" size="lg" onClick={apply} disabled={phase === "working"}>{phase === "working" ? <><Loader2 className="h-4 w-4 animate-spin" /> Working…</> : "Place signature"}</Button>
        </div>
      </div>
    </div>
  );
}

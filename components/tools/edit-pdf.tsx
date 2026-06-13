"use client";

import { useEffect, useRef, useState } from "react";
import { Type, Square, Highlighter, ImagePlus, MousePointer2, Trash2, Download, RotateCcw, CheckCircle2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dropzone } from "./_shared/dropzone";
import { Slider, ColorPicker } from "./_shared/controls";
import { usePageImage, usePageCount } from "./_shared/page-grid";
import { pdf } from "@/lib/pdf/client";
import { pdfBlob } from "@/lib/pdf/types";
import { downloadBlob } from "@/lib/pdf/download";

type Tool = "select" | "text" | "highlight" | "rect" | "image";
type Phase = "select" | "editor" | "working" | "done";

interface El {
  id: string;
  page: number;
  type: "text" | "highlight" | "rect" | "image";
  xFrac: number;
  yFrac: number;
  wFrac: number;
  hFrac: number;
  sizeFrac?: number;
  text?: string;
  color?: string;
  imageUrl?: string;
  imageBytes?: ArrayBuffer;
  imageType?: string;
}

function hexToRgb01(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function usePreviewSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ w: 1, h: 1 });
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

const tools: { id: Tool; label: string; Icon: typeof Type }[] = [
  { id: "select", label: "Select", Icon: MousePointer2 },
  { id: "text", label: "Text", Icon: Type },
  { id: "highlight", label: "Highlight", Icon: Highlighter },
  { id: "rect", label: "Box", Icon: Square },
  { id: "image", label: "Image", Icon: ImagePlus },
];

export function EditPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>("select");
  const [pageIndex, setPageIndex] = useState(0);
  const [tool, setTool] = useState<Tool>("select");
  const [els, setEls] = useState<El[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<{ bytes: ArrayBuffer; type: string; url: string; aspect: number } | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const size = usePreviewSize(canvasRef);
  const imageInput = useRef<HTMLInputElement>(null);
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
  const editorFile = phase === "editor" ? (file ?? undefined) : undefined;
  const current = usePageImage(editorFile, pageIndex, Math.round(540 * dpr), 0.92);
  const total = usePageCount(editorFile);
  const selected = els.find((e) => e.id === sel) ?? null;
  const pageEls = els.filter((e) => e.page === pageIndex);
  const drag = useRef<{ id: string; ox: number; oy: number } | null>(null);

  const reset = () => { setFile(null); setPhase("select"); setEls([]); setSel(null); setResult(null); setPageIndex(0); setTool("select"); };
  const update = (id: string, patch: Partial<El>) => setEls((e) => e.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const remove = (id: string) => { setEls((e) => e.filter((x) => x.id !== id)); setSel(null); };

  const fracAt = (clientX: number, clientY: number) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: (clientX - r.left) / r.width, y: (clientY - r.top) / r.height };
  };

  function placeAt(clientX: number, clientY: number) {
    const { x, y } = fracAt(clientX, clientY);
    const id = Math.random().toString(36).slice(2);
    if (tool === "text") setEls((e) => [...e, { id, page: pageIndex, type: "text", xFrac: x, yFrac: y, wFrac: 0.3, hFrac: 0.05, sizeFrac: 0.03, text: "Double-click to edit", color: "#16151D" }]);
    else if (tool === "highlight") setEls((e) => [...e, { id, page: pageIndex, type: "highlight", xFrac: x, yFrac: y, wFrac: 0.32, hFrac: 0.035, color: "#FFD400" }]);
    else if (tool === "rect") setEls((e) => [...e, { id, page: pageIndex, type: "rect", xFrac: x, yFrac: y, wFrac: 0.28, hFrac: 0.12, color: "#5A48F5" }]);
    else if (tool === "image" && pendingImage) {
      const wFrac = 0.3;
      const hFrac = wFrac * pendingImage.aspect * (size.w / size.h);
      setEls((e) => [...e, { id, page: pageIndex, type: "image", xFrac: x, yFrac: y, wFrac, hFrac, imageUrl: pendingImage.url, imageBytes: pendingImage.bytes, imageType: pendingImage.type }]);
      setPendingImage(null);
    } else return;
    setSel(id);
    setTool("select");
  }

  async function exportPdf() {
    if (!file) return;
    setPhase("working");
    const elements = els.map((e) => ({
      page: e.page,
      type: e.type,
      xFrac: e.xFrac,
      yFrac: e.yFrac,
      wFrac: e.wFrac,
      hFrac: e.hFrac,
      sizeFrac: e.sizeFrac,
      text: e.text,
      color: e.color ? hexToRgb01(e.color) : undefined,
      image: e.imageBytes ? { bytes: e.imageBytes, type: e.imageType! } : undefined,
    }));
    setResult(pdfBlob(await pdf().editApply(await file.arrayBuffer(), { elements })));
    setPhase("done");
  }

  if (phase === "select")
    return <Dropzone accept="application/pdf" onFiles={(f) => { setFile(f[0]); setPhase("editor"); }} hint="or click to browse · stays on your device" />;

  if (phase === "done" && result)
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#E5F5EE] text-[#18A06A]"><CheckCircle2 className="h-7 w-7" strokeWidth={1.8} /></span>
        <h2 className="mt-4 text-xl font-semibold text-ink">Your edited PDF is ready</h2>
        <div className="mx-auto mt-6 max-w-md"><Button variant="accent" size="lg" className="w-full" onClick={() => downloadBlob(result, "edited.pdf")}><Download className="h-4 w-4" /> Download edited.pdf</Button></div>
        <button onClick={reset} className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-graphite hover:text-ink"><RotateCcw className="h-3.5 w-3.5" /> Edit another</button>
      </div>
    );

  return (
    <div className="space-y-4">
      <input ref={imageInput} type="file" accept="image/png,image/jpeg" className="hidden" onChange={async (e) => {
        const f = e.target.files?.[0]; e.target.value = "";
        if (!f) return;
        const url = URL.createObjectURL(f);
        const img = new Image(); img.src = url; await img.decode();
        setPendingImage({ bytes: await f.arrayBuffer(), type: f.type, url, aspect: img.height / img.width });
        setTool("image");
      }} />

      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-line bg-surface p-1.5">
        {tools.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => (id === "image" ? imageInput.current?.click() : setTool(id))}
            className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors", tool === id ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-deep")}
          >
            <Icon className="h-4 w-4" strokeWidth={1.8} /> {label}
          </button>
        ))}
        <span className="ml-auto pr-2 text-xs text-graphite">{tool !== "select" ? "Click on the page to place" : `${els.length} element${els.length === 1 ? "" : "s"}`}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        {/* canvas */}
        <div>
          <div
            ref={canvasRef}
            onPointerDown={(e) => { if (tool !== "select") placeAt(e.clientX, e.clientY); else if (e.target === e.currentTarget) setSel(null); }}
            className={cn("relative mx-auto max-w-lg overflow-hidden rounded-xl border border-line bg-white", tool !== "select" && "cursor-crosshair")}
          >
            {current ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={current.url} alt={`Page ${pageIndex + 1}`} className="block w-full select-none" draggable={false} />
            ) : (
              <div className="grid aspect-[3/4] place-items-center"><Loader2 className="h-5 w-5 animate-spin text-graphite" /></div>
            )}
            {pageEls.map((el) => (
              <div
                key={el.id}
                onPointerDown={(e) => {
                  if (tool !== "select") return;
                  e.stopPropagation();
                  setSel(el.id);
                  const f = fracAt(e.clientX, e.clientY);
                  drag.current = { id: el.id, ox: f.x - el.xFrac, oy: f.y - el.yFrac };
                  (e.target as HTMLElement).setPointerCapture(e.pointerId);
                }}
                onPointerMove={(e) => {
                  if (drag.current?.id !== el.id) return;
                  const f = fracAt(e.clientX, e.clientY);
                  update(el.id, { xFrac: f.x - drag.current.ox, yFrac: f.y - drag.current.oy });
                }}
                onPointerUp={() => (drag.current = null)}
                onDoubleClick={() => { if (el.type === "text") { const t = prompt("Text", el.text); if (t != null) update(el.id, { text: t }); } }}
                className={cn("absolute cursor-move touch-none", sel === el.id && "outline outline-2 outline-iris")}
                style={{ left: `${el.xFrac * 100}%`, top: `${el.yFrac * 100}%`, width: el.type === "text" ? "auto" : `${el.wFrac * 100}%`, height: el.type === "text" ? "auto" : `${el.hFrac * 100}%` }}
              >
                {el.type === "text" ? (
                  <span style={{ fontSize: `${(el.sizeFrac ?? 0.03) * size.h}px`, color: el.color, lineHeight: 1, whiteSpace: "nowrap" }}>{el.text}</span>
                ) : el.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={el.imageUrl} alt="" className="h-full w-full" draggable={false} />
                ) : (
                  <div className="h-full w-full" style={{ backgroundColor: el.color, opacity: el.type === "highlight" ? 0.4 : 1 }} />
                )}
              </div>
            ))}
          </div>
          {total && total > 1 && (
            <div className="mt-3 flex items-center justify-center gap-3 text-sm">
              <button onClick={() => setPageIndex((i) => Math.max(0, i - 1))} disabled={pageIndex === 0} className="grid h-8 w-8 place-items-center rounded-full border border-line disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
              <span className="font-mono text-graphite">Page {pageIndex + 1} / {total}</span>
              <button onClick={() => setPageIndex((i) => Math.min(total - 1, i + 1))} disabled={pageIndex === total - 1} className="grid h-8 w-8 place-items-center rounded-full border border-line disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
            </div>
          )}
        </div>

        {/* properties */}
        <div className="rounded-xl border border-line bg-surface p-4">
          {selected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-[0.12em] text-graphite">{selected.type}</span>
                <button onClick={() => remove(selected.id)} aria-label="Delete" className="grid h-8 w-8 place-items-center rounded-full text-graphite hover:bg-[#FCEAEA] hover:text-[#E5484D]"><Trash2 className="h-4 w-4" /></button>
              </div>
              {selected.type === "text" && (
                <>
                  <Slider label="Text size" min={1} max={10} value={Math.round((selected.sizeFrac ?? 0.03) * 100)} onChange={(v) => update(selected.id, { sizeFrac: v / 100 })} display={(v) => `${v}%`} />
                  <div className="space-y-2"><span className="text-sm font-medium text-ink">Color</span><ColorPicker value={selected.color ?? "#16151D"} onChange={(c) => update(selected.id, { color: c })} /></div>
                </>
              )}
              {(selected.type === "rect" || selected.type === "image") && (
                <Slider label="Width" min={5} max={90} value={Math.round(selected.wFrac * 100)} onChange={(v) => update(selected.id, { wFrac: v / 100 })} display={(v) => `${v}%`} />
              )}
              {selected.type !== "text" && selected.type !== "image" && (
                <Slider label="Height" min={2} max={90} value={Math.round(selected.hFrac * 100)} onChange={(v) => update(selected.id, { hFrac: v / 100 })} display={(v) => `${v}%`} />
              )}
              {selected.type === "rect" && (
                <div className="space-y-2"><span className="text-sm font-medium text-ink">Color</span><ColorPicker value={selected.color ?? "#5A48F5"} onChange={(c) => update(selected.id, { color: c })} /></div>
              )}
            </div>
          ) : (
            <p className="text-sm text-graphite">Pick a tool above, click the page to add it, then select an element here to adjust or delete it.</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={reset} className="inline-flex items-center gap-1.5 text-sm font-medium text-graphite hover:text-ink"><RotateCcw className="h-3.5 w-3.5" /> Start over</button>
        <Button variant="accent" size="lg" onClick={exportPdf} disabled={phase === "working" || !els.length}>{phase === "working" ? <><Loader2 className="h-4 w-4 animate-spin" /> Working…</> : "Apply & download"}</Button>
      </div>
    </div>
  );
}

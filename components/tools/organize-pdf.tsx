"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCw, Trash2, Loader2, Download, RotateCcw, CheckCircle2, Move } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dropzone } from "./_shared/dropzone";
import { renderThumbnails } from "@/lib/pdf/render";
import { pdf } from "@/lib/pdf/client";
import { pdfBlob } from "@/lib/pdf/types";
import { downloadBlob } from "@/lib/pdf/download";

interface Page {
  key: string;
  src: number;
  rotation: number;
  url: string;
}
type Phase = "select" | "edit" | "working" | "done";

export function OrganizePdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [phase, setPhase] = useState<Phase>("select");
  const dragKey = useRef<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [result, setResult] = useState<{ name: string; blob: Blob } | null>(null);

  useEffect(() => {
    if (!file) return;
    let alive = true;
    setPhase("working");
    file
      .arrayBuffer()
      .then((b) => renderThumbnails(b, 420, 0.78))
      .then((t) => {
        if (!alive) return;
        setPages(t.map((p) => ({ key: `p${p.index}`, src: p.index, rotation: 0, url: p.url })));
        setPhase("edit");
      });
    return () => {
      alive = false;
    };
  }, [file]);

  const reset = () => {
    setFile(null);
    setPages([]);
    setResult(null);
    setPhase("select");
  };
  const rotate = (key: string) => setPages((p) => p.map((x) => (x.key === key ? { ...x, rotation: (x.rotation + 90) % 360 } : x)));
  const remove = (key: string) => setPages((p) => p.filter((x) => x.key !== key));

  // Pointer-based reorder: grab anywhere on a page, works with mouse + touch.
  const moveOver = (overKey: string) => {
    if (!dragKey.current || dragKey.current === overKey) return;
    setPages((p) => {
      const from = p.findIndex((x) => x.key === dragKey.current);
      const to = p.findIndex((x) => x.key === overKey);
      if (from < 0 || to < 0 || from === to) return p;
      const next = [...p];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };
  const startDrag = (e: React.PointerEvent, key: string) => {
    dragKey.current = key;
    setDragging(key);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragKey.current) return;
    const tile = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)?.closest("[data-pk]");
    const key = tile?.getAttribute("data-pk");
    if (key) moveOver(key);
  };
  const endDrag = () => {
    dragKey.current = null;
    setDragging(null);
  };

  async function apply() {
    if (!file || !pages.length) return;
    setPhase("working");
    const bytes = await pdf().organize(await file.arrayBuffer(), { order: pages.map((p) => ({ src: p.src, rotation: p.rotation })) });
    setResult({ name: "organized.pdf", blob: pdfBlob(bytes) });
    setPhase("done");
  }

  if (phase === "select") {
    return <Dropzone accept="application/pdf" onFiles={(f) => setFile(f[0])} hint="or click to browse · stays on your device" />;
  }

  if (phase === "done" && result) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#E5F5EE] text-[#18A06A]">
          <CheckCircle2 className="h-7 w-7" strokeWidth={1.8} />
        </span>
        <h2 className="mt-4 text-xl font-semibold text-ink">Your organized PDF is ready</h2>
        <div className="mx-auto mt-6 max-w-md">
          <Button variant="accent" size="lg" className="w-full" onClick={() => downloadBlob(result.blob, result.name)}>
            <Download className="h-4 w-4" /> Download organized.pdf
          </Button>
        </div>
        <button onClick={reset} className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-graphite hover:text-ink">
          <RotateCcw className="h-3.5 w-3.5" /> Do another
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {phase === "working" ? (
        <div className="grid h-64 place-items-center rounded-2xl border border-line bg-surface">
          <span className="flex items-center gap-2 text-sm text-graphite">
            <Loader2 className="h-4 w-4 animate-spin" /> Working…
          </span>
        </div>
      ) : (
        <>
          <p className="text-sm text-graphite">Drag any page to reorder it. Hover a page to rotate or delete it.</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {pages.map((page, i) => (
              <div
                key={page.key}
                data-pk={page.key}
                onPointerDown={(e) => startDrag(e, page.key)}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                className={cn(
                  "group relative touch-none cursor-grab select-none overflow-hidden rounded-lg border bg-white transition-transform active:cursor-grabbing",
                  dragging === page.key ? "z-10 scale-[0.97] border-iris opacity-80 shadow-lift" : "border-line hover:border-iris/40",
                )}
              >
                <div className="flex aspect-[3/4] items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={page.url}
                    alt={`Page ${page.src + 1}`}
                    draggable={false}
                    className="pointer-events-none max-h-full max-w-full transition-transform duration-200"
                    style={{ transform: `rotate(${page.rotation}deg)` }}
                  />
                </div>
                <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded bg-ink/70 px-1 py-0.5 font-mono text-[0.6rem] text-white">
                  <Move className="h-2.5 w-2.5" /> {i + 1}
                </span>
                <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-gradient-to-t from-ink/70 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onPointerDown={(e) => e.stopPropagation()} onClick={() => rotate(page.key)} aria-label="Rotate page" className="grid h-7 w-7 place-items-center rounded-full bg-white text-ink hover:bg-iris hover:text-white">
                    <RotateCw className="h-3.5 w-3.5" />
                  </button>
                  <button onPointerDown={(e) => e.stopPropagation()} onClick={() => remove(page.key)} aria-label="Delete page" className="grid h-7 w-7 place-items-center rounded-full bg-white text-ink hover:bg-[#E5484D] hover:text-white">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button onClick={reset} className="inline-flex items-center gap-1.5 text-sm font-medium text-graphite hover:text-ink">
              <RotateCcw className="h-3.5 w-3.5" /> Start over
            </button>
            <Button variant="accent" size="lg" onClick={apply} disabled={!pages.length} className="min-w-[12rem]">
              Apply changes
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Dropzone } from "./_shared/dropzone";
import { usePageThumbs } from "./_shared/page-grid";
import { cn } from "@/lib/utils";

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => res(img);
    img.src = url;
  });
}

export function ComparePdfTool() {
  const [a, setA] = useState<File | null>(null);
  const [b, setB] = useState<File | null>(null);
  const [page, setPage] = useState(0);
  const [diff, setDiff] = useState(false);
  const overlay = useRef<HTMLCanvasElement>(null);
  // Render at high resolution — these pages are shown near full column width, not as small grid thumbnails.
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
  const renderWidth = Math.round(900 * dpr);
  const thumbsA = usePageThumbs(a ?? undefined, renderWidth, 0.92);
  const thumbsB = usePageThumbs(b ?? undefined, renderWidth, 0.92);
  const both = a && b;
  const ca = thumbsA?.[page];
  const cb = thumbsB?.[page];
  const maxPages = Math.max(thumbsA?.length ?? 0, thumbsB?.length ?? 0);

  useEffect(() => {
    if (!diff || !ca || !cb || !overlay.current) return;
    let alive = true;
    (async () => {
      const [ia, ib] = await Promise.all([loadImage(ca.url), loadImage(cb.url)]);
      if (!alive) return;
      const w = Math.max(ia.width, ib.width);
      const h = Math.max(ia.height, ib.height);
      const mk = (img: HTMLImageElement) => {
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const x = c.getContext("2d")!;
        x.fillStyle = "#fff";
        x.fillRect(0, 0, w, h);
        x.drawImage(img, 0, 0);
        return x.getImageData(0, 0, w, h);
      };
      const da = mk(ia).data;
      const db = mk(ib).data;
      const out = overlay.current!;
      out.width = w;
      out.height = h;
      const octx = out.getContext("2d")!;
      const res = octx.createImageData(w, h);
      for (let i = 0; i < da.length; i += 4) {
        const d = Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]);
        if (d > 60) {
          res.data[i] = 229;
          res.data[i + 1] = 72;
          res.data[i + 2] = 77;
          res.data[i + 3] = 150;
        }
      }
      octx.putImageData(res, 0, 0);
    })();
    return () => {
      alive = false;
    };
  }, [diff, ca, cb]);

  if (!both) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[{ label: "Original", file: a, set: setA }, { label: "Modified", file: b, set: setB }].map((slot) => (
          <div key={slot.label}>
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-graphite">{slot.label}</p>
            {slot.file ? (
              <div className="flex items-center justify-between rounded-xl border border-line bg-surface p-3 text-sm">
                <span className="truncate text-ink">{slot.file.name}</span>
                <button onClick={() => slot.set(null)} className="text-graphite hover:text-ink">change</button>
              </div>
            ) : (
              <Dropzone accept="application/pdf" onFiles={(f) => slot.set(f[0])} compact title="Drop PDF" hint="click to browse" />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
          <input type="checkbox" checked={diff} onChange={(e) => setDiff(e.target.checked)} className="h-4 w-4 accent-iris" />
          Highlight differences
        </label>
        {maxPages > 1 && (
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="grid h-8 w-8 place-items-center rounded-full border border-line disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
            <span className="font-mono text-graphite">Page {page + 1} / {maxPages}</span>
            <button onClick={() => setPage((p) => Math.min(maxPages - 1, p + 1))} disabled={page === maxPages - 1} className="grid h-8 w-8 place-items-center rounded-full border border-line disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[{ c: ca, label: "Original" }, { c: cb, label: "Modified" }].map((s, idx) => (
          <div key={idx}>
            <p className="mb-1.5 font-mono text-xs uppercase tracking-[0.12em] text-graphite">{s.label}</p>
            <div className="relative overflow-hidden rounded-xl border border-line bg-white">
              {s.c ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.c.url} alt={`${s.label} page ${page + 1}`} className="block w-full" />
              ) : (
                <div className="grid aspect-[3/4] place-items-center text-xs text-graphite">No page {page + 1}</div>
              )}
              {idx === 0 && diff && <canvas ref={overlay} className="pointer-events-none absolute inset-0 h-full w-full" />}
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => { setA(null); setB(null); setPage(0); }} className="inline-flex items-center gap-1.5 text-sm font-medium text-graphite hover:text-ink">
        <RotateCcw className="h-3.5 w-3.5" /> Compare other files
      </button>
    </div>
  );
}

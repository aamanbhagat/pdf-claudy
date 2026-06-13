"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { renderThumbnails, renderPage, pageCount, type ThumbInfo, type PageImage } from "@/lib/pdf/render";
import { cn } from "@/lib/utils";

export function usePageThumbs(file: File | undefined, targetWidth = 420, quality = 0.78) {
  const [thumbs, setThumbs] = useState<ThumbInfo[] | null>(null);
  useEffect(() => {
    if (!file) return;
    let alive = true;
    setThumbs(null);
    file
      .arrayBuffer()
      .then((b) => renderThumbnails(b, targetWidth, quality))
      .then((t) => alive && setThumbs(t))
      .catch(() => alive && setThumbs([]));
    return () => {
      alive = false;
    };
  }, [file, targetWidth, quality]);
  return thumbs;
}

/** Total page count, independent of any single-page render (stays available while pages change). */
export function usePageCount(file: File | undefined) {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    if (!file) return;
    let alive = true;
    setCount(null);
    file
      .arrayBuffer()
      .then((b) => pageCount(b))
      .then((n) => alive && setCount(n))
      .catch(() => alive && setCount(null));
    return () => {
      alive = false;
    };
  }, [file]);
  return count;
}

/** High-resolution render of one page, for editors that show one page at a time (redact, edit, sign, crop). */
export function usePageImage(file: File | undefined, pageIndex: number, targetWidth = 1000, quality = 0.9) {
  const [image, setImage] = useState<PageImage | null>(null);
  useEffect(() => {
    if (!file) return;
    let alive = true;
    setImage(null);
    file
      .arrayBuffer()
      .then((b) => renderPage(b, pageIndex, targetWidth, quality))
      .then((img) => alive && setImage(img))
      .catch(() => alive && setImage(null));
    return () => {
      alive = false;
    };
  }, [file, pageIndex, targetWidth, quality]);
  return image;
}

function Skeleton() {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="aspect-[3/4] animate-pulse rounded-lg bg-paper-deep" />
      ))}
    </div>
  );
}

export function PageGrid({
  thumbs,
  isSelected,
  onToggle,
  accent = "#5A48F5",
}: {
  thumbs: ThumbInfo[] | null;
  isSelected: (index: number) => boolean;
  onToggle: (index: number) => void;
  accent?: string;
}) {
  if (!thumbs) return <Skeleton />;
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
      {thumbs.map((t) => {
        const sel = isSelected(t.index);
        return (
          <button
            key={t.index}
            onClick={() => onToggle(t.index)}
            aria-pressed={sel}
            className={cn(
              "group relative overflow-hidden rounded-lg border-2 bg-white transition-all hover:-translate-y-0.5",
              sel ? "shadow-soft" : "border-line",
            )}
            style={sel ? { borderColor: accent } : undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.url} alt={`Page ${t.index + 1}`} className="block w-full" />
            <span className="absolute left-1 top-1 rounded bg-ink/70 px-1.5 py-0.5 font-mono text-[0.6rem] text-white">
              {t.index + 1}
            </span>
            {sel && (
              <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full text-white" style={{ backgroundColor: accent }}>
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

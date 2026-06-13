import * as pdfjsLib from "pdfjs-dist";
import type { OutputFile } from "./types";

let configured = false;
function ensure() {
  if (configured) return;
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  configured = true;
}

function open(buffer: ArrayBuffer, password?: string) {
  ensure();
  return pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)), password });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Canvas export failed"))), type, quality),
  );
}

export async function pageCount(buffer: ArrayBuffer): Promise<number> {
  const task = open(buffer);
  const doc = await task.promise;
  const n = doc.numPages;
  task.destroy();
  return n;
}

export interface ThumbInfo {
  index: number;
  url: string;
  width: number;
  height: number;
}

/** Small page previews for grid UIs (organize, crop, etc.). */
export async function renderThumbnails(buffer: ArrayBuffer, targetWidth = 200): Promise<ThumbInfo[]> {
  const task = open(buffer);
  const doc = await task.promise;
  const thumbs: ThumbInfo[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: targetWidth / base.width });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    thumbs.push({ index: i - 1, url: canvas.toDataURL("image/jpeg", 0.7), width: canvas.width, height: canvas.height });
    page.cleanup();
  }
  task.destroy();
  return thumbs;
}

/** Render each page to a JPEG, returning the bytes plus the page size in PDF points. */
export async function rasterize(
  buffer: ArrayBuffer,
  opts: { scale: number; quality: number; password?: string },
): Promise<{ bytes: ArrayBuffer; w: number; h: number }[]> {
  const task = open(buffer, opts.password);
  const doc = await task.promise;
  const pages: { bytes: ArrayBuffer; w: number; h: number }[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const pt = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: opts.scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    const blob = await canvasToBlob(canvas, "image/jpeg", opts.quality);
    pages.push({ bytes: await blob.arrayBuffer(), w: pt.width, h: pt.height });
    page.cleanup();
  }
  task.destroy();
  return pages;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Rasterize pages, burning opaque black boxes (fractional coords) into them — true redaction. */
export async function rasterizeRedacted(
  buffer: ArrayBuffer,
  opts: { scale: number; quality: number; boxes: Record<number, Rect[]> },
): Promise<{ bytes: ArrayBuffer; w: number; h: number }[]> {
  const task = open(buffer);
  const doc = await task.promise;
  const pages: { bytes: ArrayBuffer; w: number; h: number }[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const pt = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: opts.scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    ctx.fillStyle = "#000000";
    for (const b of opts.boxes[i - 1] ?? []) {
      ctx.fillRect(b.x * canvas.width, b.y * canvas.height, b.w * canvas.width, b.h * canvas.height);
    }
    const blob = await canvasToBlob(canvas, "image/jpeg", opts.quality);
    pages.push({ bytes: await blob.arrayBuffer(), w: pt.width, h: pt.height });
    page.cleanup();
  }
  task.destroy();
  return pages;
}

/** Render every page to an image file. */
export async function renderPages(
  buffer: ArrayBuffer,
  opts: { dpi: number; format: "image/jpeg" | "image/png"; quality: number },
): Promise<OutputFile[]> {
  const task = open(buffer);
  const doc = await task.promise;
  const scale = opts.dpi / 72;
  const ext = opts.format === "image/png" ? "png" : "jpg";
  const files: OutputFile[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d")!;
    if (opts.format === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    files.push({ name: `page-${String(i).padStart(3, "0")}.${ext}`, blob: await canvasToBlob(canvas, opts.format, opts.quality) });
    page.cleanup();
  }
  task.destroy();
  return files;
}

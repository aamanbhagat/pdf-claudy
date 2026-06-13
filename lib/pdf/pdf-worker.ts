/// <reference lib="webworker" />
import * as Comlink from "comlink";
import {
  PDFDocument,
  degrees,
  rgb,
  StandardFonts,
  PDFTextField,
  PDFCheckBox,
  PDFDropdown,
  PDFRadioGroup,
  PDFOptionList,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import { PDFDocument as SecureDoc } from "@cantoo/pdf-lib";

export interface FormField {
  name: string;
  type: "text" | "checkbox" | "dropdown" | "radio" | "optionlist" | "unknown";
  options?: string[];
}

const load = (buf: ArrayBuffer) => PDFDocument.load(buf, { ignoreEncryption: true });
const out = (bytes: Uint8Array) => Comlink.transfer(bytes, [bytes.buffer]);

export type WatermarkPosition =
  | "center"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "tile";
export type NumberPosition = "bottom-center" | "bottom-right" | "bottom-left" | "top-center" | "top-right" | "top-left";
export type PageSize = "fit" | "a4" | "letter";

const A4 = { w: 595.28, h: 841.89 };
const LETTER = { w: 612, h: 792 };

function place(
  pos: NumberPosition,
  pageW: number,
  pageH: number,
  textW: number,
  fontSize: number,
  margin: number,
) {
  const x = pos.endsWith("left") ? margin : pos.endsWith("right") ? pageW - textW - margin : (pageW - textW) / 2;
  const y = pos.startsWith("top") ? pageH - fontSize - margin : margin;
  return { x, y };
}

const api = {
  async getPageCount(buf: ArrayBuffer) {
    return (await load(buf)).getPageCount();
  },

  async merge(buffers: ArrayBuffer[]) {
    const doc = await PDFDocument.create();
    for (const b of buffers) {
      const src = await load(b);
      const pages = await doc.copyPages(src, src.getPageIndices());
      pages.forEach((p) => doc.addPage(p));
    }
    return out(await doc.save());
  },

  /** angle in degrees added to current rotation; pages = 0-based indices (empty = all). */
  async rotate(buffer: ArrayBuffer, opts: { angle: number; pages?: number[] }) {
    const doc = await load(buffer);
    const targets = new Set(opts.pages?.length ? opts.pages : doc.getPageIndices());
    doc.getPages().forEach((page, i) => {
      if (!targets.has(i)) return;
      const cur = page.getRotation().angle;
      page.setRotation(degrees((cur + opts.angle) % 360));
    });
    return out(await doc.save());
  },

  /** Remove the given 0-based page indices. */
  async removePages(buffer: ArrayBuffer, opts: { pages: number[] }) {
    const doc = await load(buffer);
    [...new Set(opts.pages)].sort((a, b) => b - a).forEach((i) => doc.removePage(i));
    return out(await doc.save());
  },

  /** Keep only the given 0-based indices, in the given order. */
  async keepPages(buffer: ArrayBuffer, opts: { pages: number[] }) {
    const src = await load(buffer);
    const doc = await PDFDocument.create();
    const pages = await doc.copyPages(src, opts.pages);
    pages.forEach((p) => doc.addPage(p));
    return out(await doc.save());
  },

  /** Split into multiple PDFs by inclusive 0-based ranges. */
  async splitRanges(buffer: ArrayBuffer, opts: { ranges: { from: number; to: number }[] }) {
    const src = await load(buffer);
    const results: { name: string; bytes: Uint8Array }[] = [];
    let n = 1;
    for (const r of opts.ranges) {
      const idx: number[] = [];
      for (let i = r.from; i <= r.to; i++) idx.push(i);
      const doc = await PDFDocument.create();
      const pages = await doc.copyPages(src, idx);
      pages.forEach((p) => doc.addPage(p));
      results.push({
        name: r.from === r.to ? `page-${r.from + 1}.pdf` : `pages-${r.from + 1}-${r.to + 1}.pdf`,
        bytes: await doc.save(),
      });
      n++;
    }
    return results;
  },

  /** Reorder / rotate / drop pages in one pass. order = [{src, rotation}]. */
  async organize(buffer: ArrayBuffer, opts: { order: { src: number; rotation: number }[] }) {
    const src = await load(buffer);
    const doc = await PDFDocument.create();
    const pages = await doc.copyPages(src, opts.order.map((o) => o.src));
    pages.forEach((p, i) => {
      const rot = opts.order[i].rotation % 360;
      if (rot) p.setRotation(degrees(rot));
      doc.addPage(p);
    });
    return out(await doc.save());
  },

  async addPageNumbers(
    buffer: ArrayBuffer,
    opts: { position: NumberPosition; fontSize: number; startAt: number; margin: number; format: "n" | "n-of-total" },
  ) {
    const doc = await load(buffer);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const pages = doc.getPages();
    const total = pages.length;
    pages.forEach((page, i) => {
      const label = opts.format === "n-of-total" ? `${opts.startAt + i} / ${opts.startAt + total - 1}` : `${opts.startAt + i}`;
      const w = font.widthOfTextAtSize(label, opts.fontSize);
      const { width, height } = page.getSize();
      const { x, y } = place(opts.position, width, height, w, opts.fontSize, opts.margin);
      page.drawText(label, { x, y, size: opts.fontSize, font, color: rgb(0.1, 0.1, 0.12) });
    });
    return out(await doc.save());
  },

  async watermarkText(
    buffer: ArrayBuffer,
    opts: { text: string; fontSize: number; opacity: number; rotation: number; position: WatermarkPosition; color: [number, number, number] },
  ) {
    const doc = await load(buffer);
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    const [r, g, b] = opts.color;
    doc.getPages().forEach((page) => drawWatermark(page, font, opts, r, g, b));
    return out(await doc.save());
  },

  async watermarkImage(
    buffer: ArrayBuffer,
    image: { bytes: ArrayBuffer; type: string },
    opts: { scale: number; opacity: number; position: WatermarkPosition },
  ) {
    const doc = await load(buffer);
    const img = image.type.includes("png") ? await doc.embedPng(image.bytes) : await doc.embedJpg(image.bytes);
    doc.getPages().forEach((page) => {
      const { width, height } = page.getSize();
      const w = width * opts.scale;
      const dims = img.scale(w / img.width);
      const positions = wmPositions(opts.position, width, height, dims.width, dims.height);
      positions.forEach(([x, y]) => page.drawImage(img, { x, y, width: dims.width, height: dims.height, opacity: opts.opacity }));
    });
    return out(await doc.save());
  },

  /** Crop by margin fractions (0..0.45) of each page's box. */
  async cropMargins(buffer: ArrayBuffer, opts: { top: number; right: number; bottom: number; left: number; pages?: number[] }) {
    const doc = await load(buffer);
    const targets = new Set(opts.pages?.length ? opts.pages : doc.getPageIndices());
    doc.getPages().forEach((page, i) => {
      if (!targets.has(i)) return;
      const { width, height } = page.getSize();
      const x = width * opts.left;
      const y = height * opts.bottom;
      const w = width * (1 - opts.left - opts.right);
      const h = height * (1 - opts.top - opts.bottom);
      page.setCropBox(x, y, w, h);
    });
    return out(await doc.save());
  },

  async imagesToPdf(
    images: { bytes: ArrayBuffer; type: string }[],
    opts: { size: PageSize; margin: number; orientation: "auto" | "portrait" | "landscape" },
  ) {
    const doc = await PDFDocument.create();
    for (const image of images) {
      const img = image.type.includes("png") ? await doc.embedPng(image.bytes) : await doc.embedJpg(image.bytes);
      let pw: number, ph: number;
      if (opts.size === "fit") {
        pw = img.width + opts.margin * 2;
        ph = img.height + opts.margin * 2;
      } else {
        const base = opts.size === "a4" ? A4 : LETTER;
        const landscape = opts.orientation === "landscape" || (opts.orientation === "auto" && img.width > img.height);
        pw = landscape ? base.h : base.w;
        ph = landscape ? base.w : base.h;
      }
      const page = doc.addPage([pw, ph]);
      const maxW = pw - opts.margin * 2;
      const maxH = ph - opts.margin * 2;
      const scale = Math.min(maxW / img.width, maxH / img.height, 1);
      const w = img.width * scale;
      const h = img.height * scale;
      page.drawImage(img, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h });
    }
    return out(await doc.save());
  },

  /** Rebuild a PDF from one JPEG per page at the given point sizes (used by Compress). */
  async imagesToSizedPdf(pages: { bytes: ArrayBuffer; w: number; h: number }[]) {
    const doc = await PDFDocument.create();
    for (const pg of pages) {
      const img = await doc.embedJpg(pg.bytes);
      const page = doc.addPage([pg.w, pg.h]);
      page.drawImage(img, { x: 0, y: 0, width: pg.w, height: pg.h });
    }
    return out(await doc.save());
  },

  /** Encrypt with a password (AES). Lossless — via @cantoo/pdf-lib. */
  async protect(buffer: ArrayBuffer, opts: { password: string }) {
    const doc = await SecureDoc.load(buffer, { ignoreEncryption: true });
    doc.encrypt({ userPassword: opts.password, ownerPassword: opts.password });
    return out(await doc.save({ useObjectStreams: false }));
  },

  /** Lossless unlock: strip permission/owner encryption by re-saving (no password needed). */
  async unlock(buffer: ArrayBuffer) {
    const doc = await SecureDoc.load(buffer, { ignoreEncryption: true });
    return out(await doc.save({ useObjectStreams: false }));
  },

  /** Stamp an image onto one page, centered at fractional coords (yFrac from top). */
  async stampImage(
    buffer: ArrayBuffer,
    opts: { image: { bytes: ArrayBuffer; type: string }; pageIndex: number; xFrac: number; yFrac: number; widthFrac: number },
  ) {
    const doc = await load(buffer);
    const img = opts.image.type.includes("png") ? await doc.embedPng(opts.image.bytes) : await doc.embedJpg(opts.image.bytes);
    const page = doc.getPage(Math.min(opts.pageIndex, doc.getPageCount() - 1));
    const { width, height } = page.getSize();
    const dims = img.scale((width * opts.widthFrac) / img.width);
    page.drawImage(img, {
      x: opts.xFrac * width - dims.width / 2,
      y: (1 - opts.yFrac) * height - dims.height / 2,
      width: dims.width,
      height: dims.height,
    });
    return out(await doc.save());
  },

  async listFormFields(buffer: ArrayBuffer): Promise<FormField[]> {
    const doc = await load(buffer);
    return doc.getForm().getFields().map((f): FormField => {
      const name = f.getName();
      if (f instanceof PDFTextField) return { name, type: "text" };
      if (f instanceof PDFCheckBox) return { name, type: "checkbox" };
      if (f instanceof PDFDropdown) return { name, type: "dropdown", options: f.getOptions() };
      if (f instanceof PDFRadioGroup) return { name, type: "radio", options: f.getOptions() };
      if (f instanceof PDFOptionList) return { name, type: "optionlist", options: f.getOptions() };
      return { name, type: "unknown" };
    });
  },

  async fillForm(buffer: ArrayBuffer, opts: { values: Record<string, string | boolean>; flatten: boolean }) {
    const doc = await load(buffer);
    const form = doc.getForm();
    for (const [name, value] of Object.entries(opts.values)) {
      const field = form.getFields().find((f) => f.getName() === name);
      if (!field) continue;
      if (field instanceof PDFTextField) field.setText(String(value));
      else if (field instanceof PDFCheckBox) value ? field.check() : field.uncheck();
      else if ((field instanceof PDFDropdown || field instanceof PDFRadioGroup) && value) field.select(String(value));
    }
    if (opts.flatten) form.flatten();
    return out(await doc.save());
  },
};

function drawWatermark(
  page: PDFPage,
  font: PDFFont,
  opts: { text: string; fontSize: number; opacity: number; rotation: number; position: WatermarkPosition },
  r: number,
  g: number,
  b: number,
) {
  const { width, height } = page.getSize();
  const tw = font.widthOfTextAtSize(opts.text, opts.fontSize);
  const draw = (x: number, y: number) =>
    page.drawText(opts.text, { x, y, size: opts.fontSize, font, color: rgb(r, g, b), opacity: opts.opacity, rotate: degrees(opts.rotation) });
  if (opts.position === "tile") {
    const stepX = tw + 120;
    const stepY = opts.fontSize + 120;
    for (let y = 40; y < height; y += stepY) for (let x = 0; x < width; x += stepX) draw(x, y);
    return;
  }
  const m = 40;
  const pos: Record<string, [number, number]> = {
    center: [(width - tw) / 2, height / 2],
    "top-left": [m, height - opts.fontSize - m],
    "top-right": [width - tw - m, height - opts.fontSize - m],
    "bottom-left": [m, m],
    "bottom-right": [width - tw - m, m],
  };
  const [x, y] = pos[opts.position] ?? pos.center;
  draw(x, y);
}

function wmPositions(position: WatermarkPosition, W: number, H: number, w: number, h: number): [number, number][] {
  const m = 24;
  if (position === "tile") {
    const out: [number, number][] = [];
    for (let y = 0; y < H; y += h + 80) for (let x = 0; x < W; x += w + 80) out.push([x, y]);
    return out;
  }
  const map: Record<string, [number, number]> = {
    center: [(W - w) / 2, (H - h) / 2],
    "top-left": [m, H - h - m],
    "top-right": [W - w - m, H - h - m],
    "bottom-left": [m, m],
    "bottom-right": [W - w - m, m],
  };
  return [map[position] ?? map.center];
}

export type PdfApi = typeof api;
Comlink.expose(api);

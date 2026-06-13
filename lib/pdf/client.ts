import * as Comlink from "comlink";
import type { PdfApi } from "./pdf-worker";

let cached: Comlink.Remote<PdfApi> | null = null;

/** Lazily-created, shared PDF worker (pdf-lib runs off the main thread). */
export function pdf(): Comlink.Remote<PdfApi> {
  if (!cached) {
    const worker = new Worker(new URL("./pdf-worker.ts", import.meta.url), { type: "module" });
    cached = Comlink.wrap<PdfApi>(worker);
  }
  return cached;
}

/** Read a File into a fresh ArrayBuffer suitable for transfer to the worker. */
export async function toBuffer(file: File | Blob): Promise<ArrayBuffer> {
  return file.arrayBuffer();
}

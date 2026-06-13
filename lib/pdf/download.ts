import JSZip from "jszip";
import type { OutputFile } from "./types";

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadZip(files: OutputFile[], zipName: string) {
  const zip = new JSZip();
  for (const f of files) zip.file(f.name, await f.blob.arrayBuffer());
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
  downloadBlob(blob, zipName);
}

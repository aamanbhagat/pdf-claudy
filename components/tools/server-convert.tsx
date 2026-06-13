"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Download, RotateCcw, CheckCircle2, Loader2, Server, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dropzone } from "./_shared/dropzone";
import { Segmented, TextInput } from "./_shared/controls";
import { getTool } from "@/lib/tools";
import { downloadBlob } from "@/lib/pdf/download";

type Phase = "select" | "working" | "done" | "error";

// Per-op input/output config. Keys match the tool slugs registered to this widget.
const CONFIG: Record<string, { accept: string; out: string; allowUrl?: boolean }> = {
  "word-to-pdf": { accept: ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document", out: "pdf" },
  "powerpoint-to-pdf": { accept: ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation", out: "pdf" },
  "excel-to-pdf": { accept: ".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", out: "pdf" },
  "pdf-to-word": { accept: "application/pdf", out: "docx" },
  "pdf-to-pdfa": { accept: "application/pdf", out: "pdf" },
  "repair-pdf": { accept: "application/pdf", out: "pdf" },
  "html-to-pdf": { accept: ".html,.htm,text/html", out: "pdf", allowUrl: true },
};

export function ServerConvertTool() {
  const slug = (usePathname() || "").replace(/^\//, "");
  const cfg = CONFIG[slug];
  const tool = getTool(slug);

  const [mode, setMode] = useState<"file" | "url">("file");
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("select");
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const [error, setError] = useState<string>("");

  if (!cfg) return null;

  const reset = () => {
    setPhase("select");
    setResult(null);
    setError("");
    setUrl("");
  };

  async function convert(file: File | null) {
    setPhase("working");
    setError("");
    try {
      const form = new FormData();
      if (file) form.append("file", file);
      if (mode === "url" && url.trim()) form.append("url", url.trim());

      const res = await fetch(`/api/convert/${slug}`, { method: "POST", body: form });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg.error || msg.detail || `Conversion failed (${res.status})`);
      }
      const blob = await res.blob();
      const base = file ? file.name.replace(/\.[^.]+$/, "") : "page";
      setResult({ blob, name: `${base}.${cfg.out}` });
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
      setPhase("error");
    }
  }

  if (phase === "done" && result) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#E5F5EE] text-[#18A06A]">
          <CheckCircle2 className="h-7 w-7" strokeWidth={1.8} />
        </span>
        <h2 className="mt-4 text-xl font-semibold text-ink">Your file is ready</h2>
        <p className="mt-1 text-sm text-graphite">Converted on our document server — the file was processed and then deleted.</p>
        <div className="mx-auto mt-6 max-w-md">
          <Button variant="accent" size="lg" className="w-full" onClick={() => downloadBlob(result.blob, result.name)}>
            <Download className="h-4 w-4" /> Download {result.name}
          </Button>
        </div>
        <button onClick={reset} className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-graphite hover:text-ink">
          <RotateCcw className="h-3.5 w-3.5" /> Convert another
        </button>
      </div>
    );
  }

  if (phase === "working") {
    return (
      <div className="grid place-items-center rounded-2xl border border-line bg-surface p-12 text-center">
        <Loader2 className="h-7 w-7 animate-spin text-iris" />
        <p className="mt-4 font-medium text-ink">Converting…</p>
        <p className="mt-1 text-sm text-graphite">{tool?.name} runs on our document server. This usually takes a few seconds.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cfg.allowUrl && (
        <Segmented
          value={mode}
          onChange={(m) => setMode(m as "file" | "url")}
          options={[{ value: "file", label: "Upload file" }, { value: "url", label: "From URL" }]}
        />
      )}

      {mode === "url" && cfg.allowUrl ? (
        <div className="space-y-3">
          <TextInput value={url} onChange={setUrl} placeholder="https://example.com" />
          <Button variant="accent" size="lg" className="w-full" disabled={!url.trim()} onClick={() => convert(null)}>
            <Link2 className="h-4 w-4" /> Convert page to PDF
          </Button>
        </div>
      ) : (
        <Dropzone accept={cfg.accept} onFiles={(f) => convert(f[0])} hint="or click to browse · processed on our server, then deleted" />
      )}

      {phase === "error" && (
        <p className="flex items-center gap-2 rounded-xl bg-[#FCEAEA] px-4 py-3 text-sm text-[#C0353A]">
          <Server className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

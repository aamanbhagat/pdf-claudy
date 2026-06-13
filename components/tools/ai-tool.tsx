"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Sparkles, Copy, Check, Download, RotateCcw, Loader2, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dropzone } from "./_shared/dropzone";
import { extractText } from "@/lib/pdf/render";
import { downloadBlob } from "@/lib/pdf/download";

type Phase = "select" | "running" | "done" | "error";

const LANGUAGES = [
  "Spanish", "French", "German", "Italian", "Portuguese", "Dutch",
  "Hindi", "Chinese (Simplified)", "Japanese", "Korean", "Arabic", "Russian",
];

export function AiTool() {
  const slug = (usePathname() || "").replace(/^\//, "");
  const op = slug === "translate-pdf" ? "translate" : "summarize";

  const [phase, setPhase] = useState<Phase>("select");
  const [language, setLanguage] = useState("Spanish");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const baseName = useRef("document");

  const reset = () => {
    setPhase("select");
    setOutput("");
    setError("");
    setCopied(false);
  };

  async function run(file: File) {
    baseName.current = file.name.replace(/\.[^.]+$/, "") || "document";
    setPhase("running");
    setOutput("");
    setError("");
    try {
      const text = await extractText(await file.arrayBuffer());
      if (!text) throw new Error("No readable text found. If this is a scanned PDF, run OCR first.");

      const res = await fetch(`/api/ai/${op}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, language }),
      });
      if (!res.ok || !res.body) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || `Request failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setOutput(acc);
      }
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setPhase("error");
    }
  }

  const label = op === "translate" ? `Translate to ${language}` : "Summarize";
  const outName = `${baseName.current}-${op === "translate" ? language.toLowerCase().replace(/\W+/g, "-") : "summary"}.txt`;

  if (phase === "running" || phase === "done") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-graphite">
            <Sparkles className="h-4 w-4 text-iris" />
            {op === "translate" ? `Translation · ${language}` : "Summary"}
            {phase === "running" && <Loader2 className="ml-1 h-3.5 w-3.5 animate-spin text-iris" />}
          </div>
          <div className="min-h-24 whitespace-pre-wrap text-pretty text-[0.95rem] leading-relaxed text-ink">
            {output || <span className="text-graphite">Reading your PDF and thinking…</span>}
          </div>
        </div>
        {phase === "done" && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(output);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? <Check className="h-4 w-4 text-[#18A06A]" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy"}
            </Button>
            <Button variant="outline" onClick={() => downloadBlob(new Blob([output], { type: "text/plain" }), outName)}>
              <Download className="h-4 w-4" /> Download .txt
            </Button>
            <button onClick={reset} className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-graphite hover:text-ink">
              <RotateCcw className="h-3.5 w-3.5" /> Do another
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {op === "translate" && (
        <label className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink">
            <Languages className="h-4 w-4 text-iris" /> Translate to
          </span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-iris"
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </label>
      )}

      <Dropzone accept="application/pdf" onFiles={(f) => run(f[0])} title={`Drop a PDF to ${label.toLowerCase()}`} hint="processed by AI · your file stays in your browser" />

      <p className="text-xs leading-relaxed text-graphite">
        Your PDF never leaves your device — only its extracted text is sent to our AI provider to{" "}
        {op === "translate" ? "translate it" : "write the summary"}.
      </p>

      {phase === "error" && (
        <p className="flex items-center gap-2 rounded-xl bg-[#FCEAEA] px-4 py-3 text-sm text-[#C0353A]">
          <Sparkles className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

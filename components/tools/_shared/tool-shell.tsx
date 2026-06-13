"use client";

import { useState, type ReactNode } from "react";
import { Download, X, ArrowUp, ArrowDown, FileText, RotateCcw, CheckCircle2, AlertCircle, Loader2, Plus } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dropzone } from "./dropzone";
import { downloadBlob, downloadZip } from "@/lib/pdf/download";
import type { OutputFile } from "@/lib/pdf/types";

type Phase = "idle" | "working" | "done" | "error";

export interface ToolShellProps<O> {
  accept: string;
  multiple?: boolean;
  reorderable?: boolean;
  minFiles?: number;
  /** File-type label, e.g. "PDF" or "image". */
  fileNoun?: string;
  defaultOptions: O;
  options?: (ctx: { files: File[]; value: O; set: (patch: Partial<O>) => void }) => ReactNode;
  run: (files: File[], value: O) => Promise<OutputFile[]>;
  actionLabel: string;
  zipName?: string;
  /** Hint shown under the result heading. */
  resultHint?: string;
}

export function ToolShell<O>({
  accept,
  multiple = false,
  reorderable = false,
  minFiles = 1,
  fileNoun = "file",
  defaultOptions,
  options,
  run,
  actionLabel,
  zipName = "quire-output.zip",
  resultHint,
}: ToolShellProps<O>) {
  const [files, setFiles] = useState<File[]>([]);
  const [value, setValue] = useState<O>(defaultOptions);
  const [phase, setPhase] = useState<Phase>("idle");
  const [results, setResults] = useState<OutputFile[]>([]);
  const [error, setError] = useState("");

  const set = (patch: Partial<O>) => setValue((v) => ({ ...v, ...patch }));

  const addFiles = (incoming: File[]) =>
    setFiles((prev) => (multiple ? [...prev, ...incoming] : incoming.slice(0, 1)));
  const removeAt = (i: number) => setFiles((f) => f.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) =>
    setFiles((f) => {
      const j = i + dir;
      if (j < 0 || j >= f.length) return f;
      const next = [...f];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const reset = () => {
    setFiles([]);
    setValue(defaultOptions);
    setResults([]);
    setError("");
    setPhase("idle");
  };

  async function process() {
    setPhase("working");
    setError("");
    try {
      const r = await run(files, value);
      setResults(r);
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong processing your file.");
      setPhase("error");
    }
  }

  if (phase === "done") {
    return <ResultPanel results={results} zipName={zipName} resultHint={resultHint} onReset={reset} />;
  }

  return (
    <div className="space-y-5">
      {files.length === 0 ? (
        <Dropzone accept={accept} multiple={multiple} onFiles={addFiles} hint={`or click to browse · ${fileNoun}s stay on your device`} />
      ) : (
        <>
          <ul className="space-y-2">
            {files.map((file, i) => (
              <li key={`${file.name}-${i}`} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-paper-deep text-graphite">
                  <FileText className="h-5 w-5" strokeWidth={1.7} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{file.name}</p>
                  <p className="font-mono text-xs text-graphite">{formatBytes(file.size)}</p>
                </div>
                {reorderable && files.length > 1 && (
                  <div className="flex flex-col">
                    <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="text-graphite hover:text-ink disabled:opacity-30">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button onClick={() => move(i, 1)} disabled={i === files.length - 1} aria-label="Move down" className="text-graphite hover:text-ink disabled:opacity-30">
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <button onClick={() => removeAt(i)} aria-label={`Remove ${file.name}`} className="grid h-8 w-8 place-items-center rounded-full text-graphite hover:bg-paper-deep hover:text-ink">
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          {multiple && (
            <Dropzone accept={accept} multiple onFiles={addFiles} compact title={`Add more ${fileNoun}s`} hint="drop or click" icon={<Plus className="h-5 w-5" strokeWidth={2} />} />
          )}

          {options && <div className="rounded-2xl border border-line bg-surface p-5">{options({ files, value, set })}</div>}

          {phase === "error" && (
            <p className="flex items-center gap-2 rounded-xl bg-[#FCEAEA] px-4 py-3 text-sm text-[#C0353A]">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button onClick={reset} className="inline-flex items-center gap-1.5 text-sm font-medium text-graphite hover:text-ink">
              <RotateCcw className="h-3.5 w-3.5" /> Start over
            </button>
            <Button variant="accent" size="lg" onClick={process} disabled={phase === "working" || files.length < minFiles} className="min-w-[12rem]">
              {phase === "working" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Working…
                </>
              ) : (
                actionLabel
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function ResultPanel({
  results,
  zipName,
  resultHint,
  onReset,
}: {
  results: OutputFile[];
  zipName: string;
  resultHint?: string;
  onReset: () => void;
}) {
  const single = results.length === 1;
  return (
    <div className="rounded-2xl border border-line bg-surface p-8 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#E5F5EE] text-[#18A06A]">
        <CheckCircle2 className="h-7 w-7" strokeWidth={1.8} />
      </span>
      <h2 className="mt-4 text-xl font-semibold text-ink">Done — your {single ? "file is" : "files are"} ready</h2>
      <p className="mt-1 text-sm text-graphite">{resultHint ?? `${results.length} ${single ? "file" : "files"} processed in your browser.`}</p>

      <div className="mx-auto mt-6 max-w-md space-y-2">
        {results.length > 1 && (
          <Button variant="accent" size="lg" className="w-full" onClick={() => downloadZip(results, zipName)}>
            <Download className="h-4 w-4" /> Download all ({results.length}) as .zip
          </Button>
        )}
        {single && (
          <Button variant="accent" size="lg" className="w-full" onClick={() => downloadBlob(results[0].blob, results[0].name)}>
            <Download className="h-4 w-4" /> Download {results[0].name}
          </Button>
        )}
        {!single && (
          <ul className="mt-3 max-h-56 space-y-1.5 overflow-y-auto text-left">
            {results.map((f, i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2">
                <span className="truncate text-sm text-ink">{f.name}</span>
                <button onClick={() => downloadBlob(f.blob, f.name)} className="shrink-0 text-iris hover:text-iris-strong" aria-label={`Download ${f.name}`}>
                  <Download className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={onReset} className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-graphite hover:text-ink">
        <RotateCcw className="h-3.5 w-3.5" /> Do another
      </button>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "radix-ui";
import {
  X,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  LayoutGrid,
  FileText,
  Loader2,
} from "lucide-react";
import { groupedTools } from "@/lib/tools";
import { ToolTile } from "@/components/ui/tool-tile";
import { Button } from "@/components/ui/button";
import { usePageImage, usePageCount } from "@/components/tools/_shared/page-grid";
import { stageFiles } from "@/lib/handoff";
import { downloadBlob } from "@/lib/pdf/download";

// Actions offered after opening: browser tools that act on a single existing PDF.
// (JPG→PDF needs images, Scan needs the camera — neither takes a dropped PDF.)
const EXCLUDE = new Set(["jpg-to-pdf", "scan-to-pdf"]);
const actionGroups = groupedTools()
  .map(({ category, tools }) => ({ category, tools: tools.filter((t) => t.engine === "browser" && !EXCLUDE.has(t.slug)) }))
  .filter((g) => g.tools.length > 0);

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;

/** The full-screen "open a PDF" experience: preview + action launcher + page viewer. */
export default function OpenPdfDialog({ file, onClose }: { file: File; onClose: () => void }) {
  const router = useRouter();
  const [screen, setScreen] = useState<"chooser" | "viewer">("chooser");
  const total = usePageCount(file);

  const launch = (slug: string) => {
    stageFiles([file]);
    router.push(`/${slug}`);
    onClose();
  };

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="pdf-overlay fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm dark:bg-black/70" />
      <Dialog.Content className="pdf-panel fixed inset-0 z-50 flex flex-col overflow-hidden bg-paper outline-none sm:inset-4 sm:rounded-2xl sm:border sm:border-line sm:shadow-lift">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3 sm:px-5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-iris-tint text-iris">
            <FileText className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </span>
          <div className="min-w-0 flex-1">
            <Dialog.Title className="truncate text-sm font-semibold text-ink">{file.name}</Dialog.Title>
            <p className="font-mono text-xs text-graphite">
              {formatSize(file.size)}
              {total ? ` · ${total} page${total > 1 ? "s" : ""}` : ""}
            </p>
          </div>
          <Dialog.Description className="sr-only">Preview the PDF or choose a tool to use on it.</Dialog.Description>
          {screen === "viewer" && (
            <button
              type="button"
              onClick={() => setScreen("chooser")}
              className="hidden items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-deep sm:inline-flex"
            >
              <LayoutGrid className="h-4 w-4" strokeWidth={1.8} /> Actions
            </button>
          )}
          <button
            type="button"
            onClick={() => downloadBlob(file, file.name)}
            aria-label="Download PDF"
            className="grid h-9 w-9 place-items-center rounded-full text-ink hover:bg-paper-deep"
          >
            <Download className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </button>
          <Dialog.Close
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full text-ink hover:bg-paper-deep"
          >
            <X className="h-5 w-5" />
          </Dialog.Close>
        </div>

        {screen === "chooser" ? (
          <Chooser file={file} onView={() => setScreen("viewer")} onLaunch={launch} />
        ) : (
          <Viewer file={file} total={total} />
        )}
      </Dialog.Content>
    </Dialog.Portal>
  );
}

function Chooser({ file, onView, onLaunch }: { file: File; onView: () => void; onLaunch: (slug: string) => void }) {
  const preview = usePageImage(file, 0, 440, 0.82);
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto grid max-w-5xl gap-7 p-5 sm:p-8 lg:grid-cols-[300px_1fr]">
        <div className="lg:sticky lg:top-0 lg:self-start">
          <div className="overflow-hidden rounded-xl border border-line bg-white shadow-soft">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview.url} alt="First page" className="block w-full select-none" draggable={false} />
            ) : (
              <div className="grid aspect-[3/4] place-items-center bg-paper-deep">
                <Loader2 className="h-5 w-5 animate-spin text-graphite" />
              </div>
            )}
          </div>
          <Button variant="accent" size="lg" className="mt-4 w-full" onClick={onView}>
            <Eye className="h-4 w-4" strokeWidth={2} /> View PDF
          </Button>
          <p className="mt-2 text-center text-xs leading-relaxed text-graphite">
            Read it page by page — or jump straight into a tool. Nothing is uploaded.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-ink">What would you like to do?</h2>
          <p className="mt-1 text-sm text-graphite">Pick a tool and your file comes along — no need to choose it again.</p>
          <div className="mt-5 space-y-6">
            {actionGroups.map(({ category, tools }) => (
              <div key={category.id}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: category.accent }} />
                  <h3 className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.12em] text-graphite">
                    {category.label}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {tools.map((tool) => (
                    <button
                      key={tool.slug}
                      type="button"
                      onClick={() => onLaunch(tool.slug)}
                      className="flex items-center gap-2.5 rounded-xl border border-line bg-surface p-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-ink/20 hover:bg-paper-deep hover:shadow-soft"
                    >
                      <ToolTile tool={tool} size="sm" />
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate text-[0.85rem] font-medium text-ink">{tool.name.replace(" PDF", "")}</span>
                          {tool.badge && (
                            <span className="rounded-full bg-iris-tint px-1.5 py-px text-[0.55rem] font-semibold uppercase tracking-wide text-iris-strong">
                              {tool.badge}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Viewer({ file, total }: { file: File; total: number | null }) {
  const [pageIndex, setPageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const count = total ?? 1;
  const idx = Math.min(pageIndex, Math.max(0, count - 1));
  const page = usePageImage(file, idx, Math.round(900 * dpr), 0.92);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") setPageIndex((i) => Math.min(count - 1, i + 1));
      else if (e.key === "ArrowLeft" || e.key === "PageUp") setPageIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-auto bg-paper-deep p-4 sm:p-8">
        <div className="mx-auto transition-[max-width] duration-200" style={{ maxWidth: `${820 * zoom}px` }}>
          {page ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={page.url}
              alt={`Page ${idx + 1}`}
              className="mx-auto block w-full rounded-lg border border-line bg-white shadow-lift"
              draggable={false}
            />
          ) : (
            <div className="grid aspect-[3/4] place-items-center rounded-lg border border-line bg-white">
              <Loader2 className="h-6 w-6 animate-spin text-graphite" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 border-t border-line bg-paper px-4 py-2.5">
        <button
          type="button"
          onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
          aria-label="Previous page"
          className="grid h-8 w-8 place-items-center rounded-full border border-line text-ink disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-[5.5rem] text-center font-mono text-sm text-graphite">
          {idx + 1} / {count}
        </span>
        <button
          type="button"
          onClick={() => setPageIndex((i) => Math.min(count - 1, i + 1))}
          disabled={idx >= count - 1}
          aria-label="Next page"
          className="grid h-8 w-8 place-items-center rounded-full border border-line text-ink disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <span className="mx-2 h-5 w-px bg-line" />

        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
          disabled={zoom <= 0.5}
          aria-label="Zoom out"
          className="grid h-8 w-8 place-items-center rounded-full border border-line text-ink disabled:opacity-30"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoom(1)}
          aria-label="Fit width"
          className="grid h-8 w-8 place-items-center rounded-full border border-line text-ink"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
          disabled={zoom >= 3}
          aria-label="Zoom in"
          className="grid h-8 w-8 place-items-center rounded-full border border-line text-ink disabled:opacity-30"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

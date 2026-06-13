"use client";

import { ToolShell } from "./_shared/tool-shell";
import { usePageThumbs, PageGrid } from "./_shared/page-grid";
import { pdf } from "@/lib/pdf/client";
import { pdfBlob } from "@/lib/pdf/types";

interface Opts {
  keep: number[];
}

function ExtractOptions({ file, value, set }: { file: File; value: Opts; set: (p: Partial<Opts>) => void }) {
  const thumbs = usePageThumbs(file);
  const toggle = (i: number) =>
    set({ keep: value.keep.includes(i) ? value.keep.filter((x) => x !== i) : [...value.keep, i] });
  return (
    <div className="space-y-3">
      <p className="text-sm text-graphite">
        Click the pages you want to keep. {value.keep.length > 0 && <span className="font-medium text-iris">{value.keep.length} selected</span>}
      </p>
      <PageGrid thumbs={thumbs} isSelected={(i) => value.keep.includes(i)} onToggle={toggle} accent="#5A48F5" />
    </div>
  );
}

export function ExtractPagesTool() {
  return (
    <ToolShell<Opts>
      accept="application/pdf"
      fileNoun="PDF"
      defaultOptions={{ keep: [] }}
      actionLabel="Extract pages"
      run={async (files, o) => {
        if (!o.keep.length) throw new Error("Select at least one page to extract.");
        const pages = [...o.keep].sort((a, b) => a - b);
        const bytes = await pdf().keepPages(await files[0].arrayBuffer(), { pages });
        return [{ name: "extracted.pdf", blob: pdfBlob(bytes) }];
      }}
      options={({ files, value, set }) => <ExtractOptions file={files[0]} value={value} set={set} />}
    />
  );
}

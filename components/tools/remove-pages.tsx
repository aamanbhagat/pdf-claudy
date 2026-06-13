"use client";

import { ToolShell } from "./_shared/tool-shell";
import { usePageThumbs, PageGrid } from "./_shared/page-grid";
import { pdf } from "@/lib/pdf/client";
import { pdfBlob } from "@/lib/pdf/types";

interface Opts {
  remove: number[];
}

function RemoveOptions({ file, value, set }: { file: File; value: Opts; set: (p: Partial<Opts>) => void }) {
  const thumbs = usePageThumbs(file);
  const toggle = (i: number) =>
    set({ remove: value.remove.includes(i) ? value.remove.filter((x) => x !== i) : [...value.remove, i] });
  return (
    <div className="space-y-3">
      <p className="text-sm text-graphite">
        Click the pages you want to remove. {value.remove.length > 0 && <span className="font-medium text-[#E5484D]">{value.remove.length} selected</span>}
      </p>
      <PageGrid thumbs={thumbs} isSelected={(i) => value.remove.includes(i)} onToggle={toggle} accent="#E5484D" />
    </div>
  );
}

export function RemovePagesTool() {
  return (
    <ToolShell<Opts>
      accept="application/pdf"
      fileNoun="PDF"
      defaultOptions={{ remove: [] }}
      actionLabel="Remove pages"
      run={async (files, o) => {
        if (!o.remove.length) throw new Error("Select at least one page to remove.");
        const bytes = await pdf().removePages(await files[0].arrayBuffer(), { pages: o.remove });
        return [{ name: "trimmed.pdf", blob: pdfBlob(bytes) }];
      }}
      options={({ files, value, set }) => <RemoveOptions file={files[0]} value={value} set={set} />}
    />
  );
}

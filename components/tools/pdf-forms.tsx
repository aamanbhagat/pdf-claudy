"use client";

import { useEffect, useState } from "react";
import { ToolShell } from "./_shared/tool-shell";
import { Field } from "./_shared/controls";
import { pdf } from "@/lib/pdf/client";
import { pdfBlob } from "@/lib/pdf/types";
import type { FormField } from "@/lib/pdf/pdf-worker";

interface Opts {
  values: Record<string, string | boolean>;
  flatten: boolean;
}

function FormOptions({ file, value, set }: { file: File; value: Opts; set: (p: Partial<Opts>) => void }) {
  const [fields, setFields] = useState<FormField[] | null>(null);
  useEffect(() => {
    let alive = true;
    file.arrayBuffer().then((b) => pdf().listFormFields(b)).then((f) => alive && setFields(f));
    return () => {
      alive = false;
    };
  }, [file]);

  const setField = (name: string, v: string | boolean) => set({ values: { ...value.values, [name]: v } });

  if (!fields) return <p className="text-sm text-graphite">Reading form fields…</p>;
  if (fields.length === 0)
    return <p className="text-sm text-graphite">This PDF doesn&apos;t contain any fillable form fields.</p>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-graphite">{fields.length} form fields detected.</p>
      {fields.map((f) => (
        <Field key={f.name} label={f.name}>
          {f.type === "checkbox" ? (
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={Boolean(value.values[f.name])} onChange={(e) => setField(f.name, e.target.checked)} className="h-4 w-4 accent-iris" />
              Checked
            </label>
          ) : f.type === "dropdown" || f.type === "radio" ? (
            <select
              value={String(value.values[f.name] ?? "")}
              onChange={(e) => setField(f.name, e.target.value)}
              className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-iris"
            >
              <option value="">—</option>
              {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <input
              type="text"
              value={String(value.values[f.name] ?? "")}
              onChange={(e) => setField(f.name, e.target.value)}
              className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-iris"
            />
          )}
        </Field>
      ))}
      <label className="flex cursor-pointer items-center gap-2 border-t border-line pt-4 text-sm text-ink">
        <input type="checkbox" checked={value.flatten} onChange={(e) => set({ flatten: e.target.checked })} className="h-4 w-4 accent-iris" />
        Flatten — make the filled values permanent (no longer editable)
      </label>
    </div>
  );
}

export function PdfFormsTool() {
  return (
    <ToolShell<Opts>
      accept="application/pdf"
      fileNoun="PDF"
      defaultOptions={{ values: {}, flatten: false }}
      actionLabel="Fill form"
      run={async (files, o) => {
        const bytes = await pdf().fillForm(await files[0].arrayBuffer(), { values: o.values, flatten: o.flatten });
        return [{ name: "filled.pdf", blob: pdfBlob(bytes) }];
      }}
      options={({ files, value, set }) => <FormOptions file={files[0]} value={value} set={set} />}
    />
  );
}

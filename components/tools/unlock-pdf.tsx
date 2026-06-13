"use client";

import { KeyRound } from "lucide-react";
import { ToolShell } from "./_shared/tool-shell";
import { Field } from "./_shared/controls";
import { pdf } from "@/lib/pdf/client";
import { pdfBlob } from "@/lib/pdf/types";
import { rasterize } from "@/lib/pdf/render";

interface Opts {
  password: string;
}

export function UnlockPdfTool() {
  return (
    <ToolShell<Opts>
      accept="application/pdf"
      fileNoun="PDF"
      defaultOptions={{ password: "" }}
      actionLabel="Unlock PDF"
      resultHint="Decrypted on your device — your password never left the browser."
      run={async (files, o) => {
        const buf = await files[0].arrayBuffer();
        const pw = o.password.trim();
        try {
          if (pw) {
            // Open-password protected: decrypt with pdf.js, then rebuild without protection.
            const pages = await rasterize(buf, { scale: 2, quality: 0.92, password: pw });
            return [{ name: "unlocked.pdf", blob: pdfBlob(await pdf().imagesToSizedPdf(pages)) }];
          }
          return [{ name: "unlocked.pdf", blob: pdfBlob(await pdf().unlock(buf)) }];
        } catch {
          throw new Error(
            pw
              ? "That password didn't work. Double-check it and try again."
              : "This PDF needs its open-password. Enter the password above, then try again.",
          );
        }
      }}
      options={({ value, set }) => (
        <Field label="Password" hint="optional">
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite" />
            <input
              type="password"
              value={value.password}
              onChange={(e) => set({ password: e.target.value })}
              placeholder="Only if the PDF asks for one to open"
              className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-3.5 text-sm text-ink outline-none focus:border-iris"
            />
          </div>
          <p className="mt-2 text-xs text-graphite">
            Leave blank to remove printing/editing restrictions. Enter the password if the file is locked open.
          </p>
        </Field>
      )}
    />
  );
}

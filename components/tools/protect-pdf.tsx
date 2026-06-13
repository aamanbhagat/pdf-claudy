"use client";

import { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { ToolShell } from "./_shared/tool-shell";
import { Field } from "./_shared/controls";
import { pdf } from "@/lib/pdf/client";
import { pdfBlob } from "@/lib/pdf/types";

interface Opts {
  password: string;
  confirm: string;
}

function PasswordOptions({ value, set }: { value: Opts; set: (p: Partial<Opts>) => void }) {
  const [show, setShow] = useState(false);
  const mismatch = value.confirm.length > 0 && value.password !== value.confirm;
  return (
    <div className="space-y-4">
      <Field label="Password">
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={value.password}
            onChange={(e) => set({ password: e.target.value })}
            placeholder="Choose a strong password"
            className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 pr-11 text-sm text-ink outline-none focus:border-iris"
          />
          <button onClick={() => setShow((s) => !s)} type="button" aria-label={show ? "Hide" : "Show"} className="absolute right-3 top-1/2 -translate-y-1/2 text-graphite hover:text-ink">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>
      <Field label="Confirm password">
        <input
          type={show ? "text" : "password"}
          value={value.confirm}
          onChange={(e) => set({ confirm: e.target.value })}
          placeholder="Re-enter your password"
          className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-iris"
        />
      </Field>
      {mismatch && <p className="text-xs text-[#C0353A]">Passwords don&apos;t match.</p>}
      <p className="flex items-start gap-2 rounded-lg bg-iris-tint/60 px-3 py-2 text-xs text-ink-soft">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-iris" />
        Encryption happens in your browser. We never see your password — keep it safe, as it can&apos;t be recovered.
      </p>
    </div>
  );
}

export function ProtectPdfTool() {
  return (
    <ToolShell<Opts>
      accept="application/pdf"
      fileNoun="PDF"
      defaultOptions={{ password: "", confirm: "" }}
      actionLabel="Protect PDF"
      run={async (files, o) => {
        if (!o.password) throw new Error("Enter a password.");
        if (o.password !== o.confirm) throw new Error("Passwords don't match.");
        const bytes = await pdf().protect(await files[0].arrayBuffer(), { password: o.password });
        return [{ name: "protected.pdf", blob: pdfBlob(bytes) }];
      }}
      options={({ value, set }) => <PasswordOptions value={value} set={set} />}
    />
  );
}

"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Dialog } from "radix-ui";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// The dialog pulls in pdfjs (via the render hooks); load it client-only so that
// module never runs during SSR — it touches DOMMatrix, which only exists in the browser.
const OpenPdfDialog = dynamic(() => import("@/components/site/open-pdf-dialog"), { ssr: false });

export function OpenPdfButton({ className }: { className?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) setFile(f);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(buttonVariants({ variant: "accent", size: "sm" }), className)}
      >
        Open a PDF
      </button>
      <Dialog.Root open={!!file} onOpenChange={(open) => !open && setFile(null)}>
        {file && <OpenPdfDialog file={file} onClose={() => setFile(null)} />}
      </Dialog.Root>
    </>
  );
}

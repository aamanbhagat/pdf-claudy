"use client";

import { useRef, useState, type ReactNode } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dropzone({
  accept,
  multiple = false,
  onFiles,
  compact = false,
  title,
  hint,
  icon,
}: {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  compact?: boolean;
  title?: string;
  hint?: string;
  icon?: ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const pick = (list: FileList | null) => {
    if (!list) return;
    const arr = Array.from(list);
    if (arr.length) onFiles(multiple ? arr : [arr[0]]);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        pick(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      className={cn(
        "group relative cursor-pointer rounded-2xl border-2 border-dashed text-center outline-none transition-all duration-200 focus-visible:border-iris",
        over ? "border-iris bg-iris-tint/50" : "border-line bg-surface hover:border-iris/50 hover:bg-paper-deep/40",
        compact ? "px-5 py-6" : "px-6 py-12",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = "";
        }}
      />
      <span
        className={cn(
          "mx-auto flex items-center justify-center rounded-2xl bg-iris-tint text-iris transition-transform duration-200 group-hover:scale-105",
          compact ? "h-10 w-10" : "h-14 w-14",
        )}
      >
        {icon ?? <UploadCloud className={compact ? "h-5 w-5" : "h-6 w-6"} strokeWidth={1.8} />}
      </span>
      <p className={cn("font-semibold text-ink", compact ? "mt-2 text-sm" : "mt-4 text-lg")}>
        {title ?? (multiple ? "Drop your files here" : "Drop your file here")}
      </p>
      <p className={cn("text-graphite", compact ? "mt-0.5 text-xs" : "mt-1 text-sm")}>
        {hint ?? "or click to browse"}
      </p>
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-sm font-medium text-ink">{label}</label>
        {hint && <span className="font-mono text-xs text-graphite">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export function Segmented<T extends string | number>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode }[];
  className?: string;
}) {
  return (
    <div className={cn("inline-flex flex-wrap gap-1 rounded-xl bg-paper-deep p-1", className)}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
            value === o.value ? "bg-surface text-ink shadow-soft" : "text-graphite hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Slider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  display,
}: {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  display?: (v: number) => string;
}) {
  return (
    <Field label={label} hint={display ? display(value) : String(value)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line accent-iris"
      />
    </Field>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "password";
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-graphite-soft focus:border-iris"
    />
  );
}

export function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const swatches = ["#16151D", "#E5484D", "#5A48F5", "#18A06A", "#F0A12E", "#8B3DF5"];
  return (
    <div className="flex items-center gap-2">
      {swatches.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          aria-label={`Color ${c}`}
          className={cn("h-7 w-7 rounded-full ring-2 ring-offset-2 ring-offset-surface transition-all", value === c ? "ring-ink" : "ring-transparent")}
          style={{ backgroundColor: c }}
        />
      ))}
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-7 w-9 cursor-pointer rounded border border-line bg-transparent" aria-label="Custom color" />
    </div>
  );
}

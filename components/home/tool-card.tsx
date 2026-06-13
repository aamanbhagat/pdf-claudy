import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Server, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tool } from "@/lib/tools";
import { ToolTile } from "@/components/ui/tool-tile";

const engineTag = {
  browser: { label: "Private", Icon: ShieldCheck, className: "text-graphite" },
  server: { label: "Server", Icon: Server, className: "text-graphite" },
  ai: { label: "AI", Icon: Sparkles, className: "text-[#8B3DF5]" },
} as const;

export function ToolCard({ tool, className }: { tool: Tool; className?: string }) {
  const tag = engineTag[tool.engine];
  return (
    <Link
      href={`/${tool.slug}`}
      className={cn(
        "group relative flex h-full flex-col gap-3.5 rounded-xl border border-line bg-surface p-5 transition-all duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:border-line-soft hover:shadow-lift",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <ToolTile tool={tool} size="lg" />
        <span className={cn("flex items-center gap-1 font-mono text-[0.6rem] uppercase tracking-wide", tag.className)}>
          <tag.Icon className="h-3 w-3" strokeWidth={2} />
          {tag.label}
        </span>
      </div>
      <div className="flex-1">
        <h3 className="flex items-center gap-1.5 text-[1.02rem] font-semibold text-ink">
          {tool.name}
          {tool.badge && (
            <span className="rounded-full bg-iris-tint px-1.5 py-px text-[0.58rem] font-semibold uppercase tracking-wide text-iris-strong">
              {tool.badge}
            </span>
          )}
        </h3>
        <p className="mt-1 text-pretty text-[0.86rem] leading-relaxed text-graphite">{tool.tagline}</p>
      </div>
      <ArrowUpRight
        className="absolute right-4 top-4 h-4 w-4 -translate-y-1 translate-x-1 text-iris opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
        strokeWidth={2}
        aria-hidden
      />
    </Link>
  );
}

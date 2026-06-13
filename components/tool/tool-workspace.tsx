"use client";

import { Server, Sparkles, ShieldCheck } from "lucide-react";
import type { Tool } from "@/lib/tools";
import { site } from "@/lib/site";
import { widgets } from "./widget-registry";

function NotifyCard({ tool }: { tool: Tool }) {
  const isAi = tool.engine === "ai";
  const Icon = isAi ? Sparkles : Server;
  const kicker = isAi ? "AI-powered" : "Server-powered";
  const subject = encodeURIComponent(`Early access: ${tool.name}`);
  return (
    <div className="rounded-2xl border border-line bg-surface p-8 text-center sm:p-12">
      <span
        className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ backgroundColor: isAi ? "#F1E8FE" : "#E8EDFC", color: isAi ? "#8B3DF5" : "#3E63DD" }}
      >
        <Icon className="h-6 w-6" strokeWidth={1.8} />
      </span>
      <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-graphite">{kicker}</p>
      <h2 className="mt-2 text-xl font-semibold text-ink">This tool is coming soon</h2>
      <p className="mx-auto mt-2 max-w-md text-pretty text-sm leading-relaxed text-graphite">
        {tool.name} runs on our document service, which we&apos;re putting the finishing touches on. Want to be the
        first to use it?
      </p>
      <a
        href={`mailto:${site.email}?subject=${subject}`}
        className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-ink px-6 text-sm font-medium text-paper transition-colors hover:bg-ink-soft"
      >
        Request early access
      </a>
    </div>
  );
}

function BrowserPlaceholder({ tool }: { tool: Tool }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface p-8 text-center sm:p-12">
      <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-iris-tint text-iris">
        <ShieldCheck className="h-6 w-6" strokeWidth={1.8} />
      </span>
      <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-iris">Runs in your browser</p>
      <h2 className="mt-2 text-xl font-semibold text-ink">Workspace loading shortly</h2>
      <p className="mx-auto mt-2 max-w-md text-pretty text-sm leading-relaxed text-graphite">
        {tool.name} processes your files locally — nothing is uploaded. The interactive workspace is being wired up.
      </p>
    </div>
  );
}

/** Renders the tool's interactive widget, or an engine-aware placeholder. */
export function ToolWorkspace({ tool }: { tool: Tool }) {
  const Widget = widgets[tool.slug];
  if (Widget) return <Widget />;
  if (tool.engine === "browser") return <BrowserPlaceholder tool={tool} />;
  return <NotifyCard tool={tool} />;
}

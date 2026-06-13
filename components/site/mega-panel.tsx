import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Category, Tool } from "@/lib/tools";
import { ToolTile } from "@/components/ui/tool-tile";

function ToolLink({ tool, onSelect }: { tool: Tool; onSelect?: () => void }) {
  return (
    <Link
      href={`/${tool.slug}`}
      onClick={onSelect}
      className="group flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-paper-deep"
    >
      <ToolTile tool={tool} size="sm" />
      <span className="min-w-0">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[0.92rem] font-medium text-ink">{tool.name}</span>
          {tool.badge && (
            <span className="rounded-full bg-iris-tint px-1.5 py-px text-[0.6rem] font-semibold uppercase tracking-wide text-iris-strong">
              {tool.badge}
            </span>
          )}
        </span>
      </span>
    </Link>
  );
}

export function MegaPanel({
  groups,
  className,
  columns = 4,
  onSelect,
}: {
  groups: { category: Category; tools: Tool[] }[];
  className?: string;
  columns?: number;
  onSelect?: () => void;
}) {
  return (
    <div className={cn("p-3", className)}>
      <div
        className="grid gap-x-5 gap-y-5"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {groups.map(({ category, tools }) => (
          <div key={category.id}>
            <div className="mb-1.5 flex items-center gap-2 px-2.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: category.accent }} />
              <h3 className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.12em] text-graphite">
                {category.label}
              </h3>
            </div>
            <div className="flex flex-col">
              {tools.map((tool) => (
                <ToolLink key={tool.slug} tool={tool} onSelect={onSelect} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

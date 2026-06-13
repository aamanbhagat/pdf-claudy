import { categories, categoryMap, type Category, type CategoryId } from "./categories";
import { tools, type Tool, type Engine } from "./registry";

export { categories, categoryMap, tools };
export type { Category, CategoryId, Tool, Engine };

const bySlug = new Map(tools.map((t) => [t.slug, t]));

export function getTool(slug: string): Tool | undefined {
  return bySlug.get(slug);
}

export function getToolsByCategory(id: CategoryId): Tool[] {
  return tools.filter((t) => t.category === id);
}

/** Categories paired with their tools, in menu order — drives the mega-menu + grid. */
export function groupedTools(): { category: Category; tools: Tool[] }[] {
  return categories.map((category) => ({
    category,
    tools: getToolsByCategory(category.id),
  }));
}

export function relatedTools(tool: Tool): Tool[] {
  return (tool.related ?? []).map((s) => bySlug.get(s)).filter((t): t is Tool => Boolean(t));
}

export function allSlugs(): string[] {
  return tools.map((t) => t.slug);
}

/** Accent color for a tool, inherited from its category. */
export function accentFor(tool: Tool): string {
  return categoryMap[tool.category].accent;
}

export function tintFor(tool: Tool): string {
  return categoryMap[tool.category].tint;
}

export const engineLabel: Record<Engine, string> = {
  browser: "Runs in your browser",
  server: "Server-powered",
  ai: "AI-powered",
};

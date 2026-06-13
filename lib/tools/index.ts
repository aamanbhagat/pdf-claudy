import { categories, categoryMap, type Category, type CategoryId } from "./categories";
import { tools as rawTools, type Tool, type Engine } from "./registry";
import { toolContent } from "./content";

// Enrich every tool with HowTo + FAQ content. A registry entry's own howto/faqs
// take precedence; otherwise we fill from the content module so each tool page
// ships real, unique, indexable content (HowTo + FAQPage rich results).
export const tools: Tool[] = rawTools.map((t) => ({
  ...t,
  howto: t.howto ?? toolContent[t.slug]?.howto,
  faqs: t.faqs ?? toolContent[t.slug]?.faqs,
}));

export { categories, categoryMap };
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

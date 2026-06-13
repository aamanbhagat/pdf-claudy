import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getTool, allSlugs, relatedTools, categoryMap, engineLabel } from "@/lib/tools";
import { toolMetadata } from "@/lib/seo/metadata";
import { toolJsonLd } from "@/lib/seo/json-ld";
import { JsonLd } from "@/components/seo/json-ld";
import { ToolTile } from "@/components/ui/tool-tile";
import { ToolWorkspace } from "@/components/tool/tool-workspace";
import { ToolCard } from "@/components/home/tool-card";
import { Faq } from "@/components/ui/faq";

export const dynamicParams = false;

export function generateStaticParams() {
  return allSlugs().map((tool) => ({ tool }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string }>;
}): Promise<Metadata> {
  const { tool: slug } = await params;
  const tool = getTool(slug);
  if (!tool) return {};
  return toolMetadata(tool);
}

export default async function ToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool: slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  const category = categoryMap[tool.category];
  const related = relatedTools(tool);

  return (
    <>
      <JsonLd data={toolJsonLd(tool)} />

      <article className="wrap pt-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-graphite">
          <Link href="/" className="hover:text-iris">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          <Link href={`/#${category.id}`} className="hover:text-iris">{category.label}</Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          <span className="text-ink-soft">{tool.name}</span>
        </nav>

        {/* Hero */}
        <header className="mx-auto mt-8 max-w-2xl text-center">
          <ToolTile tool={tool} size="lg" className="mx-auto" />
          <span
            className="mt-4 inline-block rounded-full px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: category.tint, color: category.accent }}
          >
            {category.label}
          </span>
          <h1 className="mt-3 text-balance text-4xl font-bold text-ink sm:text-5xl">{tool.name}</h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed text-graphite">
            {tool.description}
          </p>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-graphite-soft">
            {engineLabel[tool.engine]}
          </p>
        </header>

        {/* Workspace */}
        <div className="mx-auto mt-8 max-w-3xl">
          <ToolWorkspace tool={tool} />
        </div>
      </article>

      {/* How it works */}
      {tool.howto?.length ? (
        <section className="wrap mt-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-ink">How to {tool.name.toLowerCase()}</h2>
            <ol className="mt-6 space-y-4">
              {tool.howto.map((step, i) => (
                <li key={i} className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink font-mono text-sm font-medium text-paper">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-ink">{step.title}</h3>
                    <p className="mt-1 text-pretty text-sm leading-relaxed text-graphite">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {/* FAQ */}
      {tool.faqs?.length ? (
        <section className="wrap mt-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-ink">Frequently asked questions</h2>
            <div className="mt-6">
              <Faq items={tool.faqs} />
            </div>
          </div>
        </section>
      ) : null}

      {/* Related */}
      {related.length ? (
        <section className="wrap mt-20">
          <h2 className="text-2xl font-bold text-ink">Related tools</h2>
          <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

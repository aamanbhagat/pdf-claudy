import Link from "next/link";
import { getTool } from "@/lib/tools";
import { ToolTile } from "@/components/ui/tool-tile";
import { buttonVariants } from "@/components/ui/button";

const suggestions = ["merge-pdf", "split-pdf", "compress-pdf", "jpg-to-pdf"].map((s) => getTool(s)!);

export default function NotFound() {
  return (
    <div className="wrap flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-mono text-sm uppercase tracking-[0.16em] text-iris">404</p>
      <h1 className="mt-3 text-balance text-4xl font-bold text-ink">This page slipped out of the binding.</h1>
      <p className="mt-3 max-w-md text-pretty text-graphite">
        We couldn&apos;t find that page. Try one of these tools, or head back home.
      </p>
      <Link href="/" className={`${buttonVariants({ variant: "accent" })} mt-6`}>
        Back to home
      </Link>
      <div className="mt-10 grid w-full max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
        {suggestions.map((tool) => (
          <Link
            key={tool.slug}
            href={`/${tool.slug}`}
            className="flex flex-col items-center gap-2 rounded-xl border border-line bg-surface p-4 hover:-translate-y-0.5 hover:shadow-soft"
          >
            <ToolTile tool={tool} size="md" />
            <span className="text-xs font-medium text-ink">{tool.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

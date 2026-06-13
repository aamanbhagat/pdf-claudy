import Link from "next/link";
import { ShieldCheck, Gauge, Layers, MousePointerClick, FileUp, Download } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { ToolsExplorer } from "@/components/home/tools-explorer";
import { buttonVariants } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { homeJsonLd } from "@/lib/seo/json-ld";
import { site } from "@/lib/site";

const why = [
  {
    Icon: ShieldCheck,
    title: "Your files stay yours",
    body: "Everyday tools run with WebAssembly inside your browser. Documents are never uploaded, so nothing is stored or seen by anyone but you.",
  },
  {
    Icon: Gauge,
    title: "No upload, no wait",
    body: "Because the work happens on your device, there is no round-trip to a server. Even big files are processed the moment you drop them in.",
  },
  {
    Icon: Layers,
    title: "One place for everything",
    body: "Merge, convert, edit, sign, protect — a complete set of document tools that all look, feel and behave the same way.",
  },
];

const steps = [
  { Icon: MousePointerClick, title: "Pick a tool", body: "Choose from 32 tools, grouped by what you're trying to do." },
  { Icon: FileUp, title: "Drop your file", body: "Drag a PDF or image straight in. It stays on your device." },
  { Icon: Download, title: "Download", body: "Your result is ready in seconds — save it and you're done." },
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={homeJsonLd()} />
      <Hero />
      <ToolsExplorer />

      {/* Why */}
      <section id="privacy" className="wrap scroll-mt-24 py-12">
        <div className="rounded-3xl border border-line bg-surface p-8 sm:p-12">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-iris">Why {site.name}</p>
            <h2 className="mt-3 text-balance text-3xl font-bold text-ink sm:text-4xl">
              Powerful where it counts. Private by default.
            </h2>
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {why.map(({ Icon, title, body }) => (
              <div key={title}>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-iris-tint text-iris">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-graphite">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="wrap scroll-mt-24 py-12">
        <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-iris">How it works</p>
            <h2 className="mt-3 text-balance text-3xl font-bold text-ink sm:text-4xl">
              Three steps. No account, no friction.
            </h2>
            <p className="mt-3 text-pretty text-graphite">
              {site.name} is built to get out of your way. Open a tool and you&apos;re working in seconds.
            </p>
          </div>
          <ol className="grid gap-4 sm:grid-cols-3">
            {steps.map(({ Icon, title, body }, i) => (
              <li key={title} className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-paper-deep text-ink">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <span className="font-mono text-sm text-graphite-soft">0{i + 1}</span>
                </div>
                <h3 className="mt-4 font-semibold text-ink">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-graphite">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Final CTA */}
      <section className="wrap py-16">
        <div className="relative overflow-hidden rounded-3xl bg-ink px-8 py-14 text-center sm:px-16 dark:bg-[#1b1a23] dark:ring-1 dark:ring-white/10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{ background: "radial-gradient(600px circle at 50% 0%, rgba(90,72,245,0.35), transparent 70%)" }}
          />
          <div className="relative">
            <h2 className="text-balance text-3xl font-bold text-[#FBFAF7] sm:text-[2.6rem]">
              Start with the tool you need.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-pretty text-graphite-soft">
              No sign-up. No upload. Just open a tool and get your document done.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="#all-tools" className={buttonVariants({ variant: "accent", size: "lg" })}>
                Browse all tools
              </Link>
              <Link
                href="/merge-pdf"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-7 text-base font-medium text-[#FBFAF7] transition-colors hover:bg-white/10"
              >
                Merge a PDF
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

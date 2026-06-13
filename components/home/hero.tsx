"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ShieldCheck, Zap, WifiOff, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTool } from "@/lib/tools";
import { buttonVariants } from "@/components/ui/button";
import { ToolTile } from "@/components/ui/tool-tile";

const popular = ["merge-pdf", "split-pdf", "compress-pdf", "jpg-to-pdf", "sign-pdf"].map((s) => getTool(s)!);
const floaters = [
  { tool: getTool("merge-pdf")!, className: "left-[-6%] top-[14%]", delay: 0 },
  { tool: getTool("compress-pdf")!, className: "right-[-4%] top-[30%]", delay: 0.6 },
  { tool: getTool("sign-pdf")!, className: "left-[2%] bottom-[10%]", delay: 1.1 },
];

const trust = [
  { Icon: ShieldCheck, label: "No uploads" },
  { Icon: Zap, label: "Instant" },
  { Icon: WifiOff, label: "Works offline" },
];

export function Hero() {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.08, delayChildren: 0.05 } },
  };
  const rise: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <section className="relative overflow-hidden">
      {/* ambient backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-iris/10 blur-[120px]" />
      </div>

      <div className="wrap grid items-center gap-12 pb-12 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pb-20 lg:pt-20">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div variants={rise}>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-graphite">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-iris/60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-iris" />
              </span>
              32 tools · nothing to upload
            </span>
          </motion.div>

          <motion.h1
            variants={rise}
            className="mt-5 text-balance text-[2.6rem] font-bold leading-[1.02] text-ink sm:text-6xl"
          >
            Every PDF tool,{" "}
            <span className="relative text-iris">
              right in your browser
              <svg
                className="absolute -bottom-1 left-0 hidden h-2 w-full text-iris/35 sm:block"
                viewBox="0 0 300 12"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path d="M2 9C60 3 240 3 298 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
            .
          </motion.h1>

          <motion.p variants={rise} className="mt-5 max-w-lg text-pretty text-lg leading-relaxed text-graphite">
            Merge, split, compress, convert, sign and protect your documents. The everyday tools run entirely on
            your device — so your files never leave it, and there&apos;s no waiting on an upload.
          </motion.p>

          <motion.div variants={rise} className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="#all-tools" className={buttonVariants({ variant: "accent", size: "lg" })}>
              Browse all tools <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
            <Link href="/merge-pdf" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Merge a PDF
            </Link>
          </motion.div>

          <motion.div variants={rise} className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2">
            {trust.map(({ Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 text-sm text-graphite">
                <Icon className="h-4 w-4 text-iris" strokeWidth={1.8} />
                {label}
              </span>
            ))}
          </motion.div>

          <motion.div variants={rise} className="mt-8 flex flex-wrap gap-2">
            {popular.map((tool) => (
              <Link
                key={tool.slug}
                href={`/${tool.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3 text-sm font-medium text-ink-soft transition-colors hover:border-ink/20 hover:bg-paper-deep"
              >
                <ToolTile tool={tool} size="sm" />
                {tool.name.replace(" PDF", "")}
              </Link>
            ))}
          </motion.div>
        </motion.div>

        <LivingSheet reduce={!!reduce} />
      </div>
    </section>
  );
}

function LivingSheet({ reduce }: { reduce: boolean }) {
  const float = (delay: number) =>
    reduce
      ? {}
      : {
          y: [0, -10, 0],
          transition: { duration: 5, repeat: Infinity, ease: "easeInOut" as const, delay },
        };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className="relative mx-auto hidden h-[420px] w-full max-w-[460px] md:block"
    >
      {/* back sheets — the "quire" stack */}
      <div className="absolute left-1/2 top-1/2 h-[340px] w-[270px] -translate-x-1/2 -translate-y-1/2 rotate-[8deg] rounded-2xl border border-line bg-surface/70 shadow-soft" />
      <div className="absolute left-1/2 top-1/2 h-[340px] w-[270px] -translate-x-1/2 -translate-y-1/2 rotate-[3deg] rounded-2xl border border-line bg-surface shadow-soft" />

      {/* front sheet */}
      <motion.div
        animate={float(0)}
        className="absolute left-1/2 top-1/2 h-[340px] w-[270px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-line bg-surface shadow-lift"
      >
        <span
          aria-hidden
          className="absolute right-0 top-0 h-9 w-9"
          style={{ backgroundColor: "var(--color-iris)", opacity: 0.16, clipPath: "polygon(100% 0,0 0,100% 100%)" }}
        />
        <div className="flex h-full flex-col gap-3 p-7">
          <div className="h-3 w-2/3 rounded-full bg-iris/70" />
          <div className="mt-1 space-y-2.5">
            {[100, 92, 96, 70, 88, 60, 94, 80].map((w, i) => (
              <div key={i} className="h-2 rounded-full bg-line" style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="mt-auto flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-paper-deep" />
            <div className="space-y-1.5">
              <div className="h-2 w-20 rounded-full bg-line" />
              <div className="h-2 w-14 rounded-full bg-line-soft" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* floating tool tiles */}
      {floaters.map(({ tool, className, delay }) => (
        <motion.div
          key={tool.slug}
          animate={float(delay)}
          className={cn(
            "absolute flex items-center gap-2 rounded-xl border border-line bg-surface/95 px-2.5 py-2 shadow-lift backdrop-blur-sm",
            className,
          )}
        >
          <ToolTile tool={tool} size="sm" />
          <span className="pr-1 text-[0.8rem] font-medium text-ink">{tool.name.replace(" PDF", "")}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

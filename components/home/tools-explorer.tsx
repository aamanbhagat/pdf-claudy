"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { categories, tools, type CategoryId } from "@/lib/tools";
import { ToolCard } from "./tool-card";

type Filter = "all" | CategoryId;

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All tools" },
  ...categories.map((c) => ({ id: c.id as Filter, label: c.label })),
];

export function ToolsExplorer() {
  const [active, setActive] = useState<Filter>("all");
  const reduce = useReducedMotion();
  const list = active === "all" ? tools : tools.filter((t) => t.category === active);

  return (
    <section id="all-tools" className="wrap scroll-mt-24 py-20 sm:py-28">
      <div className="flex flex-col gap-6">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-iris">The toolbox</p>
          <h2 className="mt-3 text-balance text-3xl font-bold text-ink sm:text-[2.6rem] sm:leading-[1.05]">
            Every tool you need to work with PDFs.
          </h2>
          <p className="mt-3 text-pretty text-graphite">
            {tools.length} tools, grouped the way you think about documents. The everyday ones run right here in
            your browser.
          </p>
        </div>

        <div className="-mx-1 flex flex-wrap gap-2">
          {filters.map((f) => {
            const isActive = active === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActive(f.id)}
                aria-pressed={isActive}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-surface text-ink-soft hover:border-ink/25 hover:bg-paper-deep",
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <motion.div
        key={active}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: reduce ? 0 : 0.03, delayChildren: 0.05 } },
        }}
        className="mt-8 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {list.map((tool) => (
          <motion.div
            key={tool.slug}
            variants={{
              hidden: { opacity: 0, y: reduce ? 0 : 10 },
              show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            <ToolCard tool={tool} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

"use client";

import { Accordion } from "radix-ui";
import { Plus } from "lucide-react";
import type { Faq as FaqItem } from "@/lib/tools/registry";

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <Accordion.Root type="single" collapsible className="divide-y divide-line rounded-2xl border border-line bg-surface">
      {items.map((item, i) => (
        <Accordion.Item key={i} value={`item-${i}`} className="px-5">
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 py-4 text-left text-[0.98rem] font-medium text-ink outline-none">
              {item.q}
              <Plus
                className="h-4 w-4 shrink-0 text-graphite transition-transform duration-300 group-data-[state=open]:rotate-45"
                strokeWidth={2}
                aria-hidden
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="acc-content">
            <p className="pb-4 pr-8 text-pretty text-sm leading-relaxed text-graphite">{item.a}</p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

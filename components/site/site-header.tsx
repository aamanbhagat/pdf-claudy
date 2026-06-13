"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NavigationMenu as NM, Dialog } from "radix-ui";
import { ChevronDown, Menu, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { groupedTools, getTool } from "@/lib/tools";
import { site } from "@/lib/site";
import { Logo } from "@/components/icons/logo";
import { ToolTile } from "@/components/ui/tool-tile";
import { MegaPanel } from "@/components/site/mega-panel";
import { OpenPdfButton } from "@/components/site/open-pdf";

const groups = groupedTools();
const convertGroups = groups.filter((g) => g.category.id === "convert-to" || g.category.id === "convert-from");
const quickLinks = ["merge-pdf", "split-pdf", "compress-pdf"].map((s) => getTool(s)!);

function Trigger({ children }: { children: React.ReactNode }) {
  return (
    <NM.Trigger className="group inline-flex h-9 items-center gap-1 rounded-full px-3 text-[0.95rem] font-medium text-ink-soft outline-none transition-colors hover:text-ink data-[state=open]:text-ink">
      {children}
      <ChevronDown
        className="h-3.5 w-3.5 text-graphite transition-transform duration-300 group-data-[state=open]:rotate-180"
        strokeWidth={2}
        aria-hidden
      />
    </NM.Trigger>
  );
}

function DesktopNav() {
  return (
    <NM.Root className="relative hidden lg:block" delayDuration={80} skipDelayDuration={200}>
      <NM.List className="flex items-center gap-0.5">
        {quickLinks.map((tool) => (
          <NM.Item key={tool.slug}>
            <NM.Link asChild>
              <Link
                href={`/${tool.slug}`}
                className="inline-flex h-9 items-center rounded-full px-3 text-[0.95rem] font-medium text-ink-soft transition-colors hover:text-ink"
              >
                {tool.name.replace(" PDF", "")}
              </Link>
            </NM.Link>
          </NM.Item>
        ))}

        <NM.Item>
          <Trigger>Convert</Trigger>
          <NM.Content className="nav-panel z-50">
            <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-lift">
              <MegaPanel groups={convertGroups} columns={2} className="w-[460px]" />
            </div>
          </NM.Content>
        </NM.Item>

        <NM.Item>
          <Trigger>All tools</Trigger>
          <NM.Content className="nav-panel z-50">
            <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-lift">
              <MegaPanel groups={groups} columns={4} className="w-[940px]" />
            </div>
          </NM.Content>
        </NM.Item>
      </NM.List>
    </NM.Root>
  );
}

function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          aria-label="Open menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-paper-deep lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm data-[state=open]:animate-[nav-pop-in_200ms] lg:hidden" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-[min(22rem,92vw)] flex-col bg-paper shadow-lift outline-none lg:hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <Logo />
            <Dialog.Close
              aria-label="Close menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-paper-deep"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <Dialog.Title className="sr-only">Menu</Dialog.Title>
          <div className="flex-1 overflow-y-auto px-3 py-4">
            {groups.map(({ category, tools }) => (
              <div key={category.id} className="mb-5">
                <div className="mb-1 flex items-center gap-2 px-2.5">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: category.accent }} />
                  <h3 className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.12em] text-graphite">
                    {category.label}
                  </h3>
                </div>
                {tools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/${tool.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-2.5 py-2 hover:bg-paper-deep"
                  >
                    <ToolTile tool={tool} size="sm" />
                    <span className="text-[0.95rem] font-medium text-ink">{tool.name}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-colors duration-300",
        scrolled ? "border-b border-line bg-paper/85 backdrop-blur-md" : "border-b border-transparent",
      )}
    >
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label={`${site.name} home`} className="shrink-0">
          <Logo />
        </Link>

        <DesktopNav />

        <div className="flex items-center gap-2">
          <Link
            href="/#all-tools"
            aria-label="Search tools"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-paper-deep sm:inline-flex"
          >
            <Search className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.8} />
          </Link>
          <OpenPdfButton className="hidden sm:inline-flex" />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { NavigationMenu as NM } from "radix-ui";
import { ChevronDown, Menu, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { groupedTools, getTool } from "@/lib/tools";
import { site } from "@/lib/site";
import { Logo } from "@/components/icons/logo";
import { ToolTile } from "@/components/ui/tool-tile";
import { MegaPanel } from "@/components/site/mega-panel";
import { OpenPdfButton } from "@/components/site/open-pdf";
import { ThemeToggle } from "@/components/site/theme-toggle";

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

/**
 * Self-contained mobile drawer — intentionally not built on Radix Dialog.
 * Its scroll-lock / focus-trap layer (react-remove-scroll) has a history of
 * "won't open" failures on real iOS Safari that headless engines don't repro,
 * so the critical mobile-nav path uses plain state we fully control.
 */
function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 touch-manipulation items-center justify-center rounded-full text-ink hover:bg-paper-deep active:bg-line-soft lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="absolute inset-0 animate-[fade-in_200ms] bg-ink/30 backdrop-blur-sm dark:bg-black/60"
          />
          <div
            ref={panelRef}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 flex w-[min(22rem,92vw)] animate-[drawer-in_240ms_var(--ease-out-soft)] flex-col bg-paper shadow-lift outline-none"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <Logo />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 touch-manipulation items-center justify-center rounded-full text-ink hover:bg-paper-deep active:bg-line-soft"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
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
          </div>
        </div>
      )}
    </>
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
          <ThemeToggle />
          <OpenPdfButton className="hidden sm:inline-flex" />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

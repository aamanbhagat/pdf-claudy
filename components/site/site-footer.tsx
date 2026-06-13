import Link from "next/link";
import { groupedTools } from "@/lib/tools";
import { site } from "@/lib/site";
import { Logo } from "@/components/icons/logo";

const footerNav = [
  { label: "Product", links: [["All tools", "/#all-tools"], ["Privacy-first", "/#privacy"], ["How it works", "/#how"]] },
  { label: "Company", links: [["About", "/about"], ["Blog", "/blog"], ["Contact", `mailto:${site.email}`]] },
  { label: "Legal", links: [["Privacy", "/privacy"], ["Terms", "/terms"], ["Security", "/security"]] },
];

export function SiteFooter() {
  const groups = groupedTools();
  return (
    <footer className="mt-24 border-t border-line bg-paper-deep/40">
      <div className="wrap py-16">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-pretty text-sm leading-relaxed text-graphite">
              {site.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
              {footerNav.map((col) => (
                <div key={col.label}>
                  <h4 className="mb-2 font-mono text-[0.66rem] font-medium uppercase tracking-[0.12em] text-graphite-soft">
                    {col.label}
                  </h4>
                  <ul className="space-y-1.5">
                    {col.links.map(([label, href]) => (
                      <li key={label}>
                        <Link href={href} className="text-sm text-ink-soft transition-colors hover:text-iris">
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {groups.map(({ category, tools }) => (
              <nav key={category.id} aria-label={category.label}>
                <h4 className="mb-2.5 flex items-center gap-2 font-mono text-[0.66rem] font-medium uppercase tracking-[0.12em] text-graphite-soft">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: category.accent }} />
                  {category.label}
                </h4>
                <ul className="space-y-1.5">
                  {tools.map((tool) => (
                    <li key={tool.slug}>
                      <Link href={`/${tool.slug}`} className="text-sm text-ink-soft transition-colors hover:text-iris">
                        {tool.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
          <p className="text-xs text-graphite">
            © {new Date().getFullYear()} {site.name}. Built for people who work with documents.
          </p>
          <p className="font-mono text-xs text-graphite-soft">
            Everyday tools run in your browser — files never leave your device.
          </p>
        </div>
      </div>
    </footer>
  );
}

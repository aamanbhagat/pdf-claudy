import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

/**
 * Brand mark: a folded sheet with a binding spine.
 * Ink outline, iris spine + folded corner.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden>
      <path
        d="M6 3.4h11.4L23 9v15.2A1.4 1.4 0 0 1 21.6 25.6H6A1.4 1.4 0 0 1 4.6 24.2V4.8A1.4 1.4 0 0 1 6 3.4Z"
        fill="var(--color-surface)"
        stroke="var(--color-ink)"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M17.2 3.6v4.2A1.2 1.2 0 0 0 18.4 9h4.2"
        stroke="var(--color-ink)"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      {/* binding spine */}
      <path d="M9.4 5.6v17.4" stroke="var(--color-iris)" strokeWidth="2" strokeLinecap="round" />
      {/* folded corner accent */}
      <path d="M17.2 3.6 22.6 9h-4.2A1.2 1.2 0 0 1 17.2 7.8Z" fill="var(--color-iris)" />
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
  showWordmark = true,
}: {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <BrandMark className={cn("h-7 w-7", markClassName)} />
      {showWordmark && (
        <span className="font-display text-[1.35rem] font-bold leading-none tracking-tight text-ink">
          {site.name}
        </span>
      )}
    </span>
  );
}

import { cn } from "@/lib/utils";
import { accentFor, tintFor, type Tool } from "@/lib/tools";
import { ToolGlyph } from "@/components/icons/tool-icon";

const sizes = {
  sm: { box: "h-9 w-9 rounded-[0.55rem]", glyph: "h-[18px] w-[18px]", corner: "h-2.5 w-2.5" },
  md: { box: "h-12 w-12 rounded-[0.7rem]", glyph: "h-[22px] w-[22px]", corner: "h-3 w-3" },
  lg: { box: "h-14 w-14 rounded-[0.8rem]", glyph: "h-7 w-7", corner: "h-3.5 w-3.5" },
};

/** A tool's glyph on a tinted, category-colored paper tile with a folded corner. */
export function ToolTile({
  tool,
  size = "md",
  className,
}: {
  tool: Tool;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const accent = accentFor(tool);
  const tint = tintFor(tool);
  const s = sizes[size];
  return (
    <span
      className={cn("relative grid shrink-0 place-items-center overflow-hidden", s.box, className)}
      style={{ backgroundColor: tint, color: accent, boxShadow: `inset 0 0 0 1px ${accent}1f` }}
    >
      <span
        aria-hidden
        className={cn("absolute right-0 top-0", s.corner)}
        style={{ backgroundColor: accent, opacity: 0.2, clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
      />
      <ToolGlyph slug={tool.slug} className={cn("relative", s.glyph)} />
    </span>
  );
}

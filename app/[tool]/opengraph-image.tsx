import { ImageResponse } from "next/og";
import { getTool, allSlugs, categoryMap, engineLabel } from "@/lib/tools";
import { site } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name} — PDF tools`;

export const dynamicParams = false;
export function generateStaticParams() {
  return allSlugs().map((tool) => ({ tool }));
}

// Branded social card per tool: brand mark, category, big tool name, tagline.
export default async function Image({ params }: { params: Promise<{ tool: string }> }) {
  const { tool: slug } = await params;
  const tool = getTool(slug);
  const cat = tool ? categoryMap[tool.category] : null;
  const accent = cat?.accent ?? "#5A48F5";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FBFAF7",
          padding: "72px 80px",
          fontFamily: "sans-serif",
          borderTop: `16px solid ${accent}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#16151D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 32,
              fontWeight: 800,
            }}
          >
            P
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#16151D" }}>{site.name}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
            <div style={{ width: 14, height: 14, borderRadius: 7, background: accent, display: "flex" }} />
            <div style={{ fontSize: 24, letterSpacing: 3, color: "#605F6D", fontWeight: 600 }}>
              {(cat?.label ?? "PDF Tools").toUpperCase()}
            </div>
          </div>
          <div style={{ fontSize: 96, fontWeight: 800, color: "#16151D", lineHeight: 1.04, maxWidth: 1000 }}>
            {tool?.name ?? site.name}
          </div>
          <div style={{ height: 8, width: 132, background: accent, borderRadius: 4, marginTop: 28, display: "flex" }} />
          <div style={{ fontSize: 34, color: "#605F6D", lineHeight: 1.3, maxWidth: 940, marginTop: 28 }}>
            {tool?.tagline ?? site.tagline}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 24, color: accent, fontWeight: 600 }}>{tool ? engineLabel[tool.engine] : ""}</div>
          <div style={{ fontSize: 24, color: "#605F6D" }}>{site.url.replace("https://", "")}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}

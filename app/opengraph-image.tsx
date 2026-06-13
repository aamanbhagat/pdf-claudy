import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name} — ${site.tagline}`;

// Branded social card for the homepage.
export default function Image() {
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
          borderTop: "16px solid #5A48F5",
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
          <div style={{ fontSize: 92, fontWeight: 800, color: "#16151D", lineHeight: 1.05, maxWidth: 1000 }}>
            Every PDF tool, right in your browser.
          </div>
          <div style={{ height: 8, width: 132, background: "#5A48F5", borderRadius: 4, marginTop: 28, display: "flex" }} />
          <div style={{ fontSize: 34, color: "#605F6D", lineHeight: 1.3, maxWidth: 940, marginTop: 28 }}>
            Merge, split, compress, convert, edit, sign and protect — 32 tools, nothing to upload.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 24, color: "#5A48F5", fontWeight: 600 }}>Free · Private · Fast</div>
          <div style={{ fontSize: 24, color: "#605F6D" }}>{site.url.replace("https://", "")}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}

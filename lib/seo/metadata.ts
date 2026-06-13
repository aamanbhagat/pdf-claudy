import type { Metadata } from "next";
import { site } from "@/lib/site";
import type { Tool } from "@/lib/tools";

const benefit: Record<Tool["engine"], string> = {
  browser: "Free & private, right in your browser",
  server: "Fast, accurate conversion",
  ai: "AI-powered, in seconds",
};

export function toolMetadata(tool: Tool): Metadata {
  const url = `${site.url}/${tool.slug}`;
  const title = `${tool.name} online`;
  const description = `${tool.description} ${benefit[tool.engine]}.`;
  return {
    title,
    description,
    keywords: tool.keywords,
    alternates: { canonical: `/${tool.slug}` },
    openGraph: {
      type: "website",
      url,
      title: `${tool.name} · ${site.name}`,
      description,
      siteName: site.name,
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.name} · ${site.name}`,
      description,
    },
  };
}

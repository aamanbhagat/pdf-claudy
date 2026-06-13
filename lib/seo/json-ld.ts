import { site } from "@/lib/site";
import { categoryMap, type Tool } from "@/lib/tools";

const abs = (path = "") => `${site.url}${path}`;

/** WebSite + Organization graph for the homepage. */
export function homeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": abs("/#org"),
        name: site.name,
        url: site.url,
        description: site.description,
      },
      {
        "@type": "WebSite",
        "@id": abs("/#website"),
        url: site.url,
        name: site.name,
        description: site.description,
        publisher: { "@id": abs("/#org") },
      },
    ],
  };
}

/** SoftwareApplication + Breadcrumb (+ HowTo + FAQ when present) for a tool page. */
export function toolJsonLd(tool: Tool) {
  const url = abs(`/${tool.slug}`);
  const category = categoryMap[tool.category];

  const graph: Record<string, unknown>[] = [
    {
      "@type": "SoftwareApplication",
      "@id": `${url}#app`,
      name: `${tool.name} — ${site.name}`,
      url,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any (web browser)",
      description: tool.description,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@id": abs("/#org") },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url },
        { "@type": "ListItem", position: 2, name: category.label, item: abs(`/#${category.id}`) },
        { "@type": "ListItem", position: 3, name: tool.name, item: url },
      ],
    },
  ];

  if (tool.howto?.length) {
    graph.push({
      "@type": "HowTo",
      name: `How to ${tool.name.toLowerCase()}`,
      step: tool.howto.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.title,
        text: s.body,
      })),
    });
  }

  if (tool.faqs?.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: tool.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

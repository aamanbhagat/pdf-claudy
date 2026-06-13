import type { NextRequest } from "next/server";

// Runs on the Node runtime so we can forward multipart bodies to the VPS.
export const runtime = "nodejs";
export const maxDuration = 120;

// The conversions the VPS service actually implements (keep in sync with it).
const OPS = new Set([
  "word-to-pdf",
  "powerpoint-to-pdf",
  "excel-to-pdf",
  "pdf-to-word",
  "pdf-to-powerpoint",
  "pdf-to-excel",
  "pdf-to-pdfa",
  "repair-pdf",
  "html-to-pdf",
]);

/**
 * Proxy to the convert microservice. The browser never talks to the VPS
 * directly (the bearer token + service URL stay server-side); this route
 * forwards the upload and streams the converted file back.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ op: string }> }) {
  const { op } = await params;
  if (!OPS.has(op)) return Response.json({ error: "Unknown conversion" }, { status: 404 });

  const base = process.env.CONVERT_SERVICE_URL;
  const token = process.env.CONVERT_SERVICE_TOKEN;
  if (!base || !token) {
    return Response.json({ error: "This conversion isn’t configured yet." }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Invalid upload" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${base}/convert/${op}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
  } catch {
    return Response.json({ error: "The conversion service is unreachable right now." }, { status: 502 });
  }

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    return new Response(detail || JSON.stringify({ error: "Conversion failed" }), {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") || "application/json" },
    });
  }

  const headers = new Headers();
  headers.set("content-type", upstream.headers.get("content-type") || "application/octet-stream");
  const cd = upstream.headers.get("content-disposition");
  if (cd) headers.set("content-disposition", cd);
  headers.set("cache-control", "no-store");
  return new Response(upstream.body, { status: 200, headers });
}

import type { NextRequest } from "next/server";
import { streamChat, aiConfigured, type ChatMessage } from "@/lib/ai/deepseek";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_INPUT = 48000; // characters of extracted text sent to the model

/**
 * AI endpoints backed by DeepSeek. The browser extracts the PDF text and posts
 * it here; we never see the file and the API key stays server-side. The reply
 * is streamed back as plain text so the UI can render it as it arrives.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ op: string }> }) {
  const { op } = await params;
  if (op !== "summarize" && op !== "translate") {
    return Response.json({ error: "Unknown operation" }, { status: 404 });
  }
  if (!aiConfigured()) {
    return Response.json({ error: "AI isn’t configured yet." }, { status: 503 });
  }

  let body: { text?: string; language?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const text = String(body.text ?? "").slice(0, MAX_INPUT).trim();
  if (!text) {
    return Response.json(
      { error: "No readable text found. If this is a scanned PDF, run OCR first." },
      { status: 400 },
    );
  }

  let messages: ChatMessage[];
  if (op === "summarize") {
    messages = [
      {
        role: "system",
        content:
          "You are an expert analyst. Summarize the document in plain text: first a short overview paragraph, then a line reading \"Key points:\" followed by bullet lines that each start with \"• \". Be faithful, specific and concise. Do not use Markdown symbols like # or *.",
      },
      { role: "user", content: text },
    ];
  } else {
    const language = (String(body.language ?? "").trim() || "English").slice(0, 40);
    messages = [
      {
        role: "system",
        content: `Translate the user's text into ${language}. Preserve the meaning, tone and paragraph structure. Output only the translation, with no preamble or notes.`,
      },
      { role: "user", content: text },
    ];
  }

  try {
    const stream = await streamChat(messages, { temperature: op === "translate" ? 0.2 : 0.4 });
    return new Response(stream, {
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
    });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "AI request failed" }, { status: 502 });
  }
}

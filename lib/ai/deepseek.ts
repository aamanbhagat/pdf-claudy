/**
 * Server-only DeepSeek client (OpenAI-compatible chat completions).
 * The API key is read from the environment and never reaches the browser —
 * the /api/ai routes are the only caller.
 */

const BASE = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
// `deepseek-chat` is the stable alias DeepSeek maps to its current fast model
// (deepseek-v4-flash). Override with DEEPSEEK_MODEL to pin a specific one.
const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export function aiConfigured(): boolean {
  return Boolean(process.env.DEEPSEEK_API_KEY);
}

/** Calls DeepSeek with streaming and re-emits just the assistant's text deltas. */
export async function streamChat(
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number } = {},
): Promise<ReadableStream<Uint8Array>> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("AI is not configured");

  const upstream = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: opts.temperature ?? 0.3,
      max_tokens: opts.maxTokens ?? 2400,
      stream: true,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    throw new Error(`AI request failed (${upstream.status}) ${detail.slice(0, 200)}`);
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  // Parse the SSE stream and forward only `choices[].delta.content` as plain text.
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const t = line.trim();
        if (!t.startsWith("data:")) continue;
        const data = t.slice(5).trim();
        if (data === "[DONE]") {
          controller.close();
          return;
        }
        try {
          const json = JSON.parse(data);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        } catch {
          // ignore partial/non-JSON keepalive lines
        }
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });
}

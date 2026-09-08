/**
 * The AI boundary (§07).
 *
 * Five call sites, all of them language-in or language-out. No arithmetic, no
 * ranking, no score ever comes from a model - those are §06 and must be
 * reproducible.
 *
 * Hard rule: no AI call sits on the critical line of a write path. Every site
 * has a working non-AI fallback, because a model outage must never stop
 * someone clocking in.
 */

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

export function aiEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

interface ChatOptions {
  system: string;
  user: string;
  /** JSON Schema for a structured response. Omit for prose. */
  schema?: { name: string; schema: Record<string, unknown> };
  maxTokens?: number;
}

export async function chat(opts: ChatOptions): Promise<string | null> {
  if (!aiEnabled()) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_completion_tokens: opts.maxTokens ?? 700,
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.user },
        ],
        ...(opts.schema
          ? {
              response_format: {
                type: "json_schema",
                json_schema: {
                  name: opts.schema.name,
                  strict: true,
                  schema: opts.schema.schema,
                },
              },
            }
          : {}),
      }),
      signal: AbortSignal.timeout(20_000),
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.choices?.[0]?.message?.content ?? null;
  } catch {
    // Every caller has a fallback. Failure here is never fatal.
    return null;
  }
}

const OPENROUTER_BASE = "https://openrouter.ai/api/v1/chat/completions";

export type OpenRouterMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type OpenRouterRequest = {
  model: string;
  messages: OpenRouterMessage[];
  response_format?: { type: "json_object" };
  temperature?: number;
  max_tokens?: number;
};

export type OpenRouterResponse = {
  choices: { message: { content: string } }[];
  error?: { message: string };
};

export function getApiKey(): string | undefined {
  return process.env.OPENROUTER_API_KEY;
}

export function getModel(): string {
  return process.env.IA_MODEL || "google/gemini-2.5-flash-lite";
}

export function getFallbackModel(): string {
  return process.env.IA_MODEL_FALLBACK || "openai/gpt-4o-mini";
}

export function getTimeout(us: string): number {
  const key = `IA_TIMEOUT_${us.toUpperCase()}` as keyof NodeJS.ProcessEnv;
  return Number(process.env[key]) || 15000;
}

export async function llamarOpenRouter(
  body: OpenRouterRequest,
  signal?: AbortSignal
): Promise<OpenRouterResponse> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY no configurada");
  }

  const res = await fetch(OPENROUTER_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://compras.bia.hn",
      "X-Title": "Portal de Compras BIA",
    },
    body: JSON.stringify({
      ...body,
      response_format: body.response_format ?? { type: "json_object" },
      temperature: body.temperature ?? 0.1,
      max_tokens: body.max_tokens ?? 2000,
    }),
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter HTTP ${res.status}: ${text}`);
  }

  return res.json();
}
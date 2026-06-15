import { getXaiApiKey, getXaiKeyFingerprint, getXaiModel } from "@/lib/xai/config";

export type XaiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type XaiApiKeyInfo = {
  ok: boolean;
  status: number;
  fingerprint: string | null;
  name?: string;
  redactedApiKey?: string;
  acls?: string[];
  teamBlocked?: boolean;
  apiKeyBlocked?: boolean;
  apiKeyDisabled?: boolean;
  error?: string;
};

export class XaiClientError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "XaiClientError";
    this.status = status;
  }
}

function buildXaiErrorMessage(status: number, payload: Record<string, unknown>): string {
  const apiMessage =
    (payload?.error as { message?: string } | undefined)?.message ||
    (typeof payload?.error === "string" ? payload.error : null) ||
    (typeof payload?.message === "string" ? payload.message : null);

  if (typeof apiMessage === "string" && apiMessage.trim()) {
    return apiMessage;
  }

  if (status === 403) {
    return "xAI returned 403 Forbidden. Confirm the key in Vercel matches console.x.ai, billing/credits are active, and click Update API key after changing permissions.";
  }

  if (status === 401) {
    return "xAI rejected the API key (401). Paste a fresh key from console.x.ai into Vercel XAI_API_KEY and redeploy.";
  }

  return `xAI request failed (${status})`;
}

function extractResponsesText(payload: Record<string, unknown>): string | null {
  const output = payload.output;
  if (!Array.isArray(output)) return null;

  const chunks: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;

    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const typed = part as { type?: string; text?: string };
      if (typed.type === "output_text" && typed.text) {
        chunks.push(typed.text);
      }
    }
  }

  const combined = chunks.join("\n").trim();
  return combined || null;
}

export async function getXaiApiKeyInfo(): Promise<XaiApiKeyInfo> {
  const apiKey = getXaiApiKey();
  const fingerprint = getXaiKeyFingerprint();

  if (!apiKey) {
    return {
      ok: false,
      status: 503,
      fingerprint,
      error: "XAI_API_KEY is not configured",
    };
  }

  const response = await fetch("https://api.x.ai/v1/api-key", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      fingerprint,
      error: buildXaiErrorMessage(response.status, payload),
    };
  }

  return {
    ok: true,
    status: response.status,
    fingerprint,
    name: typeof payload.name === "string" ? payload.name : undefined,
    redactedApiKey:
      typeof payload.redacted_api_key === "string"
        ? payload.redacted_api_key
        : undefined,
    acls: Array.isArray(payload.acls)
      ? payload.acls.map((acl) => String(acl))
      : [],
    teamBlocked: Boolean(payload.team_blocked),
    apiKeyBlocked: Boolean(payload.api_key_blocked),
    apiKeyDisabled: Boolean(payload.api_key_disabled),
  };
}

async function requestXaiResponses(
  messages: XaiMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const apiKey = getXaiApiKey();
  if (!apiKey) {
    throw new XaiClientError("XAI_API_KEY is not configured", 503);
  }

  const response = await fetch("https://api.x.ai/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: getXaiModel(),
      input: messages,
      temperature: options?.temperature ?? 0.7,
      max_output_tokens: options?.maxTokens ?? 2500,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    throw new XaiClientError(
      buildXaiErrorMessage(response.status, payload),
      response.status
    );
  }

  const text = extractResponsesText(payload);
  if (!text) {
    throw new XaiClientError("xAI returned an empty response");
  }

  return text;
}

async function requestXaiChatCompletions(
  messages: XaiMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const apiKey = getXaiApiKey();
  if (!apiKey) {
    throw new XaiClientError("XAI_API_KEY is not configured", 503);
  }

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: getXaiModel(),
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2500,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    throw new XaiClientError(
      buildXaiErrorMessage(response.status, payload),
      response.status
    );
  }

  const content = (payload?.choices as Array<{ message?: { content?: string } }> | undefined)?.[0]
    ?.message?.content;

  if (!content || typeof content !== "string") {
    throw new XaiClientError("xAI returned an empty response");
  }

  return content.trim();
}

export async function createXaiChatCompletion(
  messages: XaiMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  let lastError: XaiClientError | null = null;

  try {
    return await requestXaiResponses(messages, options);
  } catch (error) {
    if (error instanceof XaiClientError) {
      lastError = error;
    } else {
      throw error;
    }
  }

  try {
    return await requestXaiChatCompletions(messages, options);
  } catch (error) {
    if (error instanceof XaiClientError) {
      throw error;
    }
    throw lastError ?? new XaiClientError("xAI request failed");
  }
}

export function parseJsonFromModel<T>(raw: string): T {
  const trimmed = raw.trim();

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced?.[1]) {
      return JSON.parse(fenced[1].trim()) as T;
    }

    const objectMatch = trimmed.match(/\{[\s\S]*\}/);
    if (objectMatch?.[0]) {
      return JSON.parse(objectMatch[0]) as T;
    }

    throw new XaiClientError("Could not parse JSON from xAI response");
  }
}

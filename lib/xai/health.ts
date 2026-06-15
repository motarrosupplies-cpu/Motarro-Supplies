import {
  createXaiChatCompletion,
  getXaiApiKeyInfo,
  XaiClientError,
} from "@/lib/xai/client";
import { getXaiKeyFingerprint, getXaiModel, isXaiConfigured } from "@/lib/xai/config";

export type XaiHealthResult = {
  configured: boolean;
  model: string;
  fingerprint: string | null;
  keyInfo?: {
    ok: boolean;
    name?: string;
    redactedApiKey?: string;
    acls?: string[];
    teamBlocked?: boolean;
    apiKeyBlocked?: boolean;
    apiKeyDisabled?: boolean;
    error?: string;
  };
  ok: boolean;
  error?: string;
  status?: number;
};

export async function testXaiConnection(): Promise<XaiHealthResult> {
  const model = getXaiModel();
  const fingerprint = getXaiKeyFingerprint();

  if (!isXaiConfigured()) {
    return {
      configured: false,
      model,
      fingerprint,
      ok: false,
      error: "XAI_API_KEY is not set on the server. Add it in Vercel, then redeploy.",
    };
  }

  const keyInfo = await getXaiApiKeyInfo();

  if (!keyInfo.ok) {
    return {
      configured: true,
      model,
      fingerprint,
      keyInfo: {
        ok: false,
        error: keyInfo.error,
      },
      ok: false,
      error:
        keyInfo.error ||
        "Could not validate XAI_API_KEY with xAI. Replace the key in Vercel and redeploy.",
      status: keyInfo.status,
    };
  }

  if (keyInfo.teamBlocked || keyInfo.apiKeyBlocked || keyInfo.apiKeyDisabled) {
    return {
      configured: true,
      model,
      fingerprint,
      keyInfo: {
        ok: true,
        name: keyInfo.name,
        redactedApiKey: keyInfo.redactedApiKey,
        acls: keyInfo.acls,
        teamBlocked: keyInfo.teamBlocked,
        apiKeyBlocked: keyInfo.apiKeyBlocked,
        apiKeyDisabled: keyInfo.apiKeyDisabled,
      },
      ok: false,
      error: "xAI reports this API key or team is blocked/disabled in console.x.ai.",
      status: 403,
    };
  }

  try {
    await createXaiChatCompletion(
      [{ role: "user", content: "Reply with the single word OK." }],
      { temperature: 0, maxTokens: 8 }
    );

    return {
      configured: true,
      model,
      fingerprint,
      keyInfo: {
        ok: true,
        name: keyInfo.name,
        redactedApiKey: keyInfo.redactedApiKey,
        acls: keyInfo.acls,
      },
      ok: true,
    };
  } catch (error) {
    if (error instanceof XaiClientError) {
      return {
        configured: true,
        model,
        fingerprint,
        keyInfo: {
          ok: true,
          name: keyInfo.name,
          redactedApiKey: keyInfo.redactedApiKey,
          acls: keyInfo.acls,
        },
        ok: false,
        error: error.message,
        status: error.status,
      };
    }

    return {
      configured: true,
      model,
      fingerprint,
      keyInfo: {
        ok: true,
        name: keyInfo.name,
        redactedApiKey: keyInfo.redactedApiKey,
        acls: keyInfo.acls,
      },
      ok: false,
      error: error instanceof Error ? error.message : "Unknown xAI error",
    };
  }
}

export function getXaiApiKey(): string | null {
  const raw = process.env.XAI_API_KEY?.trim();
  if (!raw) return null;

  // Vercel values are sometimes pasted with wrapping quotes.
  return raw.replace(/^["']+|["']+$/g, "");
}

export function getXaiModel(): string {
  const model = process.env.XAI_MODEL?.trim().replace(/^["']+|["']+$/g, "");
  return model || "grok-4.3";
}

export function isXaiConfigured(): boolean {
  return Boolean(getXaiApiKey());
}

export function getXaiKeyFingerprint(): string | null {
  const key = getXaiApiKey();
  if (!key) return null;
  if (key.length <= 8) return "****";
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

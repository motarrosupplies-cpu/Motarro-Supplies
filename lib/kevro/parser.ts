export type KevroApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: string | null;
};

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

export function parseKevroXmlResponse<T>(xml: string): KevroApiResponse<T> {
  const callResultMatch = xml.match(/<Callresult>\s*(true|false)\s*<\/Callresult>/i);
  const dataMatch = xml.match(/<ResponseData>([\s\S]*?)<\/ResponseData>/i);
  const errorMatch = xml.match(/<ErrorMsg>([\s\S]*?)<\/ErrorMsg>/i);

  const success = callResultMatch?.[1]?.toLowerCase() === "true";
  const rawData = dataMatch?.[1]?.trim() ?? "";
  const error = decodeXmlEntities(errorMatch?.[1]?.trim() ?? "");

  if (!success) {
    return { success: false, data: null, error: error || "Kevro request failed" };
  }

  if (!rawData) {
    return { success: true, data: null, error: null };
  }

  try {
    return { success: true, data: JSON.parse(rawData) as T, error: null };
  } catch {
    return { success: false, data: null, error: "Failed to parse Kevro JSON payload" };
  }
}

export function extractCookies(setCookieHeaders: string[]): string {
  return setCookieHeaders
    .map((header) => header.split(";")[0]?.trim())
    .filter(Boolean)
    .join("; ");
}

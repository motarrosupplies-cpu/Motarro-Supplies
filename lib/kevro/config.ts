export function getKevroConfig() {
  const baseUrl =
    process.env.KEVRO_BASE_URL?.trim() ||
    "https://wslive.kevro.co.za/StockFeed.asmx";

  return {
    baseUrl: baseUrl.replace(/\/$/, ""),
    httpUsername: process.env.KEVRO_HTTP_USERNAME?.trim() || "",
    httpPassword: process.env.KEVRO_HTTP_PASSWORD?.trim() || "",
    apiUsername: process.env.KEVRO_API_USERNAME?.trim() || "",
    apiPassword: process.env.KEVRO_API_PASSWORD?.trim() || "",
    entityName: process.env.KEVRO_ENTITY_NAME?.trim() || "",
    entityId: Number(process.env.KEVRO_ENTITY_ID || "0"),
    tokenKey: process.env.KEVRO_TOKEN_KEY?.trim() || "",
    markupPercent: Number(process.env.KEVRO_PRICE_MARKUP_PERCENT || "0"),
    cacheSeconds: Number(process.env.KEVRO_CACHE_SECONDS || "1800"),
  };
}

export function isKevroConfigured(): boolean {
  const cfg = getKevroConfig();
  return Boolean(
    cfg.httpUsername &&
      cfg.httpPassword &&
      cfg.apiUsername &&
      cfg.apiPassword &&
      cfg.entityName &&
      cfg.entityId > 0 &&
      cfg.tokenKey
  );
}

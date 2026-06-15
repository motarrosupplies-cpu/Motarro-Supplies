const DEFAULT_STORE_URL = "https://titanjet.co.za";

export function getTitanJetConfig() {
  const storeUrl = (
    process.env.TITAN_JET_WC_STORE_URL?.trim() || DEFAULT_STORE_URL
  ).replace(/\/$/, "");

  return {
    storeUrl,
    apiBase: `${storeUrl}/wp-json/wc/store/v1`,
    markupPercent: Number(process.env.TITAN_JET_PRICE_MARKUP_PERCENT || "0"),
    cacheSeconds: Number(process.env.TITAN_JET_CACHE_SECONDS || "1800"),
    syncPerPage: Number(process.env.TITAN_JET_SYNC_PER_PAGE || "100"),
  };
}

export function isTitanJetConfigured(): boolean {
  return Boolean(getTitanJetConfig().storeUrl);
}

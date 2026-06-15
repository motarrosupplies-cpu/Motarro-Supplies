import { getKevroConfig } from "@/lib/kevro/config";
import { extractCookies, parseKevroXmlResponse } from "@/lib/kevro/parser";
import type { KevroCategory, KevroStockRow } from "@/types/kevro";

function basicAuthHeader(username: string, password: string): string {
  const token = Buffer.from(`${username}:${password}`).toString("base64");
  return `Basic ${token}`;
}

function buildUrl(path: string, params: Record<string, string | number>): string {
  const cfg = getKevroConfig();
  const url = new URL(`${cfg.baseUrl}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function kevroGet<T>(
  path: string,
  params: Record<string, string | number>,
  sessionCookie?: string
): Promise<T> {
  const cfg = getKevroConfig();
  const headers: Record<string, string> = {
    Authorization: basicAuthHeader(cfg.httpUsername, cfg.httpPassword),
  };

  if (sessionCookie) {
    headers.Cookie = sessionCookie;
  }

  const response = await fetch(buildUrl(path, params), {
    method: "GET",
    headers,
    cache: "no-store",
  });

  const xml = await response.text();
  const parsed = parseKevroXmlResponse<T>(xml);

  if (!parsed.success || parsed.data === null) {
    throw new Error(parsed.error || `Kevro ${path} failed`);
  }

  return parsed.data;
}

export async function createKevroSession(): Promise<string> {
  const cfg = getKevroConfig();
  const url = buildUrl("login", {
    TokenKey: cfg.tokenKey,
    username: cfg.apiUsername,
    psw: cfg.apiPassword,
    EntityName: cfg.entityName,
    entityID: cfg.entityId,
  });

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: basicAuthHeader(cfg.httpUsername, cfg.httpPassword),
    },
    cache: "no-store",
  });

  const xml = await response.text();
  const parsed = parseKevroXmlResponse<unknown>(xml);

  if (!parsed.success) {
    throw new Error(parsed.error || "Kevro login failed");
  }

  const setCookies =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : [];

  const cookieHeader = extractCookies(setCookies);
  if (!cookieHeader) {
    throw new Error("Kevro login succeeded but no session cookie was returned");
  }

  return cookieHeader;
}

async function withSession<T>(fn: (cookie: string) => Promise<T>): Promise<T> {
  const cookie = await createKevroSession();
  return fn(cookie);
}

export async function fetchKevroStockFeed(): Promise<KevroStockRow[]> {
  const cfg = getKevroConfig();

  return withSession((cookie) =>
    kevroGet<KevroStockRow[]>(
      "GetFeedByEntityID",
      {
        entityID: cfg.entityId,
        username: cfg.apiUsername,
        psw: cfg.apiPassword,
        ReturnType: "JSON",
      },
      cookie
    )
  );
}

export async function fetchKevroCategories(): Promise<KevroCategory[]> {
  const cfg = getKevroConfig();

  return withSession((cookie) =>
    kevroGet<KevroCategory[]>(
      "GetAllFeedCategories",
      {
        entityID: cfg.entityId,
        username: cfg.apiUsername,
        psw: cfg.apiPassword,
        ReturnType: "JSON",
      },
      cookie
    )
  );
}

type BrandingParams = Record<string, string | number>;

async function fetchKevroBranding<T>(
  path: string,
  params: BrandingParams
): Promise<T> {
  const cfg = getKevroConfig();
  return withSession((cookie) =>
    kevroGet<T>(
      path,
      {
        entityID: cfg.entityId,
        username: cfg.apiUsername,
        psw: cfg.apiPassword,
        ReturnType: "JSON",
        ...params,
      },
      cookie
    )
  );
}

export async function fetchKevroBrandingOptions(stockHeaderId: number) {
  return fetchKevroBranding<unknown[]>("ListBrandingOptions", {
    StockHeaderID: stockHeaderId,
  });
}

export async function fetchKevroBrandingPositions(stockHeaderId: number) {
  return fetchKevroBranding<unknown[]>("ListBrandingPositions", {
    StockHeaderID: stockHeaderId,
  });
}

export async function fetchKevroBrandingPricing(stockHeaderId: number) {
  return fetchKevroBranding<unknown[]>("GetBrandingPricingByStockHeaderID", {
    StockHeaderID: stockHeaderId,
  });
}

export async function fetchKevroStockByHeaderId(
  stockHeaderId: number
): Promise<KevroStockRow[]> {
  const cfg = getKevroConfig();

  return withSession((cookie) =>
    kevroGet<KevroStockRow[]>(
      "GetFeedByEntityIDAndStockHeaderID",
      {
        entityID: cfg.entityId,
        username: cfg.apiUsername,
        psw: cfg.apiPassword,
        StockHeaderID: stockHeaderId,
        ReturnType: "JSON",
      },
      cookie
    )
  );
}

import { getTitanJetConfig } from "@/lib/titan-jet/config";

export type WcStoreProduct = {
  id: number;
  name: string;
  slug: string;
  sku: string;
  type: string;
  description: string;
  short_description: string;
  prices: {
    price: string;
    regular_price: string;
    sale_price: string;
  };
  images: Array<{ src: string; thumbnail?: string }>;
  categories: Array<{ id: number; name: string; slug: string }>;
  brands: Array<{ id: number; name: string; slug: string }>;
  tags: Array<{ id: number; name: string; slug: string }>;
  attributes: Array<{
    name: string;
    terms: Array<{ name: string; slug: string }>;
  }>;
  is_in_stock: boolean;
  is_on_backorder: boolean;
  add_to_cart?: {
    maximum?: number;
    minimum?: number;
  };
};

type FetchPageResult = {
  products: WcStoreProduct[];
  total: number;
  totalPages: number;
};

function parseTotal(header: string | null): number {
  const value = Number(header);
  return Number.isFinite(value) ? value : 0;
}

export async function fetchTitanJetProductsPage(
  page: number,
  perPage?: number
): Promise<FetchPageResult> {
  const { apiBase, syncPerPage } = getTitanJetConfig();
  const limit = perPage ?? syncPerPage;
  const url = `${apiBase}/products?per_page=${limit}&page=${page}`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(
      `Titan Jet API error ${response.status} on page ${page}`
    );
  }

  const products = (await response.json()) as WcStoreProduct[];
  return {
    products,
    total: parseTotal(response.headers.get("X-WP-Total")),
    totalPages: parseTotal(response.headers.get("X-WP-TotalPages")),
  };
}

export async function fetchAllTitanJetStoreProducts(): Promise<WcStoreProduct[]> {
  const { syncPerPage } = getTitanJetConfig();
  const first = await fetchTitanJetProductsPage(1, syncPerPage);
  const all = [...first.products];
  const totalPages = first.totalPages || 1;

  if (totalPages > 1) {
    const remainingPages = Array.from(
      { length: totalPages - 1 },
      (_, index) => index + 2
    );
    const batches = await Promise.all(
      remainingPages.map((page) => fetchTitanJetProductsPage(page, syncPerPage))
    );
    for (const batch of batches) {
      all.push(...batch.products);
    }
  }

  return all;
}

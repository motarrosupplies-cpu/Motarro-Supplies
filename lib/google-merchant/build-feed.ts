import {
  fetchAllKevroMerchantRows,
  kevroRowToMerchantFeedProduct,
  type MerchantFeedProduct,
} from "@/lib/google-merchant/kevro";
import {
  fetchAllTitanJetMerchantRows,
  titanJetRowToMerchantFeedProduct,
} from "@/lib/google-merchant/titan-jet";
import { getPrimaryMerchantImageUrl } from "@/lib/google-merchant/images";
import { getMerchantFeedSupabaseClient } from "@/lib/google-merchant/supabase";
import { fetchAllUnifiedMerchantRows } from "@/lib/google-merchant/unified";

function unifiedRowToFeedProduct(product: Record<string, unknown>): MerchantFeedProduct {
  return {
    id: String(product.id),
    name: String(product.name || ""),
    description: String(product.description || product.name || ""),
    link: `https://www.motarro.co.za/products/${product.slug || product.seo_slug || product.id}`,
    price: Number(product.price) || 0,
    image: product.image as string | null | undefined,
    images: product.images,
    availability: product.availability as string | null | undefined,
    availability_date: product.availability_date as string | null | undefined,
    total_stock: Number(product.total_stock ?? product.stock ?? 0),
    stock: Number(product.stock ?? 0),
    category: product.category as string | null | undefined,
    brand: "MOTARRO Supplies",
    sku: product.sku as string | null | undefined,
    colors: product.colors,
    sizes: product.sizes,
    google_product_category: "1604",
    identifier_exists: false,
  };
}

export function isPublishableMerchantFeedProduct(product: MerchantFeedProduct): boolean {
  const price = Number(product.price);
  const name = product.name?.trim();
  const description = product.description?.trim();
  const image = getPrimaryMerchantImageUrl(product);
  const link = product.link?.trim();

  return Boolean(
    name &&
      description &&
      link &&
      image &&
      !Number.isNaN(price) &&
      price > 0
  );
}

export type MerchantFeedBuildResult = {
  products: MerchantFeedProduct[];
  publishable: MerchantFeedProduct[];
  publishableIds: Set<string>;
  counts: {
    native: number;
    kevro: number;
    titanJet: number;
    publishable: number;
    skipped: number;
  };
};

export async function buildMerchantFeedProducts(): Promise<MerchantFeedBuildResult> {
  const client = getMerchantFeedSupabaseClient();

  const nativeRows = await fetchAllUnifiedMerchantRows(client);

  const [kevroRows, titanJetRows] = await Promise.all([
    fetchAllKevroMerchantRows(client),
    fetchAllTitanJetMerchantRows(client),
  ]);

  const byId = new Map<string, MerchantFeedProduct>();

  for (const row of nativeRows || []) {
    const product = unifiedRowToFeedProduct(row);
    byId.set(product.id, product);
  }

  for (const row of kevroRows) {
    const product = kevroRowToMerchantFeedProduct(row);
    byId.set(product.id, product);
  }

  for (const row of titanJetRows) {
    const product = titanJetRowToMerchantFeedProduct(row);
    byId.set(product.id, product);
  }

  const products = [...byId.values()];
  const publishable = products.filter(isPublishableMerchantFeedProduct);
  const publishableIds = new Set(publishable.map((product) => product.id));

  return {
    products,
    publishable,
    publishableIds,
    counts: {
      native: nativeRows?.length ?? 0,
      kevro: kevroRows.length,
      titanJet: titanJetRows.length,
      publishable: publishable.length,
      skipped: products.length - publishable.length,
    },
  };
}

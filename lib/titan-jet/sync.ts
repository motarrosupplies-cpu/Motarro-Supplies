import { supabaseAdmin } from "@/lib/supabaseClient";
import { fetchAllTitanJetStoreProducts } from "@/lib/titan-jet/client";
import { isTitanJetConfigured } from "@/lib/titan-jet/config";
import { resolveTitanJetMarkupPercent } from "@/lib/titan-jet/markup";
import { transformWcStoreProducts } from "@/lib/titan-jet/transform";

export type TitanJetSyncResult = {
  ok: boolean;
  productCount: number;
  error?: string;
};

export async function syncTitanJetFeedToSupabase(): Promise<TitanJetSyncResult> {
  if (!isTitanJetConfigured()) {
    return { ok: false, productCount: 0, error: "Titan Jet feed is not configured" };
  }

  if (!supabaseAdmin) {
    return {
      ok: false,
      productCount: 0,
      error: "SUPABASE_SERVICE_ROLE_KEY is required for Titan Jet sync",
    };
  }

  const { data: runRow, error: runError } = await supabaseAdmin
    .from("titan_jet_sync_runs")
    .insert({ status: "running" })
    .select("id")
    .single();

  if (runError) {
    return { ok: false, productCount: 0, error: runError.message };
  }

  try {
    const rows = await fetchAllTitanJetStoreProducts();
    const products = await transformWcStoreProducts(
      rows,
      resolveTitanJetMarkupPercent
    );
    const syncedAt = new Date().toISOString();

    const payload = products.map((product) => ({
      wc_product_id: product.wcProductId,
      slug: product.slug,
      sku: product.sku,
      name: product.name,
      description: product.description,
      short_description: product.shortDescription,
      category: product.category,
      categories: product.categories,
      brand: product.brand,
      image: product.image,
      images: product.images,
      tags: product.tags,
      attributes: product.attributes,
      variants: product.variants,
      min_price: product.minPrice,
      max_price: product.maxPrice,
      total_stock: product.totalStock,
      in_stock: product.inStock,
      product_type: product.productType,
      store_section: product.storeSection ?? "accessories",
      status: "active",
      synced_at: syncedAt,
      updated_at: syncedAt,
    }));

    const chunkSize = 100;
    for (let index = 0; index < payload.length; index += chunkSize) {
      const chunk = payload.slice(index, index + chunkSize);
      const { error } = await supabaseAdmin
        .from("titan_jet_products")
        .upsert(chunk, { onConflict: "wc_product_id" });

      if (error) {
        throw new Error(error.message);
      }
    }

    await supabaseAdmin
      .from("titan_jet_sync_runs")
      .update({
        status: "success",
        product_count: products.length,
        finished_at: new Date().toISOString(),
      })
      .eq("id", runRow.id);

    return { ok: true, productCount: products.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    await supabaseAdmin
      .from("titan_jet_sync_runs")
      .update({
        status: "failed",
        error_message: message,
        finished_at: new Date().toISOString(),
      })
      .eq("id", runRow.id);

    return { ok: false, productCount: 0, error: message };
  }
}

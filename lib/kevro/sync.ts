import { supabaseAdmin } from "@/lib/supabaseClient";
import { fetchKevroStockFeed } from "@/lib/kevro/client";
import { isKevroConfigured } from "@/lib/kevro/config";
import { resolveKevroMarkupPercent } from "@/lib/kevro/markup";
import { groupKevroStockRows } from "@/lib/kevro/transform";
import {
  resolveKevroStoreSection,
  resolveKevroSubcategorySlug,
} from "@/lib/kevro/store-section";

export type KevroSyncResult = {
  ok: boolean;
  productCount: number;
  error?: string;
};

export async function syncKevroFeedToSupabase(): Promise<KevroSyncResult> {
  if (!isKevroConfigured()) {
    return { ok: false, productCount: 0, error: "Kevro feed is not configured" };
  }

  if (!supabaseAdmin) {
    return {
      ok: false,
      productCount: 0,
      error: "SUPABASE_SERVICE_ROLE_KEY is required for Kevro sync",
    };
  }

  const { data: runRow, error: runError } = await supabaseAdmin
    .from("kevro_sync_runs")
    .insert({ status: "running" })
    .select("id")
    .single();

  if (runError) {
    return { ok: false, productCount: 0, error: runError.message };
  }

  try {
    const rows = await fetchKevroStockFeed();
    const products = await groupKevroStockRows(rows, resolveKevroMarkupPercent);
    const syncedAt = new Date().toISOString();

    const payload = products.map((product) => ({
      stock_header_id: product.stockHeaderId,
      stock_code: product.stockCode,
      slug: product.slug,
      name: product.name,
      description: product.description,
      category: product.category,
      type: product.type,
      brand: product.brand,
      image: product.image,
      images: product.images,
      colors: product.colors,
      sizes: product.sizes,
      variants: product.variants,
      min_price: product.minPrice,
      max_price: product.maxPrice,
      total_stock: product.totalStock,
      in_stock: product.inStock,
      garment_type: product.garmentType ?? null,
      gender: product.gender ?? null,
      store_section: resolveKevroStoreSection(product),
      subcategory_slug: resolveKevroSubcategorySlug(product.type),
      status: "active",
      synced_at: syncedAt,
      updated_at: syncedAt,
    }));

    const chunkSize = 100;
    let useStoreSectionColumns = true;

    for (let index = 0; index < payload.length; index += chunkSize) {
      const chunk = payload.slice(index, index + chunkSize);
      const upsertPayload = useStoreSectionColumns
        ? chunk
        : chunk.map(({ store_section, subcategory_slug, ...rest }) => rest);

      const { error } = await supabaseAdmin
        .from("kevro_products")
        .upsert(upsertPayload, { onConflict: "stock_header_id" });

      if (error) {
        if (
          useStoreSectionColumns &&
          (error.message.includes("store_section") ||
            error.message.includes("subcategory_slug"))
        ) {
          useStoreSectionColumns = false;
          index -= chunkSize;
          continue;
        }
        throw new Error(error.message);
      }
    }

    await supabaseAdmin
      .from("kevro_sync_runs")
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
      .from("kevro_sync_runs")
      .update({
        status: "failed",
        error_message: message,
        finished_at: new Date().toISOString(),
      })
      .eq("id", runRow.id);

    return { ok: false, productCount: 0, error: message };
  }
}

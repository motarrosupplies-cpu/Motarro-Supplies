# Product schema and API

## Canonical structure

- **Tables**: `simple_products`, `color_only_products`, `size_only_products`, `full_variant_products`, plus variant tables `color_variants`, `size_variants`, `full_variants` (or equivalent).
- **View**: `all_products_unified` — union of the four product tables with a common shape (`product_type`, `stock`/`total_stock`, `colors`, `sizes`, etc.). Used for listing and filtering. Recreate with [recreate-all-products-unified-view.sql](../recreate-all-products-unified-view.sql) (no SECURITY DEFINER).
- **RLS / triggers**: Product tables and views are covered by [fix-supabase-security-warnings.sql](../fix-supabase-security-warnings.sql). Function search paths and RLS policies are set there. Stock sync triggers are in [fix-product-stock-triggers.sql](../fix-product-stock-triggers.sql).

## Routes and tables

| Route | Read | Write | Client |
|-------|------|-------|--------|
| `GET /api/products/optimized` | `all_products_unified` | — | supabaseAdmin \|\| supabase |
| `POST /api/products/optimized` | — | simple_products / color_only_products / size_only_products / full_variant_products + variant tables | **supabaseAdmin only** |
| `GET /api/products/optimized/[id]` | all_products_unified, then specific table by id | — | supabaseAdmin ?? supabase |
| `PUT /api/products/optimized/[id]` | all_products_unified, specific table | same tables + variant tables | **supabaseAdmin only** |
| `DELETE /api/products/optimized/[id]` | all_products_unified | simple_products / color_only_products / etc. | **supabaseAdmin only** |
| `GET /api/products/route.ts` | all_products_unified | — | supabase |
| `GET /api/products/search` | all_products_unified | — | supabase |

Admin product create/update/delete **require** `SUPABASE_SERVICE_ROLE_KEY`; the API returns 500 with a clear message if it is missing.

## Shared fields (all product types)

- name, description, price, original_price, category, subcategory
- image, images, image_alt_texts
- status, is_new, on_sale
- seo_title, seo_description, seo_keywords, seo_slug
- availability, availability_date, condition, low_stock_threshold
- created_at, updated_at

Stock: `simple_products` has `stock`; variant tables have `total_stock` and per-variant stock (e.g. `color_variants.stock_available`). Triggers keep `total_stock` in sync where applicable.

## Custom printing vs normal products

Custom printing is a **category** (e.g. `category = 'custom printing'`) and optional design/print fields on the same product tables and APIs. Use the same optimized routes and `all_products_unified`; filter by category or subcategory for custom-printing listings.

## Obsolete / legacy

- Root-level SQL scripts that only fix one-off issues (slugs, single product, etc.) are superseded by the canonical migrations and [optimized-product-database-structure.sql](../optimized-product-database-structure.sql) + [recreate-all-products-unified-view.sql](../recreate-all-products-unified-view.sql). Do not re-run ad‑hoc scripts without checking this doc and `supabase/migrations/`.

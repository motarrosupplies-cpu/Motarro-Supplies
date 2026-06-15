# Product Management – Strategic Setup

This document describes how products, custom-printing, variants (colour × size), stock, and checkout are intended to work so that **add/edit/update and storing to Supabase is seamless** without manual SQL or one-off debugging.

---

## 1. Data model (Supabase)

- **Four product tables** (by variant type):
  - `simple_products` – no colour/size (single `stock`).
  - `color_only_products` – colour only; `total_stock`; variants in `color_variants`.
  - `size_only_products` – size only; `total_stock`; variants in `size_variants`.
  - `full_variant_products` – colour × size matrix; `total_stock`; variants in `full_variants`.
- **Unified read path**: view `all_products_unified` unions these four with `WHERE status = 'active'`.  
  List APIs and admin read from this view (or from the same tables) so **status must be exactly `'active'`** (lowercase) for products to appear.
- **Stock**: For variant products, `total_stock` on the parent row is the sum of variant `stock_available`. The API recalculates and updates `total_stock` when variants are created/updated so stock stays in sync without manual SQL.

No manual SQL is required for normal **add / edit / update stock**; the app handles which table and variants to write.

---

## 2. Filtering: Products vs Custom-Products

- **Single source of truth**: list endpoint supports a query parameter.
  - **`GET /api/products/optimized?filter=store`**  
    Excludes `category = 'custom printing'` (store products only).
  - **`GET /api/products/optimized?filter=custom-printing`**  
    Only `category = 'custom printing'` (custom-printing products only).
  - No `filter` → all products (e.g. for sitemap or internal tools).
- **Admin**:
  - **Products** page uses `?filter=store` (no client-side filter).
  - **Custom Printing** page uses `?filter=custom-printing` (no client-side filter).

You no longer need to maintain separate SQL or client logic to “filter products vs custom-products”; the API does it.

---

## 3. CRUD and storing to Supabase

- **Create**: `POST /api/products` → forwards to `POST /api/products/optimized`.  
  Body includes `hasColorOptions`, `hasSizeOptions`, `colors`, `sizes`, `variants`.  
  The API chooses the correct table (simple / color_only / size_only / full_variant), inserts the row, and creates variant rows (colour × size matrix when both are present).  
  `status` is set to `'active'` so the product appears in the unified view immediately.
- **Read one**: `GET /api/products/[id]` and `GET /api/products/optimized/[id]` resolve by ID or slug, load from the appropriate table and its variant table, and return a single product with `variants` and `stock`/`total_stock`.
- **Update**: `PUT /api/products/[id]` → `PUT /api/products/optimized/[id]`.  
  The API finds the existing product type, then either:
  - **Same type**: updates the row and replaces variants (delete + insert), then recalculates `total_stock`.
  - **Type change**: inserts into the new table (and new variant table), then deletes from the old table/variants.  
  Status is normalized to lowercase `'active'` or `'disabled'` so the view continues to match.
- **Delete**: `DELETE /api/products/[id]` → `DELETE /api/products/optimized/[id]` (deletes from the correct product and variant tables).

Adding/editing products and updating stock is done through these endpoints; no ad-hoc SQL is required for normal operations.

---

## 4. Colour × size matrix and stock

- **Admin**: Add/Edit product forms use the **Variant Matrix** (colour × size).  
  Rows are sent as `variants` (e.g. `colorName`, `colorValue`, `size`, `stockAvailable`, `priceOverride`).  
  The API creates/updates the correct variant table and keeps `total_stock` in sync.
- **Storefront**: Product page resolves the selected colour/size to a **matching variant** and uses its `stockAvailable` (and optional `priceOverride`) for add-to-cart and availability.  
  Cart and checkout send `variantId` (and optionally `selectedColor` / `selectedSize`) so invoicing and quoting can tie back to the same variant.

Stock and availability are driven by variant rows; updating variants through the API keeps everything aligned.

---

## 5. Cart and checkout

- **Cart**: Items are keyed by `id|variantId|selectedSize|selectedColor`.  
  Quantities are capped by variant `stockAvailable` (or product `stock` for simple products).  
  Totals use `Number(price)` so string prices from APIs don’t cause calculation errors.
- **Checkout**:  
  - **Payfast**: The checkout payload includes **`customerEmail`** so the Payfast initiate API can pass a valid `email_address` and avoid “application exception” style errors.  
  - **EFT**: Order items send `price` as a number.  
  - Order/invoice services receive consistent product id, variant id, and price.

---

## 6. Invoicing and quoting

- Orders and quotes reference `productId`, `variantId` (when applicable), and `price` at time of order.  
- Product and variant data are read from the same optimized tables/view, so as long as you use the standard **add/edit/update** flows above, product and stock data stay consistent and invoicing/quoting don’t require extra SQL fixes.

---

## 7. If something doesn’t show or stock looks wrong

- **Product missing from list**: Ensure `status = 'active'` (lowercase) in the correct product table.  
  The unified view only includes rows where `status = 'active'`.
- **Wrong or stale stock**: Ensure updates go through `PUT /api/products/optimized/[id]` with the full `variants` array; the API recalculates `total_stock` after variant updates.
- **Checkout/Payfast error**: Ensure the checkout payload includes `customerEmail` and that cart item `price` is numeric (the app now coerces and validates these).

If you still need to touch the database directly (e.g. one-off data fix), use the same column names and conventions as the API (snake_case, `status = 'active'`, variant tables as above).

# New Simplified Product System Design

## Current Problems

1. **Multiple product tables** - `simple_products`, `color_only_products`, `size_only_products`, `full_variant_products`
2. **Multiple variant tables** - `color_variants`, `size_variants`, `full_variants`
3. **Inconsistent stock calculation** - Products have `stock` or `total_stock`, variants have `stock_available`
4. **Complex logic** - Have to detect product type and query correct table
5. **View doesn't calculate variant stock** - `all_products_unified` shows 0 for variant products

## Proposed Solution: Single Unified Table

### New Table: `products_unified`

```sql
CREATE TABLE products_unified (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category TEXT NOT NULL,
  sku TEXT,
  
  -- Images
  image TEXT,
  images JSONB,
  image_alt_texts JSONB,
  
  -- Product type configuration
  has_colors BOOLEAN DEFAULT false,
  has_sizes BOOLEAN DEFAULT false,
  
  -- Variant data (stored as JSONB arrays)
  colors JSONB,  -- Array of {name, value} objects
  sizes JSONB,   -- Array of size strings
  
  -- Variants (stored as JSONB array)
  variants JSONB DEFAULT '[]',  -- Array of variant objects
  
  -- Options flags
  is_new BOOLEAN DEFAULT false,
  on_sale BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  
  -- SEO fields
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  seo_slug TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Variant Structure

Each product's `variants` JSONB array contains objects like:

```json
[
  {
    "id": "variant-uuid",
    "colorName": "White",
    "colorValue": "#ffffff",
    "size": null,  // or "M", "L", etc.
    "stockAvailable": 47,
    "stockIncoming": 0,
    "stockReserved": 0,
    "priceOverride": null,
    "isActive": true,
    "sortIndex": 1
  }
]
```

### Stock Calculation

Total stock = SUM of all variants' `stockAvailable` in the variants array.

## Benefits

1. **Single source of truth** - All products in one table
2. **Simple queries** - No need to detect product type
3. **Direct stock calculation** - Just sum variant stock from JSON array
4. **Easier updates** - Just update the JSON array
5. **No complex joins** - Everything in one row

## Migration Strategy

1. Create new `products_unified` table
2. Migrate existing products from all tables to new table
3. Calculate variant stock and store in variants array
4. Update all API routes to use new table
5. Test thoroughly
6. Drop old tables when confirmed working

Would you like me to proceed with implementing this simplified system?


# How to Run the SQL Migration

## Step-by-Step Instructions

### Option 1: Run All at Once (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Click on "SQL Editor" in the left sidebar

2. **Open the SQL File**
   - Open `supabase-seo-slug-migration-simple.sql` in your code editor
   - Copy the **entire contents** (all sections)

3. **Paste and Run**
   - Paste into the Supabase SQL Editor
   - Click "Run" or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
   - Wait for success message

### Option 2: Run Section by Section (If You Get Errors)

If you encounter errors, run each section separately:

#### Section 1: Add Columns
```sql
-- Copy and paste ONLY this section first
ALTER TABLE public.simple_products
  ADD COLUMN IF NOT EXISTS seo_slug VARCHAR(255);

ALTER TABLE public.color_only_products
  ADD COLUMN IF NOT EXISTS seo_slug VARCHAR(255);

ALTER TABLE public.size_only_products
  ADD COLUMN IF NOT EXISTS seo_slug VARCHAR(255);

ALTER TABLE public.full_variant_products
  ADD COLUMN IF NOT EXISTS seo_slug VARCHAR(255);
```

#### Section 2: Create Indexes
```sql
-- Run this section second
CREATE INDEX IF NOT EXISTS idx_simple_products_slug ON public.simple_products(seo_slug) WHERE seo_slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_simple_products_slug_unique ON public.simple_products(seo_slug) WHERE seo_slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_color_only_products_slug ON public.color_only_products(seo_slug) WHERE seo_slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_color_only_products_slug_unique ON public.color_only_products(seo_slug) WHERE seo_slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_size_only_products_slug ON public.size_only_products(seo_slug) WHERE seo_slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_size_only_products_slug_unique ON public.size_only_products(seo_slug) WHERE seo_slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_full_variant_products_slug ON public.full_variant_products(seo_slug) WHERE seo_slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_full_variant_products_slug_unique ON public.full_variant_products(seo_slug) WHERE seo_slug IS NOT NULL;
```

#### Section 3: Create Function
```sql
-- Run this section third
CREATE OR REPLACE FUNCTION generate_seo_slug(product_name TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
BEGIN
  slug := LOWER(product_name);
  slug := REGEXP_REPLACE(slug, '[^a-z0-9\s-]', '', 'g');
  slug := REGEXP_REPLACE(slug, '[\s-]+', '-', 'g');
  slug := TRIM(BOTH '-' FROM slug);
  IF LENGTH(slug) > 200 THEN
    slug := LEFT(slug, 200);
    slug := TRIM(BOTH '-' FROM slug);
  END IF;
  RETURN slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

#### Section 4: Update View
```sql
-- Run this section last (copy the entire view creation from the file)
-- This is the longest section - make sure to copy it completely
```

## Troubleshooting

### Error: "syntax error at or near '{'"
**Cause:** You accidentally copied TypeScript/JavaScript code instead of SQL.

**Solution:**
- Make sure you're copying from `supabase-seo-slug-migration-simple.sql`
- Do NOT copy from `app/sitemap.ts` or any `.ts` files
- Only copy SQL code (starts with `--` comments or `ALTER TABLE`, `CREATE`, etc.)

### Error: "relation does not exist"
**Cause:** Table name might be different in your database.

**Solution:**
- Check your actual table names in Supabase
- They might be named differently (e.g., `products` instead of `simple_products`)
- Adjust the SQL to match your actual table names

### Error: "column already exists"
**Cause:** The column was already added in a previous run.

**Solution:**
- This is fine! The `IF NOT EXISTS` clause should prevent errors
- You can safely ignore this or continue to the next section

### Error: "permission denied"
**Cause:** You don't have permission to modify the database.

**Solution:**
- Make sure you're using the SQL Editor (not a read-only connection)
- Check that you're logged in as the project owner or have admin permissions

## Verify It Worked

After running the migration, verify it worked:

```sql
-- Check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'simple_products' 
AND column_name = 'seo_slug';

-- Check if function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'generate_seo_slug';

-- Check if view includes slug
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'all_products_unified' 
AND column_name = 'seo_slug';
```

All three queries should return results if the migration was successful.

## Next Steps

After the migration is complete:

1. **Generate slugs for existing products** - This will be done via your admin panel or API
2. **Test the slug system** - Create a new product and verify the slug is generated
3. **Update product URLs** - Products will now be accessible via `/products/[slug]` instead of `/products/[uuid]`


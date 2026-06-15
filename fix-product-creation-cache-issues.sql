-- COMPREHENSIVE PRODUCT CREATION & CACHE FIX
-- This script fixes all identified issues with product creation and caching
-- Run this in Supabase SQL Editor

-- =====================================================
-- STEP 1: SYNC STOCK COLUMNS (CRITICAL FIX)
-- =====================================================

-- Copy stock_quantity values to stock column for existing products
-- This fixes the main issue where stock=0 but stock_quantity=5
UPDATE products 
SET stock = COALESCE(stock_quantity, 0) 
WHERE stock = 0 AND stock_quantity > 0;

-- Add a trigger to keep stock and stock_quantity in sync
CREATE OR REPLACE FUNCTION sync_stock_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- When stock_quantity is updated, sync to stock
  IF TG_OP = 'UPDATE' AND OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity THEN
    NEW.stock = NEW.stock_quantity;
  END IF;
  
  -- When stock is updated, sync to stock_quantity
  IF TG_OP = 'UPDATE' AND OLD.stock IS DISTINCT FROM NEW.stock THEN
    NEW.stock_quantity = NEW.stock;
  END IF;
  
  -- For new inserts, ensure both are set
  IF TG_OP = 'INSERT' THEN
    IF NEW.stock IS NULL AND NEW.stock_quantity IS NOT NULL THEN
      NEW.stock = NEW.stock_quantity;
    ELSIF NEW.stock_quantity IS NULL AND NEW.stock IS NOT NULL THEN
      NEW.stock_quantity = NEW.stock;
    ELSIF NEW.stock IS NULL AND NEW.stock_quantity IS NULL THEN
      NEW.stock = 0;
      NEW.stock_quantity = 0;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to keep stock columns in sync
DROP TRIGGER IF EXISTS sync_stock_trigger ON products;
CREATE TRIGGER sync_stock_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION sync_stock_columns();

-- =====================================================
-- STEP 2: ENSURE ALL REQUIRED COLUMNS EXIST
-- =====================================================

DO $$
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock') THEN
    ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;
    RAISE NOTICE 'Added stock column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image') THEN
    ALTER TABLE products ADD COLUMN image TEXT;
    RAISE NOTICE 'Added image column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'images') THEN
    ALTER TABLE products ADD COLUMN images TEXT;
    RAISE NOTICE 'Added images column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'has_color_options') THEN
    ALTER TABLE products ADD COLUMN has_color_options BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added has_color_options column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'has_size_options') THEN
    ALTER TABLE products ADD COLUMN has_size_options BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added has_size_options column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'on_sale') THEN
    ALTER TABLE products ADD COLUMN on_sale BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added on_sale column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_new') THEN
    ALTER TABLE products ADD COLUMN is_new BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added is_new column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'original_price') THEN
    ALTER TABLE products ADD COLUMN original_price DECIMAL(10,2);
    RAISE NOTICE 'Added original_price column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'colors') THEN
    ALTER TABLE products ADD COLUMN colors TEXT;
    RAISE NOTICE 'Added colors column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'details') THEN
    ALTER TABLE products ADD COLUMN details TEXT;
    RAISE NOTICE 'Added details column';
  END IF;

  -- SEO columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'seo_title') THEN
    ALTER TABLE products ADD COLUMN seo_title TEXT;
    RAISE NOTICE 'Added seo_title column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'seo_description') THEN
    ALTER TABLE products ADD COLUMN seo_description TEXT;
    RAISE NOTICE 'Added seo_description column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'seo_keywords') THEN
    ALTER TABLE products ADD COLUMN seo_keywords TEXT;
    RAISE NOTICE 'Added seo_keywords column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'seo_slug') THEN
    ALTER TABLE products ADD COLUMN seo_slug TEXT;
    RAISE NOTICE 'Added seo_slug column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_alt_texts') THEN
    ALTER TABLE products ADD COLUMN image_alt_texts TEXT;
    RAISE NOTICE 'Added image_alt_texts column';
  END IF;

  RAISE NOTICE 'All required columns verified/added';
END $$;

-- =====================================================
-- STEP 3: CREATE PRODUCT_VARIANTS TABLE IF MISSING
-- =====================================================

CREATE TABLE IF NOT EXISTS product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_name VARCHAR(100),
  color_value VARCHAR(100),
  size VARCHAR(50),
  sku VARCHAR(100),
  price_override DECIMAL(10,2),
  stock_available INTEGER DEFAULT 0,
  stock_incoming INTEGER DEFAULT 0,
  stock_reserved INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);

-- =====================================================
-- STEP 4: SET UP ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on both tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Create policies for products table
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Products allow all for authenticated" ON products;
  DROP POLICY IF EXISTS "Products allow all for anon" ON products;
  
  -- Create new policies
  CREATE POLICY "Products allow all for authenticated" ON products
    FOR ALL USING (auth.role() = 'authenticated') 
    WITH CHECK (auth.role() = 'authenticated');
    
  CREATE POLICY "Products allow all for anon" ON products
    FOR ALL USING (auth.role() = 'anon') 
    WITH CHECK (auth.role() = 'anon');
END $$;

-- Create policies for product_variants table
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Variants allow all for authenticated" ON product_variants;
  DROP POLICY IF EXISTS "Variants allow all for anon" ON product_variants;
  
  -- Create new policies
  CREATE POLICY "Variants allow all for authenticated" ON product_variants
    FOR ALL USING (auth.role() = 'authenticated') 
    WITH CHECK (auth.role() = 'authenticated');
    
  CREATE POLICY "Variants allow all for anon" ON product_variants
    FOR ALL USING (auth.role() = 'anon') 
    WITH CHECK (auth.role() = 'anon');
END $$;

-- =====================================================
-- STEP 5: GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated and anon roles
GRANT ALL PRIVILEGES ON TABLE products TO authenticated;
GRANT ALL PRIVILEGES ON TABLE products TO anon;
GRANT ALL PRIVILEGES ON TABLE product_variants TO authenticated;
GRANT ALL PRIVILEGES ON TABLE product_variants TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- =====================================================
-- STEP 6: CREATE UPDATE TRIGGERS
-- =====================================================

-- Create or replace the update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for both tables
DO $$
BEGIN
  -- Drop existing triggers if they exist
  DROP TRIGGER IF EXISTS update_products_updated_at ON products;
  DROP TRIGGER IF EXISTS update_product_variants_updated_at ON product_variants;
  
  -- Create new triggers
  CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
  CREATE TRIGGER update_product_variants_updated_at
    BEFORE UPDATE ON product_variants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END $$;

-- =====================================================
-- STEP 7: VERIFY FIX
-- =====================================================

-- Check that stock columns are now in sync
SELECT 
  id,
  name,
  stock,
  stock_quantity,
  CASE 
    WHEN stock = stock_quantity THEN 'SYNCED ✓'
    ELSE 'MISMATCH ✗'
  END as sync_status
FROM products 
LIMIT 5;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'PRODUCT CREATION & CACHE FIX COMPLETED!';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Fixed issues:';
  RAISE NOTICE '✓ Synced stock and stock_quantity columns';
  RAISE NOTICE '✓ Added automatic sync trigger';
  RAISE NOTICE '✓ Ensured all required columns exist';
  RAISE NOTICE '✓ Created product_variants table';
  RAISE NOTICE '✓ Set up proper RLS policies';
  RAISE NOTICE '✓ Granted necessary permissions';
  RAISE NOTICE '✓ Added update triggers';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Update your API endpoints (see fix files)';
  RAISE NOTICE '2. Add proper cache invalidation';
  RAISE NOTICE '3. Test product creation';
  RAISE NOTICE '=====================================================';
END $$;


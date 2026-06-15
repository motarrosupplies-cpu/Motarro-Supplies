-- Complete Fix for Product Creation Issues
-- This script addresses the 500 error in /api/products endpoint
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. ADD MISSING REQUIRED COLUMNS TO PRODUCTS TABLE
-- =====================================================

DO $$
BEGIN
  -- Add stock column (main issue causing 500 error)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock') THEN
    ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;
    RAISE NOTICE 'Added stock column to products table';
  END IF;

  -- Add image column (required by API)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image') THEN
    ALTER TABLE products ADD COLUMN image TEXT;
    RAISE NOTICE 'Added image column to products table';
  END IF;

  -- Add images column (for multiple images)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'images') THEN
    ALTER TABLE products ADD COLUMN images TEXT; -- JSON stringified by app
    RAISE NOTICE 'Added images column to products table';
  END IF;

  -- Add original_price column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'original_price') THEN
    ALTER TABLE products ADD COLUMN original_price DECIMAL(10,2);
    RAISE NOTICE 'Added original_price column to products table';
  END IF;

  -- Add has_color_options column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'has_color_options') THEN
    ALTER TABLE products ADD COLUMN has_color_options BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added has_color_options column to products table';
  END IF;

  -- Add has_size_options column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'has_size_options') THEN
    ALTER TABLE products ADD COLUMN has_size_options BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added has_size_options column to products table';
  END IF;

  -- Add on_sale column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'on_sale') THEN
    ALTER TABLE products ADD COLUMN on_sale BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added on_sale column to products table';
  END IF;

  -- Add is_new column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_new') THEN
    ALTER TABLE products ADD COLUMN is_new BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added is_new column to products table';
  END IF;

  -- Add colors column (for color options)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'colors') THEN
    ALTER TABLE products ADD COLUMN colors TEXT; -- JSON stringified by app
    RAISE NOTICE 'Added colors column to products table';
  END IF;

  -- Add details column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'details') THEN
    ALTER TABLE products ADD COLUMN details TEXT; -- JSON stringified by app
    RAISE NOTICE 'Added details column to products table';
  END IF;

  -- Add SEO columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'seo_title') THEN
    ALTER TABLE products ADD COLUMN seo_title TEXT;
    RAISE NOTICE 'Added seo_title column to products table';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'seo_description') THEN
    ALTER TABLE products ADD COLUMN seo_description TEXT;
    RAISE NOTICE 'Added seo_description column to products table';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'seo_keywords') THEN
    ALTER TABLE products ADD COLUMN seo_keywords TEXT;
    RAISE NOTICE 'Added seo_keywords column to products table';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'seo_slug') THEN
    ALTER TABLE products ADD COLUMN seo_slug TEXT;
    RAISE NOTICE 'Added seo_slug column to products table';
  END IF;

  -- Add image_alt_texts column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_alt_texts') THEN
    ALTER TABLE products ADD COLUMN image_alt_texts TEXT; -- JSON stringified by app
    RAISE NOTICE 'Added image_alt_texts column to products table';
  END IF;

  -- Add timestamps if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'created_at') THEN
    ALTER TABLE products ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE 'Added created_at column to products table';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'updated_at') THEN
    ALTER TABLE products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE 'Added updated_at column to products table';
  END IF;

  RAISE NOTICE 'All required columns added successfully';
END $$;

-- =====================================================
-- 2. CREATE PRODUCT_VARIANTS TABLE IF MISSING
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
-- 3. SET UP ROW LEVEL SECURITY (RLS)
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
-- 4. GRANT NECESSARY PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated and anon roles
GRANT ALL PRIVILEGES ON TABLE products TO authenticated;
GRANT ALL PRIVILEGES ON TABLE products TO anon;
GRANT ALL PRIVILEGES ON TABLE product_variants TO authenticated;
GRANT ALL PRIVILEGES ON TABLE product_variants TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- =====================================================
-- 5. CREATE UPDATE TRIGGERS
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
-- 6. SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'PRODUCT CREATION FIX COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Fixed issues:';
  RAISE NOTICE '- Added missing stock column (main 500 error cause)';
  RAISE NOTICE '- Added all required API columns';
  RAISE NOTICE '- Created product_variants table';
  RAISE NOTICE '- Set up proper RLS policies';
  RAISE NOTICE '- Granted necessary permissions';
  RAISE NOTICE '- Added update triggers';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Product creation should now work correctly!';
  RAISE NOTICE 'Both regular products and Custom Printing products';
  RAISE NOTICE 'should be able to be created successfully.';
  RAISE NOTICE '=====================================================';
END $$;

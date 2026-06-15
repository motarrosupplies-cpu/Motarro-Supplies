-- Minimal Safe Fix for Products API
-- Only adds missing columns and table - NO destructive operations

-- =====================================================
-- ADD ONLY THE MISSING STOCK COLUMN (Main Issue)
-- =====================================================

-- Add the stock column that's causing the 500 error
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock') THEN
    ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;
    RAISE NOTICE 'Added stock column to products table';
  ELSE
    RAISE NOTICE 'stock column already exists';
  END IF;
END $$;

-- =====================================================
-- CREATE PRODUCT_VARIANTS TABLE (Only if missing)
-- =====================================================

-- Create the product_variants table if it doesn't exist
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

-- =====================================================
-- ADD ONLY ESSENTIAL COLUMNS (No destructive operations)
-- =====================================================

DO $$ 
BEGIN
  -- Only add columns that don't exist
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
  
  RAISE NOTICE 'All required columns added successfully';
END $$;

-- =====================================================
-- DISABLE RLS ON NEW TABLE ONLY
-- =====================================================

-- Disable RLS only on the new product_variants table
ALTER TABLE product_variants DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'SAFE FIX COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Added only missing columns and table';
  RAISE NOTICE 'No destructive operations performed';
  RAISE NOTICE 'Products API should now work correctly';
  RAISE NOTICE '=====================================================';
END $$; 
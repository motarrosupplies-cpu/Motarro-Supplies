-- Apparely Enhanced Menu Management Schema (Safe Version)
-- This schema creates missing tables without destroying existing data
-- Run this to resolve the "relation does not exist" errors

-- =====================================================
-- ENHANCED MENU ITEMS TABLE
-- =====================================================

-- Create menu_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label VARCHAR(255) NOT NULL,
  href VARCHAR(500), -- Can be NULL for header/category items
  parent_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 0, -- 0 = root, 1 = primary, 2 = secondary, etc.
  is_active BOOLEAN DEFAULT true,
  is_header BOOLEAN DEFAULT false, -- True for category headers, false for actual pages
  icon VARCHAR(100), -- Optional icon class or name
  description TEXT, -- Optional description
  meta_title VARCHAR(255), -- SEO meta title
  meta_description TEXT, -- SEO meta description
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PRODUCT CATEGORIES TABLE (Enhanced)
-- =====================================================

-- Create product_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES product_categories(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  image_url TEXT, -- Category image
  meta_title VARCHAR(255),
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MENU-CATEGORY MAPPING TABLE
-- =====================================================

-- Create mapping table to link menu items with product categories
CREATE TABLE IF NOT EXISTS menu_category_mapping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(menu_item_id, category_id)
);

-- =====================================================
-- ENHANCED PRODUCTS TABLE
-- =====================================================

-- Create enhanced products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL, -- Link to menu structure
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_new BOOLEAN DEFAULT false,
  is_on_sale BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'out_of_stock')),
  has_variants BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SAFE COLUMN ADDITIONS TO EXISTING TABLES
-- =====================================================

-- Safely add missing columns to existing products table
DO $$ 
BEGIN
  -- Add category_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category_id') THEN
    ALTER TABLE products ADD COLUMN category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL;
  END IF;
  
  -- Add menu_item_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'menu_item_id') THEN
    ALTER TABLE products ADD COLUMN menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL;
  END IF;
  
  -- Add slug column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'slug') THEN
    ALTER TABLE products ADD COLUMN slug VARCHAR(255);
    -- Create unique index for slug if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'products' AND indexname = 'products_slug_key') THEN
      ALTER TABLE products ADD CONSTRAINT products_slug_key UNIQUE (slug);
    END IF;
  END IF;
  
  -- Add stock_quantity column if it doesn't exist (rename from stock if needed)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock_quantity') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock') THEN
      -- Rename existing stock column to stock_quantity
      ALTER TABLE products RENAME COLUMN stock TO stock_quantity;
    ELSE
      ALTER TABLE products ADD COLUMN stock_quantity INTEGER DEFAULT 0;
    END IF;
  END IF;
  
  -- Add has_variants column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'has_variants') THEN
    ALTER TABLE products ADD COLUMN has_variants BOOLEAN DEFAULT false;
  END IF;
  
  -- Add status column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'status') THEN
    ALTER TABLE products ADD COLUMN status VARCHAR(50) DEFAULT 'active';
    -- Add check constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_status_check') THEN
      ALTER TABLE products ADD CONSTRAINT products_status_check CHECK (status IN ('active', 'disabled', 'out_of_stock'));
    END IF;
  END IF;
  
  -- Add created_at and updated_at columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'created_at') THEN
    ALTER TABLE products ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'updated_at') THEN
    ALTER TABLE products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- =====================================================
-- INDEXES FOR PERFORMANCE (Safe to create)
-- =====================================================

-- Menu items indexes (only create if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_menu_items_parent_id') THEN
    CREATE INDEX idx_menu_items_parent_id ON menu_items(parent_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_menu_items_level') THEN
    CREATE INDEX idx_menu_items_level ON menu_items(level);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_menu_items_order') THEN
    CREATE INDEX idx_menu_items_order ON menu_items(order_index);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_menu_items_active') THEN
    CREATE INDEX idx_menu_items_active ON menu_items(is_active);
  END IF;
END $$;

-- Product categories indexes
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_product_categories_parent_id') THEN
    CREATE INDEX idx_product_categories_parent_id ON product_categories(parent_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_product_categories_slug') THEN
    CREATE INDEX idx_product_categories_slug ON product_categories(slug);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_product_categories_level') THEN
    CREATE INDEX idx_product_categories_level ON product_categories(level);
  END IF;
END $$;

-- Products indexes (only create if columns exist)
DO $$ 
BEGIN
  -- Only create category_id index if the column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category_id') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_category_id') THEN
      CREATE INDEX idx_products_category_id ON products(category_id);
    END IF;
  END IF;
  
  -- Only create menu_item_id index if the column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'menu_item_id') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_menu_item_id') THEN
      CREATE INDEX idx_products_menu_item_id ON products(menu_item_id);
    END IF;
  END IF;
  
  -- Only create slug index if the column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'slug') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_slug') THEN
      CREATE INDEX idx_products_slug ON products(slug);
    END IF;
  END IF;
  
  -- Only create status index if the column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'status') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_status') THEN
      CREATE INDEX idx_products_status ON products(status);
    END IF;
  END IF;
END $$;

-- Menu-category mapping indexes
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_menu_category_mapping_menu_id') THEN
    CREATE INDEX idx_menu_category_mapping_menu_id ON menu_category_mapping(menu_item_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_menu_category_mapping_category_id') THEN
    CREATE INDEX idx_menu_category_mapping_category_id ON menu_category_mapping(category_id);
  END IF;
END $$;

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_menu_items_updated_at') THEN
    CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_product_categories_updated_at') THEN
    CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON product_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- Only create products trigger if updated_at column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'updated_at') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at') THEN
      CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
  END IF;
END $$;

-- =====================================================
-- SAMPLE DATA INSERTION (Only if tables are empty)
-- =====================================================

-- Insert sample product categories only if none exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM product_categories LIMIT 1) THEN
    -- Insert sample product categories
    INSERT INTO product_categories (name, slug, description, level, order_index) VALUES
    ('Men', 'men', 'Men''s clothing and accessories', 0, 1),
    ('Women', 'women', 'Women''s clothing and accessories', 0, 2),
    ('Accessories', 'accessories', 'General accessories and add-ons', 0, 3),
    ('Custom Printing', 'custom-printing', 'Custom printed products and services', 0, 4),
    ('Unisex', 'unisex', 'Unisex clothing and accessories', 0, 5);

    -- Insert subcategories for Men
    INSERT INTO product_categories (name, slug, description, parent_id, level, order_index) VALUES
    ('T-shirts', 'mens-tshirts', 'Men''s t-shirts', (SELECT id FROM product_categories WHERE slug = 'men'), 1, 1),
    ('Hoodies', 'mens-hoodies', 'Men''s hoodies and sweatshirts', (SELECT id FROM product_categories WHERE slug = 'men'), 1, 2),
    ('Pants', 'mens-pants', 'Men''s pants and trousers', (SELECT id FROM product_categories WHERE slug = 'men'), 1, 3);

    -- Insert subcategories for Women
    INSERT INTO product_categories (name, slug, description, parent_id, level, order_index) VALUES
    ('T-shirts', 'womens-tshirts', 'Women''s t-shirts', (SELECT id FROM product_categories WHERE slug = 'women'), 1, 1),
    ('Hoodies', 'womens-hoodies', 'Women''s hoodies and sweatshirts', (SELECT id FROM product_categories WHERE slug = 'women'), 1, 2),
    ('Dresses', 'womens-dresses', 'Women''s dresses', (SELECT id FROM product_categories WHERE slug = 'women'), 1, 3);

    -- Insert deeper subcategories (level 2)
    INSERT INTO product_categories (name, slug, description, parent_id, level, order_index) VALUES
    ('Father''s Day', 'mens-tshirts-fathers-day', 'Father''s Day themed t-shirts', (SELECT id FROM product_categories WHERE slug = 'mens-tshirts'), 2, 1),
    ('Anime', 'mens-hoodies-anime', 'Anime themed hoodies', (SELECT id FROM product_categories WHERE slug = 'mens-hoodies'), 2, 1),
    ('Gaming', 'mens-tshirts-gaming', 'Gaming themed t-shirts', (SELECT id FROM product_categories WHERE slug = 'mens-tshirts'), 2, 2);
  END IF;
END $$;

-- Insert sample menu items only if none exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM menu_items LIMIT 1) THEN
    -- Insert sample menu items (Primary navigation)
    INSERT INTO menu_items (label, href, level, order_index, is_header, is_active) VALUES
    ('All Products', '/products', 0, 1, false, true),
    ('Men', NULL, 0, 2, true, true),
    ('Women', NULL, 0, 3, true, true),
    ('Accessories', NULL, 0, 4, true, true),
    ('Custom Printing', '/custom-printing', 0, 5, false, true),
    ('Sale', '/sale', 0, 6, false, true);

    -- Insert submenu items for Men
    INSERT INTO menu_items (label, href, parent_id, level, order_index, is_header, is_active) VALUES
    ('T-shirts', '/men/tshirts', (SELECT id FROM menu_items WHERE label = 'Men'), 1, 1, false, true),
    ('Hoodies', '/men/hoodies', (SELECT id FROM menu_items WHERE label = 'Men'), 1, 2, false, true),
    ('Pants', '/men/pants', (SELECT id FROM menu_items WHERE label = 'Men'), 1, 3, false, true);

    -- Insert deeper submenu items
    INSERT INTO menu_items (label, href, parent_id, level, order_index, is_header, is_active) VALUES
    ('Father''s Day', '/men/tshirts/fathers-day', (SELECT id FROM menu_items WHERE label = 'T-shirts'), 2, 1, false, true),
    ('Anime', '/men/hoodies/anime', (SELECT id FROM menu_items WHERE label = 'Hoodies'), 2, 1, false, true),
    ('Gaming', '/men/tshirts/gaming', (SELECT id FROM menu_items WHERE label = 'T-shirts'), 2, 2, false, true);

    -- Insert submenu items for Women
    INSERT INTO menu_items (label, href, parent_id, level, order_index, is_header, is_active) VALUES
    ('T-shirts', '/women/tshirts', (SELECT id FROM menu_items WHERE label = 'Women'), 1, 1, false, true),
    ('Hoodies', '/women/hoodies', (SELECT id FROM menu_items WHERE label = 'Women'), 1, 2, false, true),
    ('Dresses', '/women/dresses', (SELECT id FROM menu_items WHERE label = 'Women'), 1, 3, false, true);
  END IF;
END $$;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_category_mapping ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (admin access) - only if they don't exist
DO $$
BEGIN
  -- Menu items policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'menu_items' AND policyname = 'Enable all access for authenticated users') THEN
    CREATE POLICY "Enable all access for authenticated users" ON menu_items FOR ALL USING (auth.role() = 'authenticated');
  END IF;
  
  -- Product categories policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_categories' AND policyname = 'Enable all access for authenticated users') THEN
    CREATE POLICY "Enable all access for authenticated users" ON product_categories FOR ALL USING (auth.role() = 'authenticated');
  END IF;
  
  -- Products policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Enable all access for authenticated users') THEN
    CREATE POLICY "Enable all access for authenticated users" ON products FOR ALL USING (auth.role() = 'authenticated');
  END IF;
  
  -- Menu-category mapping policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'menu_category_mapping' AND policyname = 'Enable all access for authenticated users') THEN
    CREATE POLICY "Enable all access for authenticated users" ON menu_category_mapping FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get menu tree with categories
CREATE OR REPLACE FUNCTION get_menu_tree_with_categories()
RETURNS TABLE (
  menu_id UUID,
  menu_label VARCHAR,
  menu_href VARCHAR,
  menu_level INTEGER,
  menu_order INTEGER,
  menu_is_header BOOLEAN,
  category_id UUID,
  category_name VARCHAR,
  category_slug VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mi.id as menu_id,
    mi.label as menu_label,
    mi.href as menu_href,
    mi.level as menu_level,
    mi.order_index as menu_order,
    mi.is_header as menu_is_header,
    pc.id as category_id,
    pc.name as category_name,
    pc.slug as category_slug
  FROM menu_items mi
  LEFT JOIN menu_category_mapping mcm ON mi.id = mcm.menu_item_id
  LEFT JOIN product_categories pc ON mcm.category_id = pc.id
  ORDER BY mi.level, mi.order_index;
END;
$$ LANGUAGE plpgsql;

-- Function to get category tree
CREATE OR REPLACE FUNCTION get_category_tree()
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  slug VARCHAR,
  level INTEGER,
  order_index INTEGER,
  parent_name VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.id,
    pc.name,
    pc.slug,
    pc.level,
    pc.order_index,
    parent.name as parent_name
  FROM product_categories pc
  LEFT JOIN product_categories parent ON pc.parent_id = parent.id
  ORDER BY pc.level, pc.order_index;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

-- This will show a success message when the script completes
DO $$
BEGIN
  RAISE NOTICE 'Schema setup completed successfully! All required tables have been created.';
  RAISE NOTICE 'You can now refresh your admin dashboard to see the menu management working.';
END $$; 
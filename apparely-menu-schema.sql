-- Apparely Enhanced Menu Management Schema
-- This schema provides comprehensive menu control with deep hierarchies
-- and seamless integration with the existing product system

-- =====================================================
-- ENHANCED MENU ITEMS TABLE
-- =====================================================

-- Drop existing table if it exists (for clean setup)
DROP TABLE IF EXISTS menu_items CASCADE;

-- Create enhanced menu_items table with better hierarchy support
CREATE TABLE menu_items (
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

-- Create product_categories table for better product organization
CREATE TABLE product_categories (
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
CREATE TABLE menu_category_mapping (
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
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Menu items indexes
CREATE INDEX idx_menu_items_parent_id ON menu_items(parent_id);
CREATE INDEX idx_menu_items_level ON menu_items(level);
CREATE INDEX idx_menu_items_order ON menu_items(order_index);
CREATE INDEX idx_menu_items_active ON menu_items(is_active);

-- Product categories indexes
CREATE INDEX idx_product_categories_parent_id ON product_categories(parent_id);
CREATE INDEX idx_product_categories_slug ON product_categories(slug);
CREATE INDEX idx_product_categories_level ON product_categories(level);

-- Products indexes
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_menu_item_id ON products(menu_item_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status ON products(status);

-- Menu-category mapping indexes
CREATE INDEX idx_menu_category_mapping_menu_id ON menu_category_mapping(menu_item_id);
CREATE INDEX idx_menu_category_mapping_category_id ON menu_category_mapping(category_id);

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

-- Apply triggers to all tables
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON product_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample product categories
INSERT INTO product_categories (name, slug, description, level, order_index) VALUES
('Men', 'men', 'Men\'s clothing and accessories', 0, 1),
('Women', 'women', 'Women\'s clothing and accessories', 0, 2),
('Accessories', 'accessories', 'General accessories and add-ons', 0, 3),
('Custom Printing', 'custom-printing', 'Custom printed products and services', 0, 4),
('Unisex', 'unisex', 'Unisex clothing and accessories', 0, 5);

-- Insert subcategories for Men
INSERT INTO product_categories (name, slug, description, parent_id, level, order_index) VALUES
('T-shirts', 'mens-tshirts', 'Men\'s t-shirts', (SELECT id FROM product_categories WHERE slug = 'men'), 1, 1),
('Hoodies', 'mens-hoodies', 'Men\'s hoodies and sweatshirts', (SELECT id FROM product_categories WHERE slug = 'men'), 1, 2),
('Pants', 'mens-pants', 'Men\'s pants and trousers', (SELECT id FROM product_categories WHERE slug = 'men'), 1, 3);

-- Insert subcategories for Women
INSERT INTO product_categories (name, slug, description, parent_id, level, order_index) VALUES
('T-shirts', 'womens-tshirts', 'Women\'s t-shirts', (SELECT id FROM product_categories WHERE slug = 'women'), 1, 1),
('Hoodies', 'womens-hoodies', 'Women\'s hoodies and sweatshirts', (SELECT id FROM product_categories WHERE slug = 'women'), 1, 2),
('Dresses', 'womens-dresses', 'Women\'s dresses', (SELECT id FROM product_categories WHERE slug = 'women'), 1, 3);

-- Insert deeper subcategories (level 2)
INSERT INTO product_categories (name, slug, description, parent_id, level, order_index) VALUES
('Father\'s Day', 'mens-tshirts-fathers-day', 'Father\'s Day themed t-shirts', (SELECT id FROM product_categories WHERE slug = 'mens-tshirts'), 2, 1),
('Anime', 'mens-hoodies-anime', 'Anime themed hoodies', (SELECT id FROM product_categories WHERE slug = 'mens-hoodies'), 2, 1),
('Gaming', 'mens-tshirts-gaming', 'Gaming themed t-shirts', (SELECT id FROM product_categories WHERE slug = 'mens-tshirts'), 2, 2);

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
('Father\'s Day', '/men/tshirts/fathers-day', (SELECT id FROM menu_items WHERE label = 'T-shirts'), 2, 1, false, true),
('Anime', '/men/hoodies/anime', (SELECT id FROM menu_items WHERE label = 'Hoodies'), 2, 1, false, true),
('Gaming', '/men/tshirts/gaming', (SELECT id FROM menu_items WHERE label = 'T-shirts'), 2, 2, false, true);

-- Insert submenu items for Women
INSERT INTO menu_items (label, href, parent_id, level, order_index, is_header, is_active) VALUES
('T-shirts', '/women/tshirts', (SELECT id FROM menu_items WHERE label = 'Women'), 1, 1, false, true),
('Hoodies', '/women/hoodies', (SELECT id FROM menu_items WHERE label = 'Women'), 1, 2, false, true),
('Dresses', '/women/dresses', (SELECT id FROM menu_items WHERE label = 'Women'), 1, 3, false, true);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_category_mapping ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (admin access)
CREATE POLICY "Enable all access for authenticated users" ON menu_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON product_categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON menu_category_mapping FOR ALL USING (auth.role() = 'authenticated');

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
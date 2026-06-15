-- ============================================================================
-- Fix Product Stock Triggers
-- This script creates triggers to automatically update total_stock when
-- variants are inserted, updated, or deleted
-- ============================================================================

-- Function to update total_stock for color_only_products
CREATE OR REPLACE FUNCTION update_color_only_total_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE color_only_products
  SET total_stock = COALESCE(
    (SELECT SUM(stock_available)
     FROM color_variants
     WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
       AND is_active = true),
    0
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update total_stock for size_only_products
CREATE OR REPLACE FUNCTION update_size_only_total_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE size_only_products
  SET total_stock = COALESCE(
    (SELECT SUM(stock_available)
     FROM size_variants
     WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
       AND is_active = true),
    0
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update total_stock for full_variant_products
CREATE OR REPLACE FUNCTION update_full_variant_total_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE full_variant_products
  SET total_stock = COALESCE(
    (SELECT SUM(stock_available)
     FROM full_variants
     WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
       AND is_active = true),
    0
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_update_color_only_total_stock ON color_variants;
DROP TRIGGER IF EXISTS trigger_update_size_only_total_stock ON size_variants;
DROP TRIGGER IF EXISTS trigger_update_full_variant_total_stock ON full_variants;

-- Create triggers for color_variants
CREATE TRIGGER trigger_update_color_only_total_stock
  AFTER INSERT OR UPDATE OR DELETE ON color_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_color_only_total_stock();

-- Create triggers for size_variants
CREATE TRIGGER trigger_update_size_only_total_stock
  AFTER INSERT OR UPDATE OR DELETE ON size_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_size_only_total_stock();

-- Create triggers for full_variants
CREATE TRIGGER trigger_update_full_variant_total_stock
  AFTER INSERT OR UPDATE OR DELETE ON full_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_full_variant_total_stock();

-- Recalculate total_stock for all existing variant products
UPDATE color_only_products
SET total_stock = COALESCE(
  (SELECT SUM(stock_available)
   FROM color_variants
   WHERE color_variants.product_id = color_only_products.id
     AND color_variants.is_active = true),
  0
);

UPDATE size_only_products
SET total_stock = COALESCE(
  (SELECT SUM(stock_available)
   FROM size_variants
   WHERE size_variants.product_id = size_only_products.id
     AND size_variants.is_active = true),
  0
);

UPDATE full_variant_products
SET total_stock = COALESCE(
  (SELECT SUM(stock_available)
   FROM full_variants
   WHERE full_variants.product_id = full_variant_products.id
     AND full_variants.is_active = true),
  0
);

-- Fix script for Ready-to-Ship Products Schema
-- Run this if you get "column created_at does not exist" error

-- Add missing timestamp columns if they don't exist
DO $$ 
BEGIN
  -- Add created_at if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ready_to_ship_products' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE ready_to_ship_products 
    ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Add updated_at if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ready_to_ship_products' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE ready_to_ship_products 
    ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Add missing columns to bundles table if needed
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ready_to_ship_bundles' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE ready_to_ship_bundles 
    ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ready_to_ship_bundles' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE ready_to_ship_bundles 
    ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Add missing columns to flash_sales table if needed
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'flash_sales' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE flash_sales 
    ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'flash_sales' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE flash_sales 
    ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Recreate the view (this will fix any view issues)
DROP VIEW IF EXISTS ready_to_ship_products_view;

CREATE OR REPLACE VIEW ready_to_ship_products_view AS
SELECT 
  p.*,
  CASE 
    WHEN p.flash_sale_price IS NOT NULL AND p.flash_sale_ends_at > NOW() THEN p.flash_sale_price
    WHEN p.sale_price IS NOT NULL AND p.is_on_sale THEN p.sale_price
    ELSE p.base_price
  END AS current_price,
  CASE 
    WHEN p.flash_sale_price IS NOT NULL AND p.flash_sale_ends_at > NOW() THEN true
    ELSE false
  END AS is_flash_sale,
  CASE
    WHEN p.stock_quantity <= 0 AND NOT p.allow_backorder THEN 'out_of_stock'
    WHEN p.stock_quantity <= p.low_stock_threshold THEN 'low_stock'
    ELSE 'in_stock'
  END AS stock_status
FROM ready_to_ship_products p
WHERE p.status = 'active';

-- Ensure triggers exist
CREATE TRIGGER update_ready_to_ship_products_updated_at
  BEFORE UPDATE ON ready_to_ship_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ready_to_ship_bundles_updated_at
  BEFORE UPDATE ON ready_to_ship_bundles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flash_sales_updated_at
  BEFORE UPDATE ON flash_sales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


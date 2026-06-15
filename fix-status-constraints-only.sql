-- Fix Status Constraints Only
-- Run this script to update existing constraints to allow 'disabled' status

-- Drop existing constraints
ALTER TABLE simple_products DROP CONSTRAINT IF EXISTS simple_products_status_check;
ALTER TABLE color_only_products DROP CONSTRAINT IF EXISTS color_only_products_status_check;
ALTER TABLE size_only_products DROP CONSTRAINT IF EXISTS size_only_products_status_check;
ALTER TABLE full_variant_products DROP CONSTRAINT IF EXISTS full_variant_products_status_check;

-- Add new constraints that include 'disabled'
ALTER TABLE simple_products ADD CONSTRAINT simple_products_status_check CHECK (status IN ('active', 'inactive', 'draft', 'disabled'));
ALTER TABLE color_only_products ADD CONSTRAINT color_only_products_status_check CHECK (status IN ('active', 'inactive', 'draft', 'disabled'));
ALTER TABLE size_only_products ADD CONSTRAINT size_only_products_status_check CHECK (status IN ('active', 'inactive', 'draft', 'disabled'));
ALTER TABLE full_variant_products ADD CONSTRAINT full_variant_products_status_check CHECK (status IN ('active', 'inactive', 'draft', 'disabled'));

-- Verify the constraints were updated
SELECT 
    tc.table_name, 
    cc.constraint_name, 
    cc.check_clause 
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type = 'CHECK' 
  AND tc.constraint_name LIKE '%status_check%' 
ORDER BY tc.table_name;

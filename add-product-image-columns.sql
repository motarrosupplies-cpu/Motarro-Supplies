-- Add missing product_image and product_id columns to existing tables
-- Run this in your Supabase SQL Editor

-- Add columns to invoice_items table
ALTER TABLE invoice_items 
ADD COLUMN IF NOT EXISTS product_image TEXT,
ADD COLUMN IF NOT EXISTS product_id TEXT;

-- Add columns to quotation_items table  
ALTER TABLE quotation_items 
ADD COLUMN IF NOT EXISTS product_image TEXT,
ADD COLUMN IF NOT EXISTS product_id TEXT;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'invoice_items' 
ORDER BY ordinal_position;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'quotation_items' 
ORDER BY ordinal_position; 
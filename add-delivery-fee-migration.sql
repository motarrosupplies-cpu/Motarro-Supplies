-- Migration: Add delivery_fee column to invoices and quotations tables
-- Run this in your Supabase SQL editor

-- Add delivery_fee column to invoices table
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10,2) DEFAULT NULL;

-- Add delivery_fee column to quotations table
ALTER TABLE quotations 
ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10,2) DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN invoices.delivery_fee IS 'Delivery fee (VAT-inclusive) added to invoice total';
COMMENT ON COLUMN quotations.delivery_fee IS 'Delivery fee (VAT-inclusive) added to quotation total';


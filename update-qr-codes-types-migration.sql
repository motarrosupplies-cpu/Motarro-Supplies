-- Update QR codes table to support all new types
-- Run this migration in Supabase SQL Editor

-- Drop the old check constraint
ALTER TABLE qr_codes DROP CONSTRAINT IF EXISTS qr_codes_type_check;

-- Add new check constraint with all supported types
ALTER TABLE qr_codes ADD CONSTRAINT qr_codes_type_check 
  CHECK (type IN (
    'url', 'text', 'email', 'call', 'sms', 'vcard', 'whatsapp', 
    'wifi', 'pdf', 'app', 'images', 'video', 'social', 'event', 
    'barcode', 'discount'
  ));


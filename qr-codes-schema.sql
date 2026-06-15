-- QR Code Generator System - Database Schema
-- Run this migration in Supabase SQL Editor

-- Create qr_codes table
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('url', 'discount', 'email', 'text', 'whatsapp')),
  content TEXT NOT NULL, -- For URL: the destination URL, For discount: the discount code/JSON
  short_url TEXT UNIQUE NOT NULL, -- Short URL slug (e.g., 'abc123')
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deactivated')),
  design_config JSONB DEFAULT '{}'::jsonb, -- Stores customization options
  scan_count INTEGER DEFAULT 0,
  created_by UUID, -- Admin user ID (references auth.users)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ -- Optional expiration date
);

-- Create qr_code_scans table for analytics
CREATE TABLE IF NOT EXISTS qr_code_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'desktop', 'tablet', 'unknown')),
  country TEXT,
  city TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_qr_codes_short_url ON qr_codes(short_url);
CREATE INDEX IF NOT EXISTS idx_qr_codes_status ON qr_codes(status);
CREATE INDEX IF NOT EXISTS idx_qr_codes_created_at ON qr_codes(created_at);
CREATE INDEX IF NOT EXISTS idx_qr_codes_type ON qr_codes(type);
CREATE INDEX IF NOT EXISTS idx_qr_code_scans_qr_code_id ON qr_code_scans(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_qr_code_scans_scanned_at ON qr_code_scans(scanned_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_qr_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_qr_codes_updated_at
  BEFORE UPDATE ON qr_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_qr_codes_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_code_scans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for qr_codes
-- Allow admins to do everything (adjust email check as needed)
CREATE POLICY "Admins can manage QR codes"
  ON qr_codes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'dartonstaker@gmail.com'
    )
  );

-- Allow public read access for active QR codes (for redirect endpoint)
CREATE POLICY "Public can view active QR codes"
  ON qr_codes
  FOR SELECT
  USING (status = 'active');

-- RLS Policies for qr_code_scans
-- Allow admins to view all scans
CREATE POLICY "Admins can view all scans"
  ON qr_code_scans
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'dartonstaker@gmail.com'
    )
  );

-- Allow public to insert scans (for tracking)
CREATE POLICY "Public can insert scans"
  ON qr_code_scans
  FOR INSERT
  WITH CHECK (true);


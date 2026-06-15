-- Run this in Supabase SQL Editor if kevro_products already exists
-- without store_section / subcategory_slug columns.

ALTER TABLE public.kevro_products ADD COLUMN IF NOT EXISTS store_section TEXT;
ALTER TABLE public.kevro_products ADD COLUMN IF NOT EXISTS subcategory_slug TEXT;

CREATE INDEX IF NOT EXISTS idx_kevro_products_store_section ON public.kevro_products (store_section);
CREATE INDEX IF NOT EXISTS idx_kevro_products_subcategory_slug ON public.kevro_products (subcategory_slug);

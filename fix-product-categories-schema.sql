-- Fix product_categories table to make slug optional or auto-generate it
-- This resolves the issue where creating categories fails because slug is NOT NULL

-- Option 1: Make slug nullable
ALTER TABLE product_categories ALTER COLUMN slug DROP NOT NULL;

-- Create helper function for slug generation
CREATE OR REPLACE FUNCTION generate_slug(text)
RETURNS text AS $$
BEGIN
  RETURN lower(regexp_replace(text, '[^a-zA-Z0-9]+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Update existing rows to have slugs based on name
UPDATE product_categories 
SET slug = generate_slug(name)
WHERE slug IS NULL;

-- Create a trigger to auto-generate slug before insert
CREATE OR REPLACE FUNCTION auto_generate_category_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_categories_auto_slug
BEFORE INSERT ON product_categories
FOR EACH ROW
EXECUTE FUNCTION auto_generate_category_slug();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_categories_name ON product_categories(name);
CREATE INDEX IF NOT EXISTS idx_product_categories_active ON product_categories(is_active);

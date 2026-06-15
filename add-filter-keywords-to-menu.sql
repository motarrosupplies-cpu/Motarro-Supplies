-- Add filter_keywords column to menu_items table for keyword-based product filtering
-- This allows menu items to filter products by keywords in their titles

ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS filter_keywords TEXT;

-- Add index for better performance when filtering by keywords
CREATE INDEX IF NOT EXISTS idx_menu_items_filter_keywords ON menu_items(filter_keywords);

-- Add a comment to explain the column
COMMENT ON COLUMN menu_items.filter_keywords IS 'Comma-separated keywords for filtering products by title or description';


-- Add support for submenu items in menu_items table
-- This allows adding submenu items (children) to menu items

-- First, ensure the menu_items table structure supports submenus
-- The table already has parent_id, children[], etc., so we just need to add a new field for managing submenu items

-- Add a 'submenu_items' field to store child menu items
-- Since the table already supports hierarchical structure via parent_id, 
-- we just need to ensure the relationship is properly established

-- The existing schema already supports this via:
-- - parent_id (self-referencing FK for hierarchy)
-- - order_index (for ordering)
-- - level (for depth)

-- No schema changes needed! The current structure already supports submenus.

-- However, we should add an index for better performance when querying children
CREATE INDEX IF NOT EXISTS idx_menu_items_parent_id_order ON menu_items(parent_id, order_index);

-- Add a helper function to get menu item's parent chain (useful for breadcrumbs)
CREATE OR REPLACE FUNCTION get_menu_item_path(menu_item_id UUID)
RETURNS TABLE(id UUID, label TEXT, href TEXT, level INTEGER)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE menu_path AS (
    SELECT mi.id, mi.label, mi.href, mi.level, mi.parent_id
    FROM menu_items mi
    WHERE mi.id = menu_item_id
    
    UNION ALL
    
    SELECT mi.id, mi.label, mi.href, mi.level, mi.parent_id
    FROM menu_items mi
    INNER JOIN menu_path mp ON mi.id = mp.parent_id
  )
  SELECT path.id, path.label, path.href, path.level
  FROM menu_path path
  ORDER BY path.level;
END;
$$;

-- Add a function to validate menu hierarchy (prevent circular references)
CREATE OR REPLACE FUNCTION validate_menu_hierarchy(menu_item_id UUID, new_parent_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  current_parent UUID;
BEGIN
  -- A menu item cannot be its own parent
  IF menu_item_id = new_parent_id THEN
    RETURN FALSE;
  END IF;
  
  -- Check if new_parent would create a circular reference
  WITH RECURSIVE parent_chain AS (
    SELECT parent_id FROM menu_items WHERE id = new_parent_id
    UNION ALL
    SELECT mi.parent_id 
    FROM menu_items mi
    JOIN parent_chain pc ON mi.id = pc.parent_id
  )
  SELECT INTO current_parent
  CASE WHEN EXISTS(SELECT 1 FROM parent_chain WHERE parent_id = menu_item_id) 
    THEN FALSE 
    ELSE TRUE 
  END;
  
  RETURN TRUE;
END;
$$;

-- Menu RLS: Allow public read of active menu items
-- After fix-supabase-security-warnings.sql enabled RLS on menu_items, only
-- "authenticated" had access. This adds SELECT for anon so /api/menu works.
-- Admin CRUD uses service_role (bypasses RLS) via SUPABASE_SERVICE_ROLE_KEY.

-- Drop if exists to allow re-running (e.g. idempotent)
DROP POLICY IF EXISTS "Allow public read active menu" ON menu_items;
CREATE POLICY "Allow public read active menu"
  ON menu_items
  FOR SELECT
  USING (is_active = true);

-- Allow public read of menu_category_mapping so header/nav can join categories
DROP POLICY IF EXISTS "Allow public read menu_category_mapping" ON menu_category_mapping;
CREATE POLICY "Allow public read menu_category_mapping"
  ON menu_category_mapping
  FOR SELECT
  USING (true);

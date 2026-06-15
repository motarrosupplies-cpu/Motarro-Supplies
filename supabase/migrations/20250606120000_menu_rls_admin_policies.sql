-- Menu RLS: public read, authenticated write, admin API uses service_role (bypasses RLS).
-- Anon users must not INSERT/UPDATE/DELETE menu_items (security fix after RLS was enabled).

ALTER TABLE IF EXISTS menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS menu_category_mapping ENABLE ROW LEVEL SECURITY;

-- menu_items
DROP POLICY IF EXISTS "Allow public read active menu" ON menu_items;
CREATE POLICY "Allow public read active menu"
  ON menu_items
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON menu_items;
DROP POLICY IF EXISTS "Authenticated users manage menu_items" ON menu_items;
CREATE POLICY "Authenticated users manage menu_items"
  ON menu_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- product_categories
DROP POLICY IF EXISTS "Allow read for all" ON product_categories;
CREATE POLICY "Allow read for all"
  ON product_categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow write for authenticated" ON product_categories;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON product_categories;
DROP POLICY IF EXISTS "Authenticated users manage product_categories" ON product_categories;
CREATE POLICY "Authenticated users manage product_categories"
  ON product_categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- menu_category_mapping
DROP POLICY IF EXISTS "Allow public read menu_category_mapping" ON menu_category_mapping;
CREATE POLICY "Allow public read menu_category_mapping"
  ON menu_category_mapping
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON menu_category_mapping;
DROP POLICY IF EXISTS "Authenticated users manage menu_category_mapping" ON menu_category_mapping;
CREATE POLICY "Authenticated users manage menu_category_mapping"
  ON menu_category_mapping
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

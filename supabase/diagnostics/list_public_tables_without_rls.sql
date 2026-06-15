-- Run in Supabase SQL Editor → Results show every public table where RLS is OFF.
-- Match the "Table publicly accessible" / rls_disabled_in_public advisor rows.

SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND NOT c.relrowsecurity
ORDER BY c.relname;

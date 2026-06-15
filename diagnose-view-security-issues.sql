-- ============================================================================
-- Diagnose Security Definer View Issues
-- This script helps identify why views are still flagged as SECURITY DEFINER
-- ============================================================================

-- Check 1: View definitions for SECURITY DEFINER
SELECT 
  schemaname,
  viewname,
  viewowner,
  CASE 
    WHEN definition LIKE '%SECURITY DEFINER%' THEN '❌ HAS SECURITY DEFINER IN DEFINITION'
    ELSE '✅ No SECURITY DEFINER in definition'
  END as definition_check,
  LEFT(definition, 200) as definition_preview
FROM pg_views
WHERE schemaname = 'public'
  AND viewname IN ('all_products_unified', 'ready_to_ship_products_view')
ORDER BY viewname;

-- Check 2: Check if views reference functions with SECURITY DEFINER
SELECT DISTINCT
  p.proname as function_name,
  CASE 
    WHEN pg_get_functiondef(p.oid) LIKE '%SECURITY DEFINER%' THEN '❌ HAS SECURITY DEFINER'
    ELSE '✅ No SECURITY DEFINER'
  END as security_status,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND (
    -- Functions that might be used in views
    p.proname LIKE '%product%'
    OR p.proname LIKE '%stock%'
    OR p.proname LIKE '%price%'
    OR p.proname LIKE '%calculate%'
  )
ORDER BY p.proname;

-- Check 3: Check view dependencies
SELECT 
  dependent_ns.nspname as dependent_schema,
  dependent_view.relname as dependent_view,
  source_ns.nspname as source_schema,
  source_table.relname as source_table,
  CASE 
    WHEN source_table.relkind = 'f' THEN 'Function'
    WHEN source_table.relkind = 'v' THEN 'View'
    ELSE 'Table'
  END as source_type
FROM pg_depend
JOIN pg_rewrite ON pg_depend.objid = pg_rewrite.oid
JOIN pg_class dependent_view ON pg_rewrite.ev_class = dependent_view.oid
JOIN pg_class source_table ON pg_depend.refobjid = source_table.oid
JOIN pg_namespace dependent_ns ON dependent_view.relnamespace = dependent_ns.oid
JOIN pg_namespace source_ns ON source_table.relnamespace = source_ns.oid
WHERE dependent_view.relname IN ('all_products_unified', 'ready_to_ship_products_view')
  AND dependent_ns.nspname = 'public'
ORDER BY dependent_view.relname, source_table.relname;

-- Check 4: Check all functions with SECURITY DEFINER
SELECT 
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  '❌ HAS SECURITY DEFINER' as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND pg_get_functiondef(p.oid) LIKE '%SECURITY DEFINER%'
ORDER BY p.proname;

-- Check 5: View ownership and permissions
SELECT 
  n.nspname as schema_name,
  c.relname as view_name,
  pg_get_userbyid(c.relowner) as owner,
  c.relacl as access_privileges
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND c.relname IN ('all_products_unified', 'ready_to_ship_products_view')
  AND c.relkind = 'v'
ORDER BY c.relname;

-- Check 6: Try to see if there's a way to alter view security
-- Note: This might show if there's a security_barrier or other setting
SELECT 
  c.relname as view_name,
  c.reloptions as view_options,
  CASE 
    WHEN c.reloptions IS NULL THEN 'No special options'
    ELSE array_to_string(c.reloptions, ', ')
  END as options_description
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND c.relname IN ('all_products_unified', 'ready_to_ship_products_view')
  AND c.relkind = 'v';


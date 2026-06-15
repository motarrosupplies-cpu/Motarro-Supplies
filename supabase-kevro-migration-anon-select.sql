-- Allow anon/authenticated reads on kevro_products (RLS policy already limits to status = active)
GRANT SELECT ON public.kevro_products TO anon;
GRANT SELECT ON public.kevro_products TO authenticated;

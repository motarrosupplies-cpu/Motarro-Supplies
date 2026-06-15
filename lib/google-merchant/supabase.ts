import { supabase, supabaseAdmin } from "@/lib/supabaseClient";

/** Prefer service role for large catalog reads (kevro_products RLS + payload size). */
export function getMerchantFeedSupabaseClient() {
  if (supabaseAdmin) {
    return supabaseAdmin;
  }

  console.warn(
    "[GMC feed] SUPABASE_SERVICE_ROLE_KEY not set — falling back to anon client for kevro_products"
  );
  return supabase;
}

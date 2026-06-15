import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth/verifyAdminApi";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function GET(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 });
  }

  const [{ count }, { data: lastSync }] = await Promise.all([
    supabaseAdmin
      .from("titan_jet_products")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabaseAdmin
      .from("titan_jet_sync_runs")
      .select("status, product_count, finished_at, error_message")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return NextResponse.json({
    productCount: count ?? 0,
    lastSync: lastSync ?? null,
  });
}

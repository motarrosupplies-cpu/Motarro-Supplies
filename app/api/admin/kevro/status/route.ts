import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth/verifyAdminApi";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { isKevroConfigured } from "@/lib/kevro/config";

export async function GET(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 });
  }

  const [{ count: productCount }, { data: lastRun }] = await Promise.all([
    supabaseAdmin
      .from("kevro_products")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabaseAdmin
      .from("kevro_sync_runs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return NextResponse.json({
    configured: isKevroConfigured(),
    productCount: productCount ?? 0,
    lastSync: lastRun ?? null,
    catalogUrl: "/branded-catalog",
  });
}

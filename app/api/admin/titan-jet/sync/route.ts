import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth/verifyAdminApi";
import { syncTitanJetFeedToSupabase } from "@/lib/titan-jet/sync";

export const maxDuration = 60;

export async function POST(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const result = await syncTitanJetFeedToSupabase();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}

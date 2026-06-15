import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth/verifyAdminApi";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { sendEmailCampaignNow } from "@/lib/emailCampaignDispatch";

export const maxDuration = 60;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdminRequest(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 503 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const result = await sendEmailCampaignNow(supabaseAdmin, id);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || "Send failed" },
        { status: result.error?.includes("not in draft") ? 409 : 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      recipientCount: result.recipientCount,
    });
  } catch (e) {
    console.error("[campaign send POST]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Send failed" },
      { status: 500 }
    );
  }
}

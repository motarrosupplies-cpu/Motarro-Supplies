import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth/verifyAdminApi";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { resolveRecipientsForSend } from "@/lib/emailCampaignSend";

function parsePatterns(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export async function POST(request: NextRequest) {
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

    const body = await request.json().catch(() => ({}));
    const allow = parsePatterns(body.allowlistPatterns);
    const block = parsePatterns(body.blocklistPatterns);
    const parentId =
      typeof body.parentCampaignId === "string" && body.parentCampaignId.trim()
        ? body.parentCampaignId.trim()
        : null;

    const { emails, source } = await resolveRecipientsForSend(supabaseAdmin, {
      parentCampaignId: parentId,
      allowlistPatterns: allow,
      blocklistPatterns: block,
    });

    let notice: string | undefined;
    if (parentId) {
      const { count, error } = await supabaseAdmin
        .from("email_campaign_recipients")
        .select("*", { count: "exact", head: true })
        .eq("campaign_id", parentId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if ((count ?? 0) === 0) {
        notice =
          "The parent campaign has no stored recipients yet. They are recorded when that campaign is actually sent; until then this preview is empty.";
      }
    }

    return NextResponse.json({
      count: emails.length,
      sample: emails.slice(0, 12),
      source,
      notice,
    });
  } catch (e) {
    console.error("[audience-preview POST]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Preview failed" },
      { status: 500 }
    );
  }
}

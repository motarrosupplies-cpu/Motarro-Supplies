import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth/verifyAdminApi";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { mapCampaignRow } from "@/lib/emailCampaignMap";

function parsePatterns(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export async function GET(request: NextRequest) {
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

    const { data, error } = await supabaseAdmin
      .from("email_campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        return NextResponse.json(
          {
            error:
              "Table email_campaigns missing — run supabase/migrations/20260411120000_email_campaigns.sql",
          },
          { status: 503 }
        );
      }
      console.error("[campaigns GET]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      (data || []).map((row) => mapCampaignRow(row as Record<string, unknown>)),
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (e) {
    console.error("[campaigns GET]", e);
    return NextResponse.json({ error: "Failed to list campaigns" }, { status: 500 });
  }
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

    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const imageUrl =
      typeof body.imageUrl === "string" ? body.imageUrl.trim() || null : null;
    const emailBody =
      typeof body.emailBody === "string" ? body.emailBody : "";
    const status =
      typeof body.status === "string" && body.status.trim()
        ? body.status.trim()
        : "draft";

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const allowlistPatterns =
      body.allowlistPatterns !== undefined
        ? parsePatterns(body.allowlistPatterns)
        : [];
    const blocklistPatterns =
      body.blocklistPatterns !== undefined
        ? parsePatterns(body.blocklistPatterns)
        : [];
    const scheduledAtRaw = body.scheduledAt;
    const scheduledAt =
      typeof scheduledAtRaw === "string" && scheduledAtRaw.trim()
        ? scheduledAtRaw.trim()
        : null;
    const parentRaw = body.parentCampaignId;
    const parentCampaignId =
      typeof parentRaw === "string" && parentRaw.trim() ? parentRaw.trim() : null;

    if (status === "scheduled" && !scheduledAt) {
      return NextResponse.json(
        { error: "scheduled_at is required when status is scheduled" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const { data, error } = await supabaseAdmin
      .from("email_campaigns")
      .insert({
        title,
        image_url: imageUrl,
        email_body: emailBody,
        status,
        allowlist_patterns: allowlistPatterns,
        blocklist_patterns: blocklistPatterns,
        scheduled_at: scheduledAt,
        parent_campaign_id: parentCampaignId,
        created_at: now,
        updated_at: now,
      })
      .select("*")
      .single();

    if (error) {
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        return NextResponse.json(
          {
            error:
              "Table email_campaigns missing — run migration 20260411120000_email_campaigns.sql",
          },
          { status: 503 }
        );
      }
      console.error("[campaigns POST]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      mapCampaignRow(data as Record<string, unknown>),
      { status: 201 }
    );
  } catch (e) {
    console.error("[campaigns POST]", e);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}

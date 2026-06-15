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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdminRequest(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 503 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("email_campaigns")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(mapCampaignRow(data as Record<string, unknown>));
  } catch (e) {
    console.error("[campaign GET]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdminRequest(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof body.title === "string") patch.title = body.title.trim();
    if (body.imageUrl !== undefined) {
      patch.image_url =
        typeof body.imageUrl === "string" ? body.imageUrl.trim() || null : null;
    }
    if (typeof body.emailBody === "string") patch.email_body = body.emailBody;
    if (typeof body.status === "string") patch.status = body.status.trim();
    if (body.allowlistPatterns !== undefined) {
      patch.allowlist_patterns = parsePatterns(body.allowlistPatterns);
    }
    if (body.blocklistPatterns !== undefined) {
      patch.blocklist_patterns = parsePatterns(body.blocklistPatterns);
    }
    if (body.scheduledAt !== undefined) {
      patch.scheduled_at =
        typeof body.scheduledAt === "string" && body.scheduledAt.trim()
          ? body.scheduledAt.trim()
          : null;
    }
    if (body.parentCampaignId !== undefined) {
      const pid =
        typeof body.parentCampaignId === "string" && body.parentCampaignId.trim()
          ? body.parentCampaignId.trim()
          : null;
      if (pid === id) {
        return NextResponse.json(
          { error: "Campaign cannot be its own parent" },
          { status: 400 }
        );
      }
      patch.parent_campaign_id = pid;
    }

    const nextStatus =
      typeof patch.status === "string" ? patch.status : undefined;
    const nextScheduled =
      patch.scheduled_at !== undefined
        ? (patch.scheduled_at as string | null)
        : undefined;

    if (nextStatus === "scheduled") {
      const effectiveScheduled =
        nextScheduled !== undefined
          ? nextScheduled
          : (
              await supabaseAdmin
                .from("email_campaigns")
                .select("scheduled_at")
                .eq("id", id)
                .maybeSingle()
            ).data?.scheduled_at;

      if (!effectiveScheduled) {
        return NextResponse.json(
          { error: "scheduled_at is required when status is scheduled" },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabaseAdmin
      .from("email_campaigns")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json(mapCampaignRow(data as Record<string, unknown>));
  } catch (e) {
    console.error("[campaign PATCH]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdminRequest(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 503 }
      );
    }

    const { error } = await supabaseAdmin
      .from("email_campaigns")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[campaign DELETE]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

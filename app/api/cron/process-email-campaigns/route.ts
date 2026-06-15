import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { processDueEmailCampaigns } from "@/lib/emailCampaignDispatch";

export const maxDuration = 60;

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

async function run(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 503 }
    );
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return unauthorized();
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 503 }
    );
  }

  const result = await processDueEmailCampaigns(supabaseAdmin);
  return NextResponse.json(result);
}

/** External scheduler (e.g. cron-job.org) or manual call: GET with Authorization: Bearer CRON_SECRET */
export async function GET(request: NextRequest) {
  return run(request);
}

/** Allow manual trigger with the same header (e.g. curl / Postman). */
export async function POST(request: NextRequest) {
  return run(request);
}

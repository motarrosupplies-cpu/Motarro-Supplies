import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth/verifyAdminApi";
import { isXaiConfigured } from "@/lib/xai/config";
import {
  buildWhatsAppLeadUrl,
  qualifyLeadMessage,
} from "@/lib/xai/lead-qualification";
import { XaiClientError } from "@/lib/xai/client";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const auth = await verifyAdminRequest(
    request,
    typeof body.accessToken === "string" ? body.accessToken : null
  );
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error, code: auth.code },
      { status: auth.status }
    );
  }

  if (!isXaiConfigured()) {
    return NextResponse.json(
      { error: "XAI_API_KEY is not configured on the server", code: "config" },
      { status: 503 }
    );
  }

  try {
    const message = String(body.message || "").trim();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const lead = await qualifyLeadMessage(message);

    return NextResponse.json({
      lead,
      whatsappUrl: buildWhatsAppLeadUrl(lead.suggestedReply),
    });
  } catch (error) {
    if (error instanceof XaiClientError) {
      return NextResponse.json(
        { error: error.message, code: "xai" },
        { status: error.status }
      );
    }

    console.error("[admin/ai/qualify-lead]", error);
    return NextResponse.json(
      { error: "Failed to qualify lead" },
      { status: 500 }
    );
  }
}

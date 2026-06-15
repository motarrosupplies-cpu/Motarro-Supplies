import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth/verifyAdminApi";
import { isAdminEmail } from "@/lib/brand";
import { getXaiModel, isXaiConfigured } from "@/lib/xai/config";
import { testXaiConnection } from "@/lib/xai/health";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const auth = await verifyAdminRequest(
    request,
    typeof body.accessToken === "string" ? body.accessToken : null
  );

  if (!auth.ok) {
    return NextResponse.json(
      {
        auth: { ok: false, error: auth.error, code: auth.code },
        xai: {
          configured: isXaiConfigured(),
          model: getXaiModel(),
          ok: false,
          skipped: true,
        },
      },
      { status: auth.status }
    );
  }

  const xai = await testXaiConnection();

  return NextResponse.json({
    auth: {
      ok: true,
      email: auth.email,
      isAdmin: isAdminEmail(auth.email),
    },
    xai,
  });
}

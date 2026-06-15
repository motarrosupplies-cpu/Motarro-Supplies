import { NextRequest, NextResponse } from "next/server";
import { getKevroBrandingForProduct } from "@/lib/kevro/branding";
import { isKevroConfigured } from "@/lib/kevro/config";
import { getKevroCacheSeconds } from "@/lib/kevro/cache";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ stockHeaderId: string }> }
) {
  if (!isKevroConfigured()) {
    return NextResponse.json({ error: "Kevro feed is not configured" }, { status: 503 });
  }

  try {
    const { stockHeaderId } = await params;
    const id = Number(stockHeaderId);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid stock header ID" }, { status: 400 });
    }

    const branding = await getKevroBrandingForProduct(id);
    return NextResponse.json(branding, {
      headers: {
        "Cache-Control": `public, s-maxage=${getKevroCacheSeconds()}, stale-while-revalidate=300`,
      },
    });
  } catch (error) {
    console.error("[kevro/branding]", error);
    return NextResponse.json({ error: "Failed to load branding options" }, { status: 502 });
  }
}

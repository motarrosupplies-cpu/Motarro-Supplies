import { NextRequest, NextResponse } from "next/server";
import { isKevroConfigured } from "@/lib/kevro/config";
import {
  getKevroCacheSeconds,
  getKevroProductBySlugOrId,
} from "@/lib/kevro/cache";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ stockHeaderId: string }> }
) {
  if (!isKevroConfigured()) {
    return NextResponse.json(
      { error: "Kevro feed is not configured on this server" },
      { status: 503 }
    );
  }

  try {
    const { stockHeaderId } = await params;
    const id = Number(stockHeaderId);

    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json(
        { error: "Invalid stock header ID" },
        { status: 400 }
      );
    }

    const product = await getKevroProductBySlugOrId(String(id));
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product, {
      headers: {
        "Cache-Control": `public, s-maxage=${getKevroCacheSeconds()}, stale-while-revalidate=300`,
      },
    });
  } catch (error) {
    console.error("[kevro/products/:id]", error);
    return NextResponse.json(
      { error: "Failed to load Kevro product" },
      { status: 502 }
    );
  }
}

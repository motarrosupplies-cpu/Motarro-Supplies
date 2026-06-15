import { NextRequest, NextResponse } from "next/server";
import { isKevroConfigured } from "@/lib/kevro/config";
import { getKevroCacheSeconds, getKevroProducts } from "@/lib/kevro/cache";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isKevroConfigured()) {
    return NextResponse.json(
      { error: "Kevro feed is not configured on this server" },
      { status: 503 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const products = await getKevroProducts({
      category: searchParams.get("category"),
      brand: searchParams.get("brand"),
      type: searchParams.get("type"),
      search: searchParams.get("search"),
      inStock: searchParams.get("inStock") === "true",
    });

    return NextResponse.json(
      {
        count: products.length,
        products,
      },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${getKevroCacheSeconds()}, stale-while-revalidate=300`,
        },
      }
    );
  } catch (error) {
    console.error("[kevro/products]", error);
    return NextResponse.json(
      { error: "Failed to load Kevro product feed" },
      { status: 502 }
    );
  }
}

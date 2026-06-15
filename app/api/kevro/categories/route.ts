import { NextResponse } from "next/server";
import { isKevroConfigured } from "@/lib/kevro/config";
import {
  getKevroBrands,
  getKevroCacheSeconds,
  getKevroCategories,
  getKevroTypes,
} from "@/lib/kevro/cache";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isKevroConfigured()) {
    return NextResponse.json(
      { error: "Kevro feed is not configured on this server" },
      { status: 503 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const [categories, brands, types] = await Promise.all([
      getKevroCategories(),
      getKevroBrands(),
      getKevroTypes(category),
    ]);

    return NextResponse.json(
      { categories, brands, types },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${getKevroCacheSeconds()}, stale-while-revalidate=300`,
        },
      }
    );
  } catch (error) {
    console.error("[kevro/categories]", error);
    return NextResponse.json(
      { error: "Failed to load Kevro categories" },
      { status: 502 }
    );
  }
}

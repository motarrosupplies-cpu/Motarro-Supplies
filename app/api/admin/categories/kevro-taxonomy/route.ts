import { NextResponse } from "next/server";
import { getKevroTaxonomySummary } from "@/lib/kevro/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const taxonomy = await getKevroTaxonomySummary();
    return NextResponse.json(taxonomy);
  } catch (error) {
    console.error("[admin/categories/kevro-taxonomy]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load Kevro taxonomy",
      },
      { status: 500 }
    );
  }
}

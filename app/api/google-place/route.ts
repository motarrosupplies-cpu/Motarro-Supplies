import { NextResponse } from "next/server"
import { getGooglePlaceSnapshot } from "@/lib/google-place"

export const revalidate = 3600

export async function GET() {
  try {
    const snapshot = await getGooglePlaceSnapshot()
    if (!snapshot) {
      return NextResponse.json(
        {
          ok: false,
          error: "not_configured",
          message:
            "Set GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID on the server (Vercel env) to load live Google data.",
        },
        { status: 200 }
      )
    }
    return NextResponse.json({ ok: true, ...snapshot }, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (e) {
    console.error("[google-place] route error:", e)
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 })
  }
}

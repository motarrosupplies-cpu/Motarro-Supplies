import { NextRequest, NextResponse } from "next/server"

const TARGETS: Record<string, string> = {
  facebook: "https://www.facebook.com/profile.php?id=61576822484215",
  instagram: "https://www.instagram.com/www.motarro.co.za/",
  x: "https://x.com/MOTARRO SuppliesZA",
  etsy: "https://www.etsy.com/shop/MOTARRO SuppliesZA",
  linkedin: "https://www.linkedin.com/company/motarro",
  google: "https://www.google.com/search?q=www.motarro.co.za",
}

export function GET(
  _req: NextRequest,
  { params }: { params: { target: string } },
) {
  const target = String(params.target || "").toLowerCase()
  const url = TARGETS[target]
  if (!url) {
    return NextResponse.json({ error: "Unknown redirect target" }, { status: 404 })
  }
  return NextResponse.redirect(url, 302)
}


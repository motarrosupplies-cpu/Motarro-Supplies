import Link from "next/link"
import { Suspense } from "react"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"
import { HomeAnnouncementBanner } from "@/components/home-announcement-banner"
import { HeroSection } from "@/components/hero-section"
import { TrustSection } from "@/components/trust-section"
import { MOTARRO_BRAND_NAME, MOTARRO_DESCRIPTION, MOTARRO_TAGLINE } from "@/lib/brand"

const FeaturedProducts = dynamic(
  () => import("@/components/featured-products").then((m) => m.FeaturedProducts),
  { loading: () => <div className="text-center py-8">Loading featured products...</div> }
)
const CategorySection = dynamic(
  () => import("@/components/category-section").then((m) => m.CategorySection),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-[200px] rounded-2xl bg-white shadow animate-pulse" />
        <div className="h-[200px] rounded-2xl bg-white shadow animate-pulse" />
        <div className="h-[200px] rounded-2xl bg-white shadow animate-pulse" />
      </div>
    ),
  }
)

import type { Metadata } from "next"
import { WebSiteSchema, CollectionPageSchema, LocalBusinessSchema } from "@/components/seo/schema-org"

export const metadata: Metadata = {
  title: `Stationery & Craft Supplies South Africa | ${MOTARRO_BRAND_NAME}`,
  description: MOTARRO_DESCRIPTION,
  alternates: { canonical: "/" },
}

export const revalidate = 3600

export default function Home() {
  return (
    <>
      <WebSiteSchema />
      <CollectionPageSchema
        name="MOTARRO Stationery & Craft Supplies"
        description={MOTARRO_DESCRIPTION}
        url="/"
        items={[]}
      />
      <LocalBusinessSchema />
      <div className="flex flex-col min-h-screen bg-cream">
        <h1 className="sr-only">{MOTARRO_BRAND_NAME} — Stationery & Craft Supplies South Africa</h1>
        <HomeAnnouncementBanner />
        <HeroSection />
        <TrustSection />

        <div className="bg-cream">
          <CategorySection />
          <FeaturedProducts />

          <div className="py-20">
            <div className="container px-4 mx-auto max-w-full">
              <div className="flex flex-col items-center justify-center space-y-8 text-center bg-white p-8 sm:p-12 rounded-3xl shadow-xl">
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-primary">
                  {MOTARRO_TAGLINE}
                </h2>
                <p className="max-w-2xl text-base sm:text-xl text-muted-foreground leading-relaxed">
                  From classrooms to craft rooms — MOTARRO Supplies brings you quality stationery
                  and creative materials at prices in South African Rands.
                </p>
                <Button asChild size="lg" className="rounded-full px-8 py-6 text-lg font-semibold">
                  <Link href="/products" className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Start Shopping
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

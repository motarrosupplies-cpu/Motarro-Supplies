"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroImage } from "@/components/optimized-image"
import { MOTARRO_HERO_IMAGE_PATH, MOTARRO_TAGLINE } from "@/lib/brand"

export function HeroSection() {
  return (
    <section className="relative min-h-[72vh] overflow-hidden md:min-h-[85vh]">
      <HeroImage
        src={MOTARRO_HERO_IMAGE_PATH}
        alt="MOTARRO — Your destination for art, school and office supplies"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
        quality={90}
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10"
        aria-hidden
      />
      <div className="absolute inset-0 flex flex-col justify-end">
        <div className="container mx-auto px-4 pb-10 pt-24 md:pb-14 md:pt-32">
          <p className="mb-3 max-w-2xl text-sm font-semibold uppercase tracking-widest text-white/90 md:text-base">
            {MOTARRO_TAGLINE}
          </p>
          <p className="mb-8 max-w-2xl text-lg text-white/95 md:text-xl">
            Shop 1,000+ quality stationery, art, and craft products online — prices in Rands with
            nationwide delivery across South Africa.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-full px-8 py-6 text-lg font-bold"
            >
              <Link href="/products" className="flex items-center gap-2">
                Shop All Products
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/80 bg-white/10 px-8 py-6 text-lg text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
            >
              <Link href="/shop/art-supplies">Browse Art Supplies</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

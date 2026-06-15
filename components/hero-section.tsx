"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MOTARRO_LOGO_PATH, MOTARRO_TAGLINE } from "@/lib/brand"

export function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-background via-secondary/30 to-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              {MOTARRO_TAGLINE}
            </p>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-foreground md:text-6xl">
              Stationery & Craft Supplies
              <span className="block text-primary">for South Africa</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground md:text-xl">
              Shop 1,000+ quality stationery, art, and craft products online.
              Prices in Rands with nationwide delivery across South Africa.
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
                className="rounded-full px-8 py-6 text-lg"
              >
                <Link href="/shop/art-supplies">Browse Art Supplies</Link>
              </Button>
            </div>
          </div>
          <div className="flex justify-center">
            <Image
              src={MOTARRO_LOGO_PATH}
              alt="MOTARRO Supplies Logo"
              width={400}
              height={400}
              className="h-auto w-full max-w-sm drop-shadow-lg"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}

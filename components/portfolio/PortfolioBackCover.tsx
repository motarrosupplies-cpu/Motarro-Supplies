"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FlipbookPage } from "./FlipbookPage"

export function PortfolioBackCover() {
  return (
    <FlipbookPage>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <h2 className="text-2xl font-bold text-primary md:text-3xl">Ready to work with us?</h2>
        <p className="max-w-md text-muted-foreground">
          Join hundreds of businesses, schools, and event organisers who trust MOTARRO Supplies for custom
          apparel and printing across South Africa.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/contact">Get a free quote</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/products">Browse products</Link>
          </Button>
        </div>
      </div>
    </FlipbookPage>
  )
}

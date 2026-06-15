"use client"

import Link from "next/link"
import { ExternalLink, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FlipbookPage } from "./FlipbookPage"

interface GoogleReviewSummarySpreadProps {
  rating: number
  totalReviews: number
  googleMapsUri: string
  sampleShown: number
}

export function GoogleReviewSummarySpread({
  rating,
  totalReviews,
  googleMapsUri,
  sampleShown,
}: GoogleReviewSummarySpreadProps) {
  return (
    <FlipbookPage>
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center md:gap-6">
        <h2 className="text-xl font-bold text-primary md:text-2xl">Google reviews</h2>
        <div className="flex flex-wrap items-center justify-center gap-2" aria-hidden>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-7 w-7 md:h-8 md:w-8 ${
                i < Math.min(5, Math.max(0, Math.round(rating))) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/25"
              }`}
            />
          ))}
        </div>
        <p className="text-3xl font-black text-primary md:text-4xl">{rating.toFixed(1)}</p>
        <p className="text-sm text-muted-foreground md:text-base">
          <span className="font-semibold text-foreground">{totalReviews}</span> verified reviews on Google
        </p>
        <p className="max-w-md text-xs text-muted-foreground md:text-sm">
          Google allows apps to show up to {sampleShown} recent reviews per request. The following pages are a sample;
          every review is loaded from Google and updates when your rating changes.
        </p>
        <Button asChild variant="outline" size="lg" className="gap-2">
          <Link href={googleMapsUri} target="_blank" rel="noopener noreferrer" prefetch={false}>
            Read all reviews on Google Maps
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </FlipbookPage>
  )
}

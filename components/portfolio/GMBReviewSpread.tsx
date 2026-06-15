"use client"

import Image from "next/image"
import { Star } from "lucide-react"
import { FlipbookPage } from "./FlipbookPage"
import type { GMBReview } from "@/lib/portfolio-data"

interface GMBReviewSpreadProps {
  review: GMBReview
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function GMBReviewSpread({ review }: GMBReviewSpreadProps) {
  const hasPhoto = Boolean(review.image)

  return (
    <FlipbookPage>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center md:gap-6">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-lg font-bold text-primary md:h-24 md:w-24 md:text-xl">
          {hasPhoto && review.image ? (
            <Image
              src={review.image}
              alt={review.author}
              fill
              className="object-cover"
              sizes="96px"
              unoptimized={review.image.startsWith("http")}
            />
          ) : (
            <span aria-hidden>{initialsFromName(review.author)}</span>
          )}
        </div>
        <div className="flex gap-1" aria-label={`${review.rating} out of 5 stars`}>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 md:h-6 md:w-6 ${
                i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
              }`}
            />
          ))}
        </div>
        <blockquote className="text-base italic text-muted-foreground md:text-lg">
          &ldquo;{review.quote}&rdquo;
        </blockquote>
        <div>
          <p className="font-semibold">{review.author}</p>
          {(review.role || review.company) && (
            <p className="text-sm text-muted-foreground">
              {[review.role, review.company].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>
    </FlipbookPage>
  )
}

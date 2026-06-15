"use client"

import { useState, useEffect, useMemo } from "react"
import {
  caseStudies,
  verifiedGoogleReviews,
  gmbPosts,
  atAGlanceStats,
} from "@/lib/portfolio-data"
import type { GMBReview } from "@/lib/portfolio-data"
import { mergeAtAGlanceWithGoogle } from "@/lib/portfolio-at-a-glance"
import type { GooglePlaceReview, GooglePlaceSnapshot } from "@/lib/google-place"
import { Flipbook } from "@/components/portfolio/Flipbook"
import { AtAGlanceSpread } from "@/components/portfolio/AtAGlanceSpread"
import { CaseStudySpread } from "@/components/portfolio/CaseStudySpread"
import { BlogHighlightSpread } from "@/components/portfolio/BlogHighlightSpread"
import { GmbPostSpread } from "@/components/portfolio/GmbPostSpread"
import { GMBReviewSpread } from "@/components/portfolio/GMBReviewSpread"
import { GoogleReviewSummarySpread } from "@/components/portfolio/GoogleReviewSummarySpread"
import { PortfolioBackCover } from "@/components/portfolio/PortfolioBackCover"
import type { BlogPostForPortfolio } from "@/components/portfolio/BlogHighlightSpread"

const BLOG_LIMIT = 5

function toGMBReviewFromApi(r: GooglePlaceReview): GMBReview {
  return {
    id: r.id,
    quote: r.quote,
    author: r.author,
    role: r.role,
    rating: r.rating,
    image: r.image,
  }
}

export default function PortfolioFlipbookClient() {
  const [blogPosts, setBlogPosts] = useState<BlogPostForPortfolio[]>([])
  const [place, setPlace] = useState<GooglePlaceSnapshot | null>(null)
  const [dataReady, setDataReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [blogRes, placeRes] = await Promise.all([
          fetch("/api/blog?status=published"),
          fetch("/api/google-place"),
        ])

        if (!cancelled && blogRes.ok) {
          const data = await blogRes.json()
          const posts = (Array.isArray(data) ? data : []).slice(0, BLOG_LIMIT).map((p: Record<string, unknown>) => ({
            id: String(p.id ?? ""),
            title: String(p.title ?? ""),
            excerpt: String(p.excerpt ?? ""),
            slug: String(p.slug ?? ""),
            category: p.category != null ? String(p.category) : undefined,
            publish_date: p.publish_date != null ? String(p.publish_date) : undefined,
            images: Array.isArray(p.images) ? (p.images as string[]) : undefined,
            image_url: p.image_url != null ? String(p.image_url) : undefined,
          }))
          setBlogPosts(posts)
        }

        if (!cancelled && placeRes.ok) {
          const data = await placeRes.json()
          if (data?.ok && data?.placeId) {
            const { ok: _ok, ...snap } = data
            setPlace(snap as GooglePlaceSnapshot)
          }
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setDataReady(true)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const stats = useMemo(() => mergeAtAGlanceWithGoogle(atAGlanceStats, place), [place])

  const reviewSlides = useMemo((): GMBReview[] => {
    if (place?.reviews?.length) return place.reviews.map(toGMBReviewFromApi)
    return verifiedGoogleReviews
  }, [place])

  const mapsLink = place?.googleMapsUri

  const pages = [
    <AtAGlanceSpread key="at-a-glance-1" stats={stats} />,
    <AtAGlanceSpread key="at-a-glance-2" stats={stats} statsOnly />,
    ...blogPosts.map((post) => (
      <BlogHighlightSpread key={`blog-${post.id}`} post={post} />
    )),
    ...gmbPosts.map((post) => (
      <GmbPostSpread key={`gmb-post-${post.id}`} post={post} mapsLink={mapsLink} />
    )),
    ...caseStudies.map((study, index) => (
      <CaseStudySpread key={study.id} study={study} index={index} />
    )),
    ...(place && place.userRatingCount > 0
      ? [
          <GoogleReviewSummarySpread
            key="google-review-summary"
            rating={place.rating}
            totalReviews={place.userRatingCount}
            googleMapsUri={place.googleMapsUri}
            sampleShown={place.reviewSampleLimit}
          />,
        ]
      : []),
    ...reviewSlides.map((review) => <GMBReviewSpread key={review.id} review={review} />),
    <PortfolioBackCover key="back-cover" />,
  ]

  if (!dataReady && blogPosts.length === 0) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <p className="text-muted-foreground">Loading portfolio…</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4">
      <p className="mb-4 text-center text-sm text-muted-foreground">
        Swipe or use arrows to flip through. Tap dots to jump to a page.
        {place ? (
          <>
            {" "}
            Google rating and review totals refresh from Google (cached ~1 hour).
          </>
        ) : null}
      </p>
      <Flipbook>{pages}</Flipbook>
    </div>
  )
}

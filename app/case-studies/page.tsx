import Link from "next/link"
import { Star, BookOpen, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Metadata } from "next"
import { ReviewSchema } from "@/components/seo/schema-org"
import { verifiedGoogleReviews } from "@/lib/portfolio-data"
import { getGooglePlaceSnapshot } from "@/lib/google-place"

export const metadata: Metadata = {
  title: "Reviews & Stories | MOTARRO Supplies",
  description:
    "What customers say on Google about MOTARRO Supplies, plus links to our blog and portfolio. Real feedback—no fictional case studies.",
  keywords: [
    "MOTARRO Supplies reviews",
    "custom printing Johannesburg reviews",
    "Google reviews MOTARRO Supplies",
    "custom apparel South Africa",
  ],
  alternates: {
    canonical: "/case-studies",
  },
}

export const revalidate = 3600

const GMB_SEARCH_URL = "https://www.google.com/search?q=www.motarro.co.za"

export default async function CaseStudiesPage() {
  const snapshot = await getGooglePlaceSnapshot()

  const reviewRows =
    snapshot?.reviews?.length ?
      snapshot.reviews.map((r) => ({
        id: r.id,
        quote: r.quote,
        author: r.author,
        role: r.role,
        rating: r.rating,
      }))
    : verifiedGoogleReviews

  const schemaReviews = reviewRows.map((r) => ({
    "@type": "Review" as const,
    author: {
      "@type": "Person",
      name: r.author,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: r.rating.toString(),
      bestRating: "5",
    },
    reviewBody: r.quote,
    itemReviewed: {
      "@type": "Service",
      name: "MOTARRO Supplies custom printing",
    },
  }))

  const aggregateRating =
    snapshot && snapshot.userRatingCount > 0 ?
      {
        ratingValue: snapshot.rating.toFixed(1),
        reviewCount: String(snapshot.userRatingCount),
      }
    : undefined

  const profileLink = snapshot?.googleMapsUri ?? GMB_SEARCH_URL

  return (
    <>
      <ReviewSchema reviews={schemaReviews} aggregateRating={aggregateRating} />
      <div className="min-h-screen bg-gradient-to-b from-lavender to-white">
        <div className="container mx-auto max-w-6xl px-4 py-12">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-black tracking-tight text-primary md:text-5xl">
              Reviews &amp; stories
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {snapshot ?
                "Rating and review totals below are loaded from Google (same source as the portfolio flipbook). We show up to five recent written reviews per request; all reviews live on Google Maps."
              : "We showcase real Google reviews and our blog—no made-up case studies. Connect the Places API on the server to show live totals, or see the portfolio flipbook."
              }
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/portfolio">Open portfolio flipbook</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/blog">Read the blog</Link>
              </Button>
            </div>
          </div>

          <Card className="mb-10 border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Star className="h-7 w-7 fill-yellow-400 text-yellow-400" />
                Google reviews
              </CardTitle>
              <p className="text-muted-foreground">
                {snapshot ?
                  `About ${snapshot.userRatingCount} reviews on Google · ${snapshot.rating.toFixed(1)} average. Sample quotes below.`
                : "Quotes below are verified from our public Google Business presence (also on the Kempton Park service page). Add GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID to show live totals."
                }
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {reviewRows.map((r) => (
                  <blockquote key={r.id} className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="mb-3 flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted/30"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mb-4 text-muted-foreground">&ldquo;{r.quote}&rdquo;</p>
                    <footer className="text-sm">
                      <cite className="font-semibold not-italic text-foreground">{r.author}</cite>
                      {r.role && (
                        <span className="mt-1 block text-xs text-muted-foreground">{r.role}</span>
                      )}
                    </footer>
                  </blockquote>
                ))}
              </div>
              <p className="mt-8 text-center text-sm text-muted-foreground">
                <Link
                  href={profileLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-primary underline"
                  prefetch={false}
                >
                  {snapshot ? "Open our place on Google Maps" : "View our Google Business Profile"}
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BookOpen className="h-6 w-6 text-primary" />
                  From the blog
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Printing tips, branding ideas, and updates live in our blog—fed from the same posts
                  highlighted in the portfolio flipbook.
                </p>
                <Button asChild variant="secondary">
                  <Link href="/blog">Browse articles</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="border-0 bg-primary/5 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">Google Business updates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Your published Google posts are listed in the portfolio flipbook. There is no public API for
                  GMB-only posts without Business Profile API access, so updates are maintained in code when you
                  add new campaigns.
                </p>
                <Button asChild variant="outline">
                  <Link href={profileLink} target="_blank" rel="noopener noreferrer" prefetch={false}>
                    Open Google profile
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

/**
 * Google Places API (New) — Place Details for live rating, review count, and up to 5 review texts.
 * Set GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID in Vercel (server-only).
 */

export interface GooglePlaceReview {
  id: string
  quote: string
  author: string
  role?: string
  rating: number
  image?: string
  relativeTime?: string
}

export interface GooglePlaceSnapshot {
  placeId: string
  displayName: string
  rating: number
  userRatingCount: number
  googleMapsUri: string
  reviews: GooglePlaceReview[]
  /** Google returns at most 5 reviews per Place Details request */
  reviewSampleLimit: 5
  fetchedAt: string
}

interface PlacesReview {
  name?: string
  rating?: number
  text?: { text?: string }
  originalText?: { text?: string }
  relativePublishTimeDescription?: string
  authorAttribution?: { displayName?: string; photoUri?: string }
}

interface PlacesResponse {
  id?: string
  displayName?: { text?: string }
  rating?: number
  userRatingCount?: number
  googleMapsUri?: string
  reviews?: PlacesReview[]
}

function normalizeReview(r: PlacesReview, index: number): GooglePlaceReview | null {
  const quote = (r.text?.text ?? r.originalText?.text ?? "").trim()
  if (!quote) return null
  const author = (r.authorAttribution?.displayName ?? "Google user").trim() || "Google user"
  const rating = typeof r.rating === "number" ? Math.round(r.rating) : 5
  const id =
    (r.name && r.name.replace(/^.*\/reviews\//, "")) ||
    `api-${author}-${index}`.replace(/\s+/g, "-").slice(0, 80)
  const photo = r.authorAttribution?.photoUri?.trim()
  return {
    id,
    quote,
    author,
    role: r.relativePublishTimeDescription ? `Google · ${r.relativePublishTimeDescription}` : "Google review",
    rating: Math.min(5, Math.max(1, rating)),
    image: photo || undefined,
    relativeTime: r.relativePublishTimeDescription,
  }
}

function normalizePayload(data: PlacesResponse): GooglePlaceSnapshot | null {
  const placeId = data.id
  if (!placeId) return null
  const name = data.displayName?.text?.trim() || "MOTARRO Supplies"
  const rating = typeof data.rating === "number" ? data.rating : 0
  const userRatingCount = typeof data.userRatingCount === "number" ? data.userRatingCount : 0
  const googleMapsUri = data.googleMapsUri?.trim() || `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(placeId)}`
  const rawReviews = Array.isArray(data.reviews) ? data.reviews : []
  const reviews: GooglePlaceReview[] = []
  rawReviews.forEach((rev, i) => {
    const n = normalizeReview(rev, i)
    if (n) reviews.push(n)
  })

  return {
    placeId,
    displayName: name,
    rating,
    userRatingCount,
    googleMapsUri,
    reviews,
    reviewSampleLimit: 5,
    fetchedAt: new Date().toISOString(),
  }
}

export async function getGooglePlaceSnapshot(): Promise<GooglePlaceSnapshot | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const placeId = process.env.GOOGLE_PLACE_ID
  if (!apiKey || !placeId) return null

  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "id,displayName,rating,userRatingCount,reviews,googleMapsUri",
      "Accept-Language": "en-ZA,en",
    },
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    console.error("[google-place] Places API error:", res.status, await res.text().catch(() => ""))
    return null
  }

  const data = (await res.json()) as PlacesResponse
  return normalizePayload(data)
}
